import Product from '../models/Product.js';
import { PAGINATION } from '../constants/index.js';
import { cloudinary } from '../config/cloudinary.js';

class ProductService {
  /**
   * Get all products with search, filter, sort, and pagination
   */
  async getProducts(query) {
    const {
      page     = PAGINATION.DEFAULT_PAGE,
      limit    = PAGINATION.DEFAULT_LIMIT,
      search   = '',
      category,
      minPrice,
      maxPrice,
      sort     = '-createdAt',
      available
    } = query;

    const filter = {};

    // Full-text search (uses $text index on productName, description, tags)
    if (search) {
      filter.$text = { $search: search };
    }

    if (category)  filter.category    = category;
    if (available === 'true') filter.isAvailable = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort mapping
    const sortMap = {
      popular:  { totalSold: -1 },
      newest:   { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:   { ratings: -1 }
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return {
      products,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit),
        hasMore:    skip + products.length < total
      }
    };
  }

  /**
   * Get single product by ID with full details
   */
  async getProductById(id) {
    const product = await Product.findById(id)
      .populate('reviews.user', 'name profileImage')
      .lean({ virtuals: true });

    if (!product) {
      const err = new Error('Product not found'); err.statusCode = 404; throw err;
    }
    return product;
  }

  /**
   * Create a new product (admin)
   */
  async createProduct(data, imageFile) {
    const productData = { ...data };
    if (imageFile) {
      productData.image          = imageFile.path;
      productData.imagePublicId  = imageFile.filename;
    }
    return await Product.create(productData);
  }

  /**
   * Update product (admin)
   */
  async updateProduct(id, data, imageFile) {
    const product = await Product.findById(id);
    if (!product) {
      const err = new Error('Product not found'); err.statusCode = 404; throw err;
    }

    if (imageFile) {
      // Remove old image from Cloudinary
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }
      data.image         = imageFile.path;
      data.imagePublicId = imageFile.filename;
    }

    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Delete product (admin) – also removes Cloudinary image
   */
  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      const err = new Error('Product not found'); err.statusCode = 404; throw err;
    }
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }
    await product.deleteOne();
  }

  /**
   * Add or update a review for a product
   */
  async addReview(productId, userId, userName, { rating, comment }) {
    const product = await Product.findById(productId);
    if (!product) {
      const err = new Error('Product not found'); err.statusCode = 404; throw err;
    }

    const existingIdx = product.reviews.findIndex(r => r.user.toString() === userId);
    if (existingIdx >= 0) {
      product.reviews[existingIdx].rating  = rating;
      product.reviews[existingIdx].comment = comment;
    } else {
      product.reviews.push({ user: userId, name: userName, rating, comment, verifiedPurchase: true });
    }

    product.recalculateRating();
    await product.save();
    return product;
  }

  /**
   * Get trending products (top 8 by totalSold)
   */
  async getTrending() {
    return await Product.find({ isAvailable: true })
      .sort({ totalSold: -1 })
      .limit(8)
      .lean();
  }

  /**
   * Get low stock products (admin) – stock <= threshold
   */
  async getLowStock(threshold = 10) {
    return await Product.find({ stock: { $lte: threshold } })
      .sort({ stock: 1 })
      .lean();
  }
}

export default new ProductService();
