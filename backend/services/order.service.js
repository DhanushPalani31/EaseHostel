import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { Cart, Coupon, Notification } from '../models/secondary.models.js';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_GATEWAY, NOTIFICATION_TYPES } from '../constants/index.js';
import { sendOrderConfirmation } from '../utils/emailUtils.js';
import { sendToUser } from '../config/socket.js';
import User from '../models/User.js';

class OrderService {
  /**
   * Place a new order – validates stock, applies coupon, creates order, clears cart
   */
  async placeOrder(userId, { items, paymentMethod, deliverySlot, deliveryNotes, couponCode }) {
    // 1. Validate items & check stock
    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        const err = new Error(`Product not found: ${item.product}`);
        err.statusCode = 404; throw err;
      }
      if (!product.isAvailable || product.stock < item.quantity) {
        const err = new Error(`Insufficient stock for: ${product.productName}`);
        err.statusCode = 400; throw err;
      }

      enrichedItems.push({
        product:     product._id,
        productName: product.productName,
        image:       product.image,
        price:       product.price,
        quantity:    item.quantity
      });
      subtotal += product.price * item.quantity;
    }

    // 2. Apply coupon if provided
    let discountAmount = 0;
    let appliedCoupon  = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.isUsable && subtotal >= coupon.minOrderAmount) {
        discountAmount = Math.round((subtotal * coupon.discountPercentage) / 100);
        if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        appliedCoupon = coupon;
      }
    }

    const totalAmount = subtotal - discountAmount;

    // 3. Get user delivery address
    const user = await User.findById(userId);

    // 4. Create order
    const order = await Order.create({
      user:        userId,
      items:       enrichedItems,
      subtotal,
      discountAmount,
      couponCode:  appliedCoupon ? appliedCoupon.code : null,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_GATEWAY.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING,
      deliverySlot,
      deliveryNotes,
      deliveryAddress: { block: user.hostelBlock, roomNumber: user.roomNumber },
      statusHistory: [{ status: ORDER_STATUS.PENDING, note: 'Order placed' }]
    });

    // 5. Deduct stock
    for (const item of enrichedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, totalSold: item.quantity }
      });
    }

    // 6. Increment coupon usage
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
    }

    // 7. Clear user's cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalPrice: 0 });

    // 8. Create notification
    await Notification.create({
      user:    userId,
      message: `Your order #${order.invoiceId} has been placed successfully!`,
      type:    NOTIFICATION_TYPES.ORDER,
      link:    `/orders/${order._id}`
    });

    // 9. Send real-time socket event (non-blocking)
    try {
      const io = global.__io;
      if (io) sendToUser(io, userId.toString(), 'notification', {
        message: `Order #${order.invoiceId} placed!`,
        type: 'order'
      });
    } catch (_) { /* socket failure is non-critical */ }

    // 10. Send confirmation email (non-blocking)
    sendOrderConfirmation(user, order).catch(() => {});

    return order;
  }

  /**
   * Get all orders (admin) with filters
   */
  async getAllOrders({ page = 1, limit = 20, status, search }) {
    const filter = {};
    if (status)  filter.orderStatus = status;
    if (search)  filter.invoiceId   = { $regex: search, $options: 'i' };

    const skip  = (page - 1) * limit;
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user', 'name email hostelBlock roomNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return { orders, pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId) {
    return await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Update order status (admin)
   */
  async updateStatus(orderId, status, note, io) {
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error('Order not found'); err.statusCode = 404; throw err;
    }

    order.orderStatus = status;
    order.statusHistory.push({ status, note });

    // Auto-update payment status for COD on delivery
    if (status === ORDER_STATUS.DELIVERED && order.paymentMethod === PAYMENT_GATEWAY.COD) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }

    await order.save();

    // Notify the student
    await Notification.create({
      user:    order.user,
      message: `Your order #${order.invoiceId} is now ${status}.`,
      type:    NOTIFICATION_TYPES.ORDER,
      link:    `/orders/${order._id}`
    });

    if (io) sendToUser(io, order.user.toString(), 'orderUpdate', { status, orderId });

    return order;
  }

  /**
   * Cancel order (student – only when Pending)
   */
  async cancelOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      const err = new Error('Order not found'); err.statusCode = 404; throw err;
    }
    if (order.orderStatus !== ORDER_STATUS.PENDING) {
      const err = new Error('Only pending orders can be cancelled'); err.statusCode = 400; throw err;
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: 'Cancelled by student' });
    await order.save();

    return order;
  }
}

export default new OrderService();
