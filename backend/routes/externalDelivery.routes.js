import express from 'express';
import {
  createExternalDelivery, getMyDeliveries, getDeliveryById,
  getAllDeliveries, updateDeliveryStatus, assignDeliveryStaff,
  verifyDeliveryOTP, cancelDelivery, getDeliveryAnalytics
} from '../controllers/v2.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadProductImage } from '../config/cloudinary.js';

const router = express.Router();

// Student routes
router.post('/',
  protect, authorize('student'),
  uploadProductImage.single('screenshot'),
  createExternalDelivery
);
router.get('/my',            protect, authorize('student'), getMyDeliveries);
router.delete('/:id',        protect, authorize('student'), cancelDelivery);
router.post('/:id/verify-otp', protect, verifyDeliveryOTP);

// Admin routes
router.get('/',                  protect, authorize('admin'), getAllDeliveries);
router.get('/analytics',         protect, authorize('admin'), getDeliveryAnalytics);
router.get('/:id',               protect, getDeliveryById);
router.patch('/:id/status',      protect, authorize('admin'), updateDeliveryStatus);
router.patch('/:id/assign',      protect, authorize('admin'), assignDeliveryStaff);

export default router;
