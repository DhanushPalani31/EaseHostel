// ─── order.routes.js ─────────────────────────────────────────────
import express from 'express';
import { placeOrder, getAllOrders, getUserOrders, updateOrderStatus, cancelOrder } from '../controllers/order.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
export const orderRoutes = express.Router();
orderRoutes.post('/',            protect, authorize('student'), placeOrder);
orderRoutes.get('/',             protect, authorize('admin'),   getAllOrders);
orderRoutes.get('/my-orders',    protect, authorize('student'), getUserOrders);
orderRoutes.patch('/:id/status', protect, authorize('admin'),   updateOrderStatus);
orderRoutes.delete('/:id',       protect, authorize('student'), cancelOrder);

// ─── payment.routes.js ───────────────────────────────────────────
import { createPaymentOrder, verifyPayment, getPaymentHistory, getPaymentAnalytics } from '../controllers/misc.controller.js';
export const paymentRoutes = express.Router();
paymentRoutes.post('/create-order', protect, createPaymentOrder);
paymentRoutes.post('/verify',       protect, verifyPayment);
paymentRoutes.get('/history',       protect, getPaymentHistory);
paymentRoutes.get('/analytics',     protect, authorize('admin'), getPaymentAnalytics);

// ─── cart.routes.js ──────────────────────────────────────────────
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/misc.controller.js';
export const cartRoutes = express.Router();
cartRoutes.get('/',                     protect, getCart);
cartRoutes.post('/',                    protect, addToCart);
cartRoutes.put('/:productId',           protect, updateCartItem);
cartRoutes.delete('/clear',             protect, clearCart);
cartRoutes.delete('/:productId',        protect, removeCartItem);

// ─── notification.routes.js ──────────────────────────────────────
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/misc.controller.js';
export const notificationRoutes = express.Router();
notificationRoutes.get('/',             protect, getNotifications);
notificationRoutes.patch('/read-all',   protect, markAllRead);
notificationRoutes.patch('/:id/read',   protect, markNotificationRead);

// ─── coupon.routes.js ────────────────────────────────────────────
import { createCoupon, getCoupons, validateCoupon, toggleCoupon } from '../controllers/misc.controller.js';
export const couponRoutes = express.Router();
couponRoutes.post('/',           protect, authorize('admin'), createCoupon);
couponRoutes.get('/',            protect, authorize('admin'), getCoupons);
couponRoutes.post('/validate',   protect, validateCoupon);
couponRoutes.patch('/:id/toggle',protect, authorize('admin'), toggleCoupon);

// ─── user.routes.js ──────────────────────────────────────────────
import { getAllUsers, toggleUserStatus, broadcastNotification } from '../controllers/misc.controller.js';
export const userRoutes = express.Router();
userRoutes.get('/',                  protect, authorize('admin'), getAllUsers);
userRoutes.patch('/:id/toggle',      protect, authorize('admin'), toggleUserStatus);
userRoutes.post('/broadcast',        protect, authorize('admin'), broadcastNotification);

// ─── analytics.routes.js ─────────────────────────────────────────
import { getDashboardStats, getMonthlyRevenue, getCategoryAnalytics, getStudentSpending } from '../controllers/misc.controller.js';
export const analyticsRoutes = express.Router();
analyticsRoutes.get('/dashboard',  protect, authorize('admin'), getDashboardStats);
analyticsRoutes.get('/monthly',    protect, authorize('admin'), getMonthlyRevenue);
analyticsRoutes.get('/categories', protect, authorize('admin'), getCategoryAnalytics);
analyticsRoutes.get('/spending',   protect, getStudentSpending);

// ─── wishlist.routes.js ──────────────────────────────────────────
import { getWishlist, toggleWishlist } from '../controllers/misc.controller.js';
export const wishlistRoutes = express.Router();
wishlistRoutes.get('/',    protect, getWishlist);
wishlistRoutes.post('/',   protect, toggleWishlist);
