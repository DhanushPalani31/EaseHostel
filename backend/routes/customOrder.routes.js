// ── customOrder.routes.js ─────────────────────────────────────────
import express from 'express';
import {
  createCustomOrder, getMyCustomOrders, getAllCustomOrders,
  getCustomOrderById, updateCustomOrderStatus, cancelCustomOrder,
  getCustomOrderAnalytics
} from '../controllers/v2.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadProductImage } from '../config/cloudinary.js';

export const customOrderRoutes = express.Router();

// Student routes
customOrderRoutes.post('/',
  protect, authorize('student'),
  uploadProductImage.array('referenceImages', 3),
  createCustomOrder
);
customOrderRoutes.get('/my',      protect, authorize('student'), getMyCustomOrders);
customOrderRoutes.delete('/:id',  protect, authorize('student'), cancelCustomOrder);

// Admin routes
customOrderRoutes.get('/',                protect, authorize('admin'), getAllCustomOrders);
customOrderRoutes.get('/analytics',       protect, authorize('admin'), getCustomOrderAnalytics);
customOrderRoutes.get('/:id',            protect, getCustomOrderById);
customOrderRoutes.patch('/:id/status',   protect, authorize('admin'), updateCustomOrderStatus);
