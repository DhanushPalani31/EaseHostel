import express from 'express';
import { getDashboardStats, getMonthlyRevenue, getCategoryAnalytics, getStudentSpending } from '../controllers/misc.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/dashboard',  protect, authorize('admin'), getDashboardStats);
router.get('/monthly',    protect, authorize('admin'), getMonthlyRevenue);
router.get('/categories', protect, authorize('admin'), getCategoryAnalytics);
router.get('/spending',   protect, getStudentSpending);
export default router;
