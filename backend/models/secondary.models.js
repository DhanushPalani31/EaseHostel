import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_GATEWAY, NOTIFICATION_TYPES } from '../constants/index.js';

// ─── Cart ─────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  image:       String,
  price:       Number,
  quantity:    { type: Number, default: 1, min: 1 }
});

const cartSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items:      [cartItemSchema],
    totalPrice: { type: Number, default: 0 }
  },
  { timestamps: true }
);

cartSchema.methods.recalcTotal = function () {
  this.totalPrice = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

// ─── Payment ──────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order:          { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    paymentGateway: { type: String, enum: Object.values(PAYMENT_GATEWAY) },
    transactionId:  { type: String },
    razorpayOrderId: String,
    amount:         { type: Number, required: true },
    paymentStatus:  { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING }
  },
  { timestamps: true }
);

// ─── Notification ─────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type:    { type: String, enum: Object.values(NOTIFICATION_TYPES), default: NOTIFICATION_TYPES.SYSTEM },
    isRead:  { type: Boolean, default: false },
    link:    { type: String, default: null } // e.g. /orders/123
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// ─── Coupon ───────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
  {
    code:               { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    maxDiscountAmount:  { type: Number, default: null },
    minOrderAmount:     { type: Number, default: 0 },
    expiryDate:         { type: Date, required: true },
    usageLimit:         { type: Number, default: 100 },
    usedCount:          { type: Number, default: 0 },
    isActive:           { type: Boolean, default: true },
    description:        { type: String }
  },
  { timestamps: true }
);

couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

couponSchema.virtual('isUsable').get(function () {
  return this.isActive && !this.isExpired && this.usedCount < this.usageLimit;
});

export const Cart         = mongoose.model('Cart', cartSchema);
export const Payment      = mongoose.model('Payment', paymentSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const Coupon       = mongoose.model('Coupon', couponSchema);
