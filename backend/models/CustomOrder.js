import mongoose from 'mongoose';

/**
 * CustomOrder – student-submitted request for a product not in inventory.
 *
 * Schema Design Decisions:
 * - estimatedBudget stored as { min, max } range for flexibility
 * - priority enum allows admin to triage urgent requests first
 * - statusHistory array gives full audit trail like Order model (consistent pattern)
 * - referenceImages array supports multiple image uploads
 * - orderType distinguishes whether HostelEase fulfils internally or student
 *   ordered externally and just needs pickup/delivery
 */

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  note:      { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const customOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true
    },
    productName: {
      type:     String,
      required: [true, 'Product name is required'],
      trim:     true,
      maxlength: 120
    },
    brandName: {
      type:  String,
      trim:  true
    },
    category: {
      type: String,
      enum: ['Snacks', 'Stationery', 'Toiletries', 'Drinks', 'Instant Foods',
             'Daily Essentials', 'Personal Care', 'Clothing', 'Electronics', 'Other'],
      default: 'Other'
    },
    quantity: {
      type:    Number,
      default: 1,
      min:     1
    },
    referenceImages: [{ type: String }],  // Cloudinary URLs
    notes: {
      type:      String,
      maxlength: 500
    },
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    estimatedBudget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    // Internal vs External ordering
    orderType: {
      type:    String,
      enum:    ['internal', 'external'],
      default: 'internal'
    },
    status: {
      type:    String,
      enum:    ['Pending', 'Reviewing', 'Approved', 'Purchasing', 'Delivered', 'Rejected', 'Cancelled'],
      default: 'Pending'
    },
    adminNote: {
      type: String   // Admin's response/note to student
    },
    finalPrice: {
      type: Number,  // Set by admin after sourcing the product
      default: null
    },
    paymentStatus: {
      type:    String,
      enum:    ['Unpaid', 'Paid', 'Refunded'],
      default: 'Unpaid'
    },
    statusHistory: [statusHistorySchema],
    deliveryAddress: {
      block:      String,
      roomNumber: String
    }
  },
  { timestamps: true }
);

// Indexes for common query patterns
customOrderSchema.index({ user: 1, createdAt: -1 });
customOrderSchema.index({ status: 1, priority: -1 });
customOrderSchema.index({ createdAt: -1 });

const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
export default CustomOrder;
