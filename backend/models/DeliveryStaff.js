import mongoose from 'mongoose';

/**
 * DeliveryStaff – hostel delivery personnel model.
 *
 * Design Decision: DeliveryStaff is separate from User model.
 * Reasons:
 * 1. Staff don't log in to the student-facing app
 * 2. Different auth flow (admin manages staff, not self-registration)
 * 3. Staff-specific fields (activeDeliveries, performance metrics)
 * 4. Avoids polluting the User model with staff-only fields
 * 5. Cleaner RBAC — staff are managed entities, not platform users
 */
const deliveryStaffSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Staff name is required'],
      trim:     true
    },
    phone: {
      type:     String,
      required: [true, 'Phone number is required'],
      unique:   true,
      trim:     true
    },
    email: {
      type:  String,
      trim:  true,
      lowercase: true
    },
    photo: {
      type: String  // Cloudinary URL
    },
    hostelZone: {
      type:    String,
      // Which hostel blocks this staff covers: "A,B,C" or "All"
      default: 'All'
    },
    isActive: {
      type:    Boolean,
      default: true
    },
    isAvailable: {
      type:    Boolean,
      default: true   // false when at capacity
    },
    maxConcurrentDeliveries: {
      type:    Number,
      default: 5
    },

    // Live counters — updated on assignment/completion
    activeDeliveryCount: {
      type:    Number,
      default: 0,
      min:     0
    },

    // Performance metrics — updated on each delivery
    totalDeliveries:   { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 }, // minutes
    rating:            { type: Number, default: 0, min: 0, max: 5 }
  },
  { timestamps: true }
);

// Virtual: completion rate
deliveryStaffSchema.virtual('completionRate').get(function () {
  if (this.totalDeliveries === 0) return 0;
  return +((this.completedDeliveries / this.totalDeliveries) * 100).toFixed(1);
});

const DeliveryStaff = mongoose.model('DeliveryStaff', deliveryStaffSchema);
export default DeliveryStaff;
