import express from 'express';
import {
  createDeliveryStaff, getAllDeliveryStaff, getDeliveryStaffById,
  updateDeliveryStaff, toggleStaffAvailability, toggleStaffActive,
  getStaffDeliveries, getStaffPerformance, deleteDeliveryStaff
} from '../controllers/v2.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadProfileImage } from '../config/cloudinary.js';

const router = express.Router();

router.post('/',
  protect, authorize('admin'),
  uploadProfileImage.single('photo'),
  createDeliveryStaff
);
router.get('/',                    protect, getAllDeliveryStaff);
router.get('/performance',         protect, authorize('admin'), getStaffPerformance);
router.get('/:id',                 protect, getDeliveryStaffById);
router.put('/:id',                 protect, authorize('admin'), updateDeliveryStaff);
router.patch('/:id/availability',  protect, authorize('admin'), toggleStaffAvailability);
router.patch('/:id/active',        protect, authorize('admin'), toggleStaffActive);
router.get('/:id/deliveries',      protect, authorize('admin'), getStaffDeliveries);
router.delete('/:id',              protect, authorize('admin'), deleteDeliveryStaff);

export default router;
