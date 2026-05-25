import DeliveryStaff from '../models/DeliveryStaff.js';
import ExternalDelivery from '../models/ExternalDelivery.js';

class DeliveryStaffService {
  async create(data, photoFile) {
    const existing = await DeliveryStaff.findOne({ phone: data.phone });
    if (existing) {
      const e = new Error('Staff with this phone number already exists');
      e.statusCode = 409; throw e;
    }

    const staffData = { ...data };
    if (photoFile) staffData.photo = photoFile.path;

    return await DeliveryStaff.create(staffData);
  }

  async getAll({ activeOnly = false } = {}) {
    const filter = {};
    if (activeOnly) filter.isActive = true;
    return await DeliveryStaff.find(filter)
      .sort({ isAvailable: -1, rating: -1 })
      .lean({ virtuals: true });
  }

  async getById(id) {
    const staff = await DeliveryStaff.findById(id).lean({ virtuals: true });
    if (!staff) { const e = new Error('Staff not found'); e.statusCode = 404; throw e; }
    return staff;
  }

  async update(id, data) {
    return await DeliveryStaff.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async toggleAvailability(id) {
    const staff = await DeliveryStaff.findById(id);
    if (!staff) { const e = new Error('Staff not found'); e.statusCode = 404; throw e; }
    staff.isAvailable = !staff.isAvailable;
    await staff.save();
    return staff;
  }

  async toggleActive(id) {
    const staff = await DeliveryStaff.findById(id);
    if (!staff) { const e = new Error('Staff not found'); e.statusCode = 404; throw e; }
    staff.isActive = !staff.isActive;
    await staff.save();
    return staff;
  }

  async getStaffDeliveries(staffId, { page = 1, limit = 20 } = {}) {
    const skip  = (page - 1) * limit;
    const total = await ExternalDelivery.countDocuments({ assignedStaff: staffId });

    const deliveries = await ExternalDelivery.find({ assignedStaff: staffId })
      .populate('user', 'name hostelBlock roomNumber phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return { deliveries, pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) } };
  }

  async getPerformanceMetrics() {
    return await DeliveryStaff.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          name:                1,
          phone:               1,
          totalDeliveries:     1,
          completedDeliveries: 1,
          activeDeliveryCount: 1,
          rating:              1,
          isAvailable:         1,
          completionRate: {
            $cond: [
              { $eq: ['$totalDeliveries', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$completedDeliveries', '$totalDeliveries'] },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { completedDeliveries: -1 } }
    ]);
  }

  async delete(id) {
    const staff = await DeliveryStaff.findById(id);
    if (!staff) { const e = new Error('Staff not found'); e.statusCode = 404; throw e; }

    // Check if staff has active deliveries
    const activeCount = await ExternalDelivery.countDocuments({
      assignedStaff: id,
      deliveryStatus: { $nin: ['Delivered', 'Cancelled'] }
    });

    if (activeCount > 0) {
      const e = new Error(`Cannot delete staff with ${activeCount} active deliveries`);
      e.statusCode = 400; throw e;
    }

    await staff.deleteOne();
  }
}

export default new DeliveryStaffService();
