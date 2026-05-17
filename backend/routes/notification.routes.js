import express from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/misc.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/',           protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markNotificationRead);
export default router;
