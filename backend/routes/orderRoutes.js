const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
} = require('../controllers/orderController');
const { protect, adminOnly, studentOnly } = require('../middleware/authMiddleware');

router.post('/', protect, studentOnly, placeOrder);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/user/:id', protect, getUserOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, cancelOrder);

module.exports = router;
