import CustomOrder from '../models/CustomOrder.js';
import { Notification } from '../models/secondary.models.js';
import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import { sendToUser, broadcastAll } from '../config/socket.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

class CustomOrderService {
  /**
   * Student creates a custom product request.
   * Architecture note: we capture deliveryAddress from the user profile
   * automatically so student doesn't have to re-enter it every time.
   */
  async create(userId, data, imageFiles = []) {
    const user = await User.findById(userId).lean();

    // Upload reference images to Cloudinary
    const referenceImages = imageFiles.map(f => f.path);

    const customOrder = await CustomOrder.create({
      user:        userId,
      ...data,
      referenceImages,
      deliveryAddress: {
        block:      user.hostelBlock,
        roomNumber: user.roomNumber
      },
      statusHistory: [{
        status: 'Pending',
        note:   'Request submitted by student'
      }]
    });

    // Notify all admins of new custom request
    await Notification.create({
      user:    userId,
      message: `Your custom order request for "${data.productName}" has been submitted!`,
      type:    NOTIFICATION_TYPES.ORDER,
      link:    `/custom-orders`
    });

    return customOrder;
  }

  /**
   * Get all custom orders (admin) with filters.
   * Scalability: indexes on (status, priority, createdAt) make this fast
   * even at 100k+ records.
   */
  async getAll({ page = 1, limit = 20, status, priority, search } = {}) {
    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search)   filter.productName = { $regex: search, $options: 'i' };

    const skip  = (page - 1) * limit;
    const total = await CustomOrder.countDocuments(filter);

    const orders = await CustomOrder.find(filter)
      .populate('user', 'name email hostelBlock roomNumber phoneNumber')
      .sort({ priority: -1, createdAt: -1 })  // urgent first
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return {
      orders,
      pagination: {
        total,
        page:       Number(page),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get custom orders for a specific student.
   */
  async getByUser(userId) {
    return await CustomOrder.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get single custom order by ID.
   */
  async getById(id) {
    const order = await CustomOrder.findById(id)
      .populate('user', 'name email hostelBlock roomNumber phoneNumber')
      .lean();

    if (!order) {
      const err = new Error('Custom order not found');
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  /**
   * Admin updates custom order status.
   * This is the core workflow method — drives the entire fulfilment pipeline.
   */
  async updateStatus(id, { status, adminNote, finalPrice }, adminId, io) {
    const order = await CustomOrder.findById(id);
    if (!order) {
      const err = new Error('Custom order not found');
      err.statusCode = 404;
      throw err;
    }

    order.status = status;
    if (adminNote)   order.adminNote  = adminNote;
    if (finalPrice)  order.finalPrice = finalPrice;

    order.statusHistory.push({
      status,
      note:      adminNote || `Status updated to ${status}`,
      updatedBy: adminId
    });

    await order.save();

    // Real-time notification to student
    const message = this._getStatusMessage(status, order.productName);
    await Notification.create({
      user:    order.user,
      message,
      type:    NOTIFICATION_TYPES.ORDER,
      link:    `/custom-orders`
    });

    if (io) {
      sendToUser(io, order.user.toString(), 'customOrderUpdate', {
        orderId: order._id,
        status,
        message
      });
    }

    return order;
  }

  /**
   * Student cancels their own custom order (only when Pending/Reviewing).
   */
  async cancel(id, userId) {
    const order = await CustomOrder.findOne({ _id: id, user: userId });
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const cancellable = ['Pending', 'Reviewing'];
    if (!cancellable.includes(order.status)) {
      const err = new Error(`Cannot cancel an order with status: ${order.status}`);
      err.statusCode = 400;
      throw err;
    }

    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by student' });
    await order.save();
    return order;
  }

  /**
   * Analytics: most requested products, popular brands, category breakdown.
   * Used in admin analytics dashboard.
   */
  async getAnalytics() {
    const [topProducts, topBrands, byCategory, byStatus, byPriority] = await Promise.all([
      CustomOrder.aggregate([
        { $group: { _id: '$productName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      CustomOrder.aggregate([
        { $match: { brandName: { $exists: true, $ne: '' } } },
        { $group: { _id: '$brandName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      CustomOrder.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      CustomOrder.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      CustomOrder.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    return { topProducts, topBrands, byCategory, byStatus, byPriority };
  }

  // Internal helper: generate student-friendly status messages
  _getStatusMessage(status, productName) {
    const messages = {
      Reviewing:  `Your request for "${productName}" is being reviewed.`,
      Approved:   `Great news! Your request for "${productName}" has been approved.`,
      Purchasing: `We are sourcing "${productName}" for you.`,
      Delivered:  `Your custom order "${productName}" has been delivered!`,
      Rejected:   `Your request for "${productName}" could not be fulfilled.`,
      Cancelled:  `Your request for "${productName}" has been cancelled.`
    };
    return messages[status] || `Your order status updated to ${status}`;
  }
}

export default new CustomOrderService();
