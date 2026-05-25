import express from 'express';
import { placeOrder, getAllOrders, getUserOrders, updateOrderStatus, cancelOrder } from '../controllers/order.controller.js';
import { downloadInvoice } from '../controllers/invoice.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { orderValidation } from '../validations/order.validation.js';
import { validate } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Student
router.post('/',            protect, authorize('student'), orderValidation, validate, placeOrder);
router.get('/my-orders',    protect, authorize('student'), getUserOrders);
router.delete('/:id',       protect, authorize('student'), cancelOrder);
router.get('/:id/invoice',  protect, downloadInvoice);

// Admin
router.get('/',             protect, authorize('admin'), getAllOrders);
router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;
