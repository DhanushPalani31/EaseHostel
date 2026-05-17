import express from 'express';
import { createCoupon, getCoupons, validateCoupon, toggleCoupon } from '../controllers/misc.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',            protect, authorize('admin'), createCoupon);
router.get('/',             protect, authorize('admin'), getCoupons);
router.post('/validate',    protect, validateCoupon);
router.patch('/:id/toggle', protect, authorize('admin'), toggleCoupon);
export default router;
