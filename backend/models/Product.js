import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES } from '../constants/index.js';

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    verifiedPurchase: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name too long']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description too long']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: PRODUCT_CATEGORIES
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      default: null // For showing discount
    },
    image: {
      type: String,
      default: null
    },
    imagePublicId: {
      type: String,
      default: null
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [reviewSchema],
    tags: [{ type: String, trim: true }],
    unit: {
      type: String,
      default: 'piece' // piece, ml, g, pack, etc.
    },
    brand: {
      type: String,
      trim: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    totalSold: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Indexes for fast search & filter ─────────────────────────────
productSchema.index({ productName: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isAvailable: 1, stock: 1 });
productSchema.index({ totalSold: -1 });

// ─── Virtual: discount percentage ─────────────────────────────────
productSchema.virtual('discountPercent').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// ─── Recalculate average rating on review save ────────────────────
productSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.ratings    = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.ratings    = +(total / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
