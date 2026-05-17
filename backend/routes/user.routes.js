import express from 'express';
import { getAllUsers, toggleUserStatus, broadcastNotification } from '../controllers/misc.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/',             protect, authorize('admin'), getAllUsers);
router.patch('/:id/toggle', protect, authorize('admin'), toggleUserStatus);
router.post('/broadcast',   protect, authorize('admin'), broadcastNotification);
export default router;
