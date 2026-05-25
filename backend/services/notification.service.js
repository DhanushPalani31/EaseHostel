import { Notification } from '../models/secondary.models.js';
import User from '../models/User.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';
import { sendToUser, broadcastAll } from '../config/socket.js';

class NotificationService {
  /**
   * Create a single notification for a user and push it via socket
   */
  async createAndPush(io, { userId, message, type = NOTIFICATION_TYPES.SYSTEM, link = null }) {
    const notification = await Notification.create({ user: userId, message, type, link });

    if (io) {
      sendToUser(io, userId.toString(), 'notification', {
        _id:     notification._id,
        message,
        type,
        link,
        isRead:  false,
        createdAt: notification.createdAt
      });
    }

    return notification;
  }

  /**
   * Broadcast a notification to ALL active students
   */
  async broadcastToStudents(io, { message, type = NOTIFICATION_TYPES.SYSTEM }) {
    const students = await User.find({ role: 'student', isActive: true }).select('_id').lean();

    const docs = students.map(s => ({ user: s._id, message, type }));
    await Notification.insertMany(docs);

    if (io) {
      broadcastAll(io, 'notification', { message, type });
    }

    return students.length;
  }

  /**
   * Get paginated notifications for a user
   */
  async getUserNotifications(userId, limit = 50) {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return { notifications, unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllRead(userId) {
    return await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }
}

export default new NotificationService();
