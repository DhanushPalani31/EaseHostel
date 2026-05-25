import mongoose from 'mongoose';

/**
 * ExternalDelivery – student ordered from Amazon/Flipkart/Zepto etc.
 * HostelEase handles gate pickup + hostel room delivery.
 *
 * Schema Design Decisions:
 * - deliveryStatus follows a linear state machine (Requested → Delivered)
 *   making it easy to build a visual tracker in the frontend
 * - assignedStaff ref to DeliveryStaff (not User) keeps roles clean
 * - screenshot stored as Cloudinary URL – students upload order confirmation
 * - statusHistory for real-time UI updates and audit trail
 * - pickupLocation flexible string handles "Main Gate", "Security Cabin" etc.
 * - deliveryFee supports V2 monetisation of delivery service
 */

const deliveryStatusValues = [
  'Requested',
  'Accepted',
  'Waiting at Gate',
  'Picked Up',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  note:      { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const externalDeliverySchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    // Platform details
    platformName: {
      type:     String,
      required: [true, 'Platform name is required'],
      trim:     true
      // e.g. "Amazon", "Flipkart", "Zepto", "Swiggy Instamart"
    },
    trackingId: {
      type:  String,
      trim:  true
    },
    screenshot: {
      type: String  // Cloudinary URL of order confirmation screenshot
    },
    parcelDescription: {
      type:      String,
      maxlength: 500,
      trim:      true
    },

    // Pickup details
    pickupLocation: {
      type:    String,
      default: 'Main Gate'
      // "Main Gate", "Security Cabin", "Back Gate" etc.
    },
    expectedArrival: {
      type: Date
      // When the parcel is expected to arrive at gate
    },

    // Delivery destination
    hostelBlock:  { type: String, trim: true },
    roomNumber:   { type: String, trim: true },
    contactNumber:{ type: String, trim: true },

    // Workflow
    deliveryStatus: {
      type:    String,
      enum:    deliveryStatusValues,
      default: 'Requested'
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'DeliveryStaff',
      default: null
    },
    deliveryFee: {
      type:    Number,
      default: 20   // ₹20 base delivery charge
    },
    paymentStatus: {
      type:    String,
      enum:    ['Unpaid', 'Paid'],
      default: 'Unpaid'
    },
    deliveryProof: {
      type: String  // Photo taken at time of delivery (Cloudinary URL)
    },
    deliveryNotes: {
      type:      String,
      maxlength: 300
    },
    otp: {
      type:   String,   // 4-digit OTP for delivery confirmation
      select: false
    },
    statusHistory: [statusHistorySchema],
    estimatedDeliveryTime: {
      type: Date  // ETA set by admin/staff
    }
  },
  { timestamps: true }
);

// Compound indexes for admin dashboard queries
externalDeliverySchema.index({ deliveryStatus: 1, createdAt: -1 });
externalDeliverySchema.index({ user: 1, createdAt: -1 });
externalDeliverySchema.index({ assignedStaff: 1, deliveryStatus: 1 });

const ExternalDelivery = mongoose.model('ExternalDelivery', externalDeliverySchema);
export default ExternalDelivery;
