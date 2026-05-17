import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

export const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });
};

export const transporter = createTransporter();

// Verify connection on startup
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info('✅ Email transporter ready');
  } catch (err) {
    logger.warn(`⚠️  Email transporter not ready: ${err.message}`);
  }
};
