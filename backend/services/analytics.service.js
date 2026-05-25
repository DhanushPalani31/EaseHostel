import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { Payment } from '../models/secondary.models.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants/index.js';

class AnalyticsService {
  /**
   * Admin dashboard summary – all critical KPIs in one aggregation pass
   */
  async getDashboardStats() {
    const [
      revenueData,
      orderCounts,
      totalUsers,
      topProducts,
      lowStock,
      recentOrders,
      weeklyRevenue
    ] = await Promise.all([
      // Total revenue from paid orders
      Payment.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),

      // Order counts by status
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),

      User.countDocuments({ role: 'student' }),

      // Top 5 selling products
      Product.find().sort({ totalSold: -1 }).limit(5)
        .select('productName totalSold price image category').lean(),

      // Products with low stock (<= 10)
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 })
        .select('productName stock category').lean(),

      // 5 most recent orders
      Order.find().populate('user', 'name hostelBlock roomNumber')
        .sort({ createdAt: -1 }).limit(5).lean(),

      // Weekly revenue (last 7 days)
      Payment.aggregate([
        {
          $match: {
            paymentStatus: PAYMENT_STATUS.PAID,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const statusMap = {};
    orderCounts.forEach(o => { statusMap[o._id] = o.count; });

    return {
      totalRevenue:   revenueData[0]?.total   || 0,
      totalOrdersPaid: revenueData[0]?.count  || 0,
      totalStudents:  totalUsers,
      pendingOrders:  statusMap[ORDER_STATUS.PENDING]    || 0,
      processingOrders: statusMap[ORDER_STATUS.PROCESSING] || 0,
      deliveredOrders: statusMap[ORDER_STATUS.DELIVERED]  || 0,
      cancelledOrders: statusMap[ORDER_STATUS.CANCELLED]  || 0,
      topProducts,
      lowStock,
      recentOrders,
      weeklyRevenue
    };
  }

  /**
   * Monthly revenue chart – last 12 months
   */
  async getMonthlyRevenue() {
    const data = await Payment.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    return data;
  }

  /**
   * Category-wise sales breakdown
   */
  async getCategoryAnalytics() {
    return await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from:         'products',
          localField:   'items.product',
          foreignField: '_id',
          as:           'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id:      '$productInfo.category',
          totalQty: { $sum: '$items.quantity' },
          revenue:  { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
  }

  /**
   * Student spending analytics for their profile page
   */
  async getStudentSpending(userId) {
    const data = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id:   { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          spent: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);
    return data.reverse();
  }
}

export default new AnalyticsService();
