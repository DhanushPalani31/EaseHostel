import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_GATEWAY } from '../constants/index.js';
import { v4 as uuidv4 } from 'uuid';

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  image:       { type: String },
  price:       { type: Number, required: true },
  quantity:    { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: null
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_GATEWAY),
      required: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },
    deliverySlot: {
      type: String
    },
    deliveryNotes: {
      type: String,
      maxlength: 300
    },
    deliveryAddress: {
      block:      { type: String },
      roomNumber: { type: String }
    },
    invoiceId: {
      type: String,
      unique: true,
      default: () => `INV-${uuidv4().split('-')[0].toUpperCase()}`
    },
    razorpayOrderId:  { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    statusHistory: [
      {
        status:    { type: String },
        updatedAt: { type: Date, default: Date.now },
        note:      { type: String }
      }
    ]
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ invoiceId: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
