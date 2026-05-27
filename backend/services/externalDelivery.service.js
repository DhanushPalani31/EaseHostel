import ExternalDelivery from '../models/ExternalDelivery.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import { Notification } from '../models/secondary.models.js';
import { sendToUser } from '../config/socket.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';
import crypto from 'crypto';

class ExternalDeliveryService {
  /**
   * Student submits a parcel pickup request.
   */
  async create(userId, data, screenshotFile) {
    const screenshot = screenshotFile?.path || null;

    // Generate 4-digit OTP for delivery confirmation
    const otp = crypto.randomInt(1000, 9999).toString();

    const delivery = await ExternalDelivery.create({
      user: userId,
      ...data,
      screenshot,
      otp,
      deliveryFee: this._calculateDeliveryFee(data.platformName),
      statusHistory: [{
        status:    'Requested',
        note:      'Pickup request submitted',
        timestamp: new Date()
      }]
    });

    // Notify student
    await Notification.create({
      user:    userId,
      message: `Your parcel pickup request from ${data.platformName} has been submitted.`,
      type:    NOTIFICATION_TYPES.DELIVERY,
      link:    `/parcel-tracking/${delivery._id}`
    });

    return delivery;
  }

  /**
   * Get all external deliveries for admin with filters.
   */
  async getAll({ page = 1, limit = 20, status, staffId } = {}) {
    const filter = {};
    if (status)  filter.deliveryStatus = status;
    if (staffId) filter.assignedStaff  = staffId;

    const skip  = (page - 1) * limit;
    const total = await ExternalDelivery.countDocuments(filter);

    const deliveries = await ExternalDelivery.find(filter)
      .populate('user',          'name email hostelBlock roomNumber phoneNumber')
      .populate('assignedStaff', 'name phone isAvailable')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return {
      deliveries,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Get deliveries for a specific student.
   */
  async getByUser(userId) {
    return await ExternalDelivery.find({ user: userId })
      .populate('assignedStaff', 'name phone photo')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get single delivery by ID (used for tracking page).
   */
  async getById(id) {
    const delivery = await ExternalDelivery.findById(id)
      .populate('user',          'name email hostelBlock roomNumber phoneNumber')
      .populate('assignedStaff', 'name phone photo rating')
      .lean();

    if (!delivery) {
      const err = new Error('Delivery not found');
      err.statusCode = 404;
      throw err;
    }
    return delivery;
  }

  /**
   * Admin/staff updates delivery status.
   * Core workflow driver — handles all status transitions.
   */
  async updateStatus(id, { status, note, estimatedDeliveryTime, deliveryProof }, updatedBy, io) {
    const delivery = await ExternalDelivery.findById(id);
    if (!delivery) {
      const err = new Error('Delivery not found');
      err.statusCode = 404;
      throw err;
    }

    // Validate state machine transition
    this._validateTransition(delivery.deliveryStatus, status);

    delivery.deliveryStatus = status;

    if (estimatedDeliveryTime) delivery.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    if (deliveryProof)         delivery.deliveryProof         = deliveryProof;

    delivery.statusHistory.push({
      status,
      note:      note || `Status updated to ${status}`,
      timestamp: new Date(),
      updatedBy
    });

    // On delivery completion, update staff metrics
    if (status === 'Delivered') {
      await this._completeDelivery(delivery);
    }

    await delivery.save();

    // Real-time update to student
    const message = this._getStatusMessage(status, delivery.platformName);

    await Notification.create({
      user:    delivery.user,
      message,
      type:    NOTIFICATION_TYPES.DELIVERY,
      link:    `/parcel-tracking/${delivery._id}`
    });

    if (io) {
      sendToUser(io, delivery.user.toString(), 'deliveryUpdate', {
        deliveryId: delivery._id,
        status,
        message,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime
      });
    }

    return delivery;
  }

  /**
   * Admin assigns a delivery staff member to a pickup request.
   * Checks staff availability before assigning.
   */
  async assignStaff(deliveryId, staffId, io) {
    const [delivery, staff] = await Promise.all([
      ExternalDelivery.findById(deliveryId),
      DeliveryStaff.findById(staffId)
    ]);

    if (!delivery) { const e = new Error('Delivery not found'); e.statusCode = 404; throw e; }
    if (!staff)    { const e = new Error('Staff not found');    e.statusCode = 404; throw e; }

    if (!staff.isAvailable) {
      const e = new Error(`${staff.name} is not available`);
      e.statusCode = 400;
      throw e;
    }

    if (staff.activeDeliveryCount >= staff.maxConcurrentDeliveries) {
      const e = new Error(`${staff.name} has reached maximum delivery capacity`);
      e.statusCode = 400;
      throw e;
    }

    delivery.assignedStaff = staffId;

    // Only auto-accept if still in Requested state
    if (delivery.deliveryStatus === 'Requested') {
      delivery.deliveryStatus = 'Accepted';
      delivery.statusHistory.push({
        status: 'Accepted',
        note:   `Assigned to ${staff.name}`,
        timestamp: new Date()
      });
    }

    await delivery.save();

    // Increment staff active count
    await DeliveryStaff.findByIdAndUpdate(staffId, {
      $inc: { activeDeliveryCount: 1, totalDeliveries: 1 }
    });

    // Notify student
    const message = `${staff.name} has been assigned to pick up your parcel from ${delivery.platformName}.`;
    await Notification.create({
      user:    delivery.user,
      message,
      type:    NOTIFICATION_TYPES.DELIVERY,
      link:    `/parcel-tracking/${delivery._id}`
    });

    if (io) sendToUser(io, delivery.user.toString(), 'deliveryUpdate', { status: 'Accepted', message });

    return delivery;
  }

  /**
   * Verify delivery OTP — student confirms receipt.
   */
  async verifyOTP(deliveryId, enteredOtp) {
    const delivery = await ExternalDelivery.findById(deliveryId).select('+otp');
    if (!delivery) {
      const e = new Error('Delivery not found'); e.statusCode = 404; throw e;
    }

    if (delivery.otp !== enteredOtp) {
      const e = new Error('Invalid OTP'); e.statusCode = 400; throw e;
    }

    delivery.deliveryStatus = 'Delivered';
    delivery.statusHistory.push({
      status: 'Delivered', note: 'Verified via OTP', timestamp: new Date()
    });

    await this._completeDelivery(delivery);
    await delivery.save();
    return delivery;
  }

  /**
   * Student cancels pickup request (only when Requested).
   */
  async cancel(id, userId) {
    const delivery = await ExternalDelivery.findOne({ _id: id, user: userId });
    if (!delivery) { const e = new Error('Not found'); e.statusCode = 404; throw e; }

    if (delivery.deliveryStatus !== 'Requested') {
      const e = new Error('Can only cancel requests in Requested status');
      e.statusCode = 400; throw e;
    }

    delivery.deliveryStatus = 'Cancelled';
    delivery.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by student', timestamp: new Date() });
    await delivery.save();
    return delivery;
  }

  /**
   * Analytics for admin delivery dashboard.
   */
  async getAnalytics() {
    const [byStatus, byPlatform, avgDeliveryTime, recentActivity] = await Promise.all([
      ExternalDelivery.aggregate([
        { $group: { _id: '$deliveryStatus', count: { $sum: 1 } } }
      ]),
      ExternalDelivery.aggregate([
        { $group: { _id: '$platformName', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 10 }
      ]),
      ExternalDelivery.aggregate([
        { $match: { deliveryStatus: 'Delivered' } },
        {
          $project: {
            duration: {
              $divide: [
                { $subtract: ['$updatedAt', '$createdAt'] },
                60000 // convert ms to minutes
              ]
            }
          }
        },
        { $group: { _id: null, avg: { $avg: '$duration' } } }
      ]),
      ExternalDelivery.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name hostelBlock roomNumber')
        .populate('assignedStaff', 'name')
        .lean()
    ]);

    return {
      byStatus,
      byPlatform,
      avgDeliveryTime: avgDeliveryTime[0]?.avg?.toFixed(1) || 0,
      recentActivity
    };
  }

  // ── Private helpers ───────────────────────────────────────────────

  _calculateDeliveryFee(platformName) {
    // Dynamic pricing: premium platforms charged more
    const premiumPlatforms = ['Amazon', 'Flipkart', 'Myntra'];
    return premiumPlatforms.includes(platformName) ? 30 : 20;
  }

  _validateTransition(currentStatus, newStatus) {
    const transitions = {
      'Requested':       ['Accepted', 'Cancelled'],
      'Accepted':        ['Waiting at Gate', 'Cancelled'],
      'Waiting at Gate': ['Picked Up', 'Cancelled'],
      'Picked Up':       ['Out for Delivery'],
      'Out for Delivery':['Delivered'],
      'Delivered':       [],
      'Cancelled':       []
    };

    if (!transitions[currentStatus]?.includes(newStatus)) {
      const e = new Error(`Cannot transition from "${currentStatus}" to "${newStatus}"`);
      e.statusCode = 400;
      throw e;
    }
  }

  async _completeDelivery(delivery) {
    if (delivery.assignedStaff) {
      await DeliveryStaff.findByIdAndUpdate(delivery.assignedStaff, {
        $inc: { completedDeliveries: 1, activeDeliveryCount: -1 }
      });
    }
  }

  _getStatusMessage(status, platformName) {
    const messages = {
      'Accepted':        `Your parcel pickup from ${platformName} has been accepted.`,
      'Waiting at Gate': `Your ${platformName} parcel is waiting at the gate.`,
      'Picked Up':       `Your ${platformName} parcel has been picked up!`,
      'Out for Delivery': `Your ${platformName} parcel is on its way to your room!`,
      'Delivered':       `Your ${platformName} parcel has been delivered. ✅`,
      'Cancelled':       `Your pickup request for ${platformName} parcel was cancelled.`
    };
    return messages[status] || `Delivery status updated: ${status}`;
  }
}

export default new ExternalDeliveryService();
