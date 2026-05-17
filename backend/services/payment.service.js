import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { Payment, Notification } from '../models/secondary.models.js';
import { PAYMENT_STATUS, PAYMENT_GATEWAY, ORDER_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';

// ── Lazy Razorpay instance ─────────────────────────────────────────
// Do NOT instantiate at module load time — dotenv may not have run yet.
// Call getRazorpay() inside each method instead.
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
    }
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return _razorpay;
};

class PaymentService {
  /**
   * Create a Razorpay order for an existing Order document
   */
  async createRazorpayOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      const err = new Error('Order not found'); err.statusCode = 404; throw err;
    }

    const razorpayOrder = await getRazorpay().orders.create({
      amount:   Math.round(order.totalAmount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt:  order.invoiceId,
      notes:    { orderId: order._id.toString(), userId: userId.toString() }
    });

    // Persist the razorpay order id
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Create a payment record in pending state
    await Payment.create({
      user:           userId,
      order:          orderId,
      paymentGateway: PAYMENT_GATEWAY.RAZORPAY,
      razorpayOrderId: razorpayOrder.id,
      amount:         order.totalAmount,
      paymentStatus:  PAYMENT_STATUS.PENDING
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID
    };
  }

  /**
   * Verify Razorpay payment signature (HMAC SHA256)
   * This is the critical security step – never skip it.
   */
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }) {
    // 1. Verify signature
    const body      = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      const err = new Error('Payment verification failed – invalid signature');
      err.statusCode = 400; throw err;
    }

    // 2. Update Order
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error('Order not found'); err.statusCode = 404; throw err;
    }

    order.paymentStatus      = PAYMENT_STATUS.PAID;
    order.orderStatus        = ORDER_STATUS.PROCESSING;
    order.razorpayPaymentId  = razorpayPaymentId;
    order.statusHistory.push({ status: ORDER_STATUS.PROCESSING, note: 'Payment verified' });
    await order.save();

    // 3. Update Payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { transactionId: razorpayPaymentId, paymentStatus: PAYMENT_STATUS.PAID }
    );

    // 4. Create notification
    await Notification.create({
      user:    order.user,
      message: `Payment of ₹${order.totalAmount} confirmed for order #${order.invoiceId}`,
      type:    NOTIFICATION_TYPES.PAYMENT,
      link:    `/orders/${order._id}`
    });

    return order;
  }

  /**
   * Get payment history for a user
   */
  async getUserPayments(userId) {
    return await Payment.find({ user: userId })
      .populate('order', 'invoiceId totalAmount orderStatus')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Analytics: total revenue, by gateway, by day (admin)
   */
  async getPaymentAnalytics() {
    const [totalRevenue, byGateway, dailyRevenue] = await Promise.all([
      Payment.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: '$paymentGateway', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        {
          $group: {
            _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ])
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders:  totalRevenue[0]?.count || 0,
      byGateway,
      dailyRevenue: dailyRevenue.reverse()
    };
  }
}

export default new PaymentService();