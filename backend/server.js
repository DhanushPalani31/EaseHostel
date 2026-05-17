
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

import authRoutes         from './routes/auth.routes.js';
import productRoutes      from './routes/product.routes.js';
import orderRoutes        from './routes/order.routes.js';
import paymentRoutes      from './routes/payment.routes.js';
import cartRoutes         from './routes/cart.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import couponRoutes       from './routes/coupon.routes.js';
import userRoutes         from './routes/user.routes.js';
import analyticsRoutes    from './routes/analytics.routes.js';
import wishlistRoutes     from './routes/wishlist.routes.js';

const app = express();
const server = http.createServer(app);


const io = initSocket(server);
app.set('io', io);


connectDB();


app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  'https://easyhostelservice.netlify.app',
  'https://easehostel.netlify.app',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log('CORS blocked origin:', origin);
    return callback(null, true); 
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.options('*', cors());


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'HostelEase API', timestamp: new Date().toISOString() });
});

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons',       couponRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/wishlist',      wishlistRoutes);


app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 HostelEase server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default app;