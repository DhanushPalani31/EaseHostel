import express from 'express';
import { createPaymentOrder, verifyPayment, getPaymentHistory, getPaymentAnalytics } from '../controllers/misc.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify',       protect, verifyPayment);
router.get('/history',       protect, getPaymentHistory);
router.get('/analytics',     protect, authorize('admin'), getPaymentAnalytics);
export default router;
