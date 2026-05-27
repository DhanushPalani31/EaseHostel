
import asyncHandler from '../utils/asyncHandler.js';
import paymentService from '../services/payment.service.js';
import cartService from '../services/cart.service.js';
import analyticsService from '../services/analytics.service.js';
import { Notification, Coupon } from '../models/secondary.models.js';
import User from '../models/User.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';

// PAYMENT
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const data = await paymentService.createRazorpayOrder(orderId, req.user._id);
  sendSuccess(res, 200, 'Payment order created', data);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await paymentService.verifyPayment(req.body);
  sendSuccess(res, 200, 'Payment verified', { order });
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await paymentService.getUserPayments(req.user._id);
  sendSuccess(res, 200, 'Payment history', { payments });
});

export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentAnalytics();
  sendSuccess(res, 200, 'Payment analytics', data);
});

// CART
export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  sendSuccess(res, 200, 'Cart fetched', { cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user._id, productId, quantity);
  sendSuccess(res, 200, 'Added to cart', { cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await cartService.updateQuantity(req.user._id, req.params.productId, quantity);
  sendSuccess(res, 200, 'Cart updated', { cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
  sendSuccess(res, 200, 'Item removed', { cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  sendSuccess(res, 200, 'Cart cleared', {});
});

// NOTIFICATIONS
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  sendSuccess(res, 200, 'Notifications', { notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  sendSuccess(res, 200, 'Notification marked as read', {});
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendSuccess(res, 200, 'All notifications marked as read', {});
});

// COUPONS
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  sendSuccess(res, 201, 'Coupon created', { coupon });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  sendSuccess(res, 200, 'Coupons', { coupons });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon || coupon.isExpired || coupon.usedCount >= coupon.usageLimit) {
    const err = new Error('Invalid or expired coupon'); err.statusCode = 400; throw err;
  }
  if (orderAmount < coupon.minOrderAmount) {
    const err = new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`); err.statusCode = 400; throw err;
  }

  let discount = Math.round((orderAmount * coupon.discountPercentage) / 100);
  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

  sendSuccess(res, 200, 'Coupon applied', {
    discount,
    discountPercentage: coupon.discountPercentage,
    code: coupon.code
  });
});

export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { const err = new Error('Coupon not found'); err.statusCode = 404; throw err; }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  sendSuccess(res, 200, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, { coupon });
});

// WISHLIST
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'productName price image category ratings isAvailable')
    .lean();
  sendSuccess(res, 200, 'Wishlist', { wishlist: user.wishlist || [] });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(productId);

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }
  await user.save();
  sendSuccess(res, 200, idx > -1 ? 'Removed from wishlist' : 'Added to wishlist', {
    wishlist: user.wishlist
  });
});

// ANALYTICS
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  sendSuccess(res, 200, 'Dashboard stats', stats);
});

export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const data = await analyticsService.getMonthlyRevenue();
  sendSuccess(res, 200, 'Monthly revenue', { data });
});

export const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCategoryAnalytics();
  sendSuccess(res, 200, 'Category analytics', { data });
});

export const getStudentSpending = asyncHandler(async (req, res) => {
  const data = await analyticsService.getStudentSpending(req.user._id);
  sendSuccess(res, 200, 'Spending analytics', { data });
});

// USER MANAGEMENT (admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' })
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, 200, 'Users', { users });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }
  user.isActive = !user.isActive;
  await user.save();
  sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, {});
});

export const broadcastNotification = asyncHandler(async (req, res) => {
  const { message, type } = req.body;
  const users = await User.find({ role: 'student', isActive: true }).select('_id').lean();

  const notifications = users.map(u => ({
    user: u._id, message, type: type || 'system'
  }));
  await Notification.insertMany(notifications);

  const io = req.app.get('io');
  if (io) io.emit('notification', { message, type });

  sendSuccess(res, 200, `Broadcast sent to ${users.length} students`, {});
});
