const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc  Create product
// @route POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  try {
    const { productName, price, description, category, stock } = req.body;

    if (!productName || !price) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const productData = {
      productName,
      price: Number(price),
      description,
      category,
      stock: stock !== undefined ? Number(stock) : 100,
      createdBy: req.user._id,
    };

    if (req.file) {
      productData.image = req.file.path;
      productData.imagePublicId = req.file.filename;
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, message: 'Product created successfully!', product });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating product.' });
  }
};

// @desc  Get all products
// @route GET /api/products
// @access Public
const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, available } = req.query;

    const query = {};
    if (category && category !== 'All') query.category = category;
    if (available === 'true') query.isAvailable = true;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products.' });
  }
};

// @desc  Get single product
// @route GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product.' });
  }
};

// @desc  Update product
// @route PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { productName, price, description, category, stock, isAvailable } = req.body;

    if (productName !== undefined) product.productName = productName;
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true' || isAvailable === true;

    if (req.file) {
      // Delete old image from cloudinary
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }
      product.image = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    await product.save();

    res.json({ success: true, message: 'Product updated successfully!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating product.' });
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Delete image from cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting product.' });
  }
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
