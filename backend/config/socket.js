import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

// Map of userId → socketId for targeted notifications
const connectedUsers = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Student/Admin registers themselves on connect
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} registered to socket ${socket.id}`);
    });

    // Admin can broadcast to all students
    socket.on('broadcast', (data) => {
      io.emit('notification', data);
    });

    socket.on('disconnect', () => {
      // Remove user from map on disconnect
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Utility: send notification to a specific user
export const sendToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Utility: broadcast to all connected clients
export const broadcastAll = (io, event, data) => {
  io.emit(event, data);
};
