import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Never return password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT
    },
    hostelBlock: {
      type: String,
      trim: true
    },
    roomNumber: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    profileImage: {
      type: String,
      default: null
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    refreshToken: {
      type: String,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Virtual: full profile ────────────────────────────────────────
userSchema.virtual('fullAddress').get(function () {
  if (this.hostelBlock && this.roomNumber) {
    return `Block ${this.hostelBlock}, Room ${this.roomNumber}`;
  }
  return null;
});

const User = mongoose.model('User', userSchema);
export default User;
