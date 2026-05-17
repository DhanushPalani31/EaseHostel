const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Place order
// @route POST /api/orders
// @access Student
const placeOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, deliveryNote } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (!product.isAvailable) {
      return res.status(400).json({ success: false, message: 'Product is currently unavailable.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units available.` });
    }

    const order = await Order.create({
      orderName: product.productName,
      price: product.price,
      quantity: Number(quantity),
      totalAmount: product.price * Number(quantity),
      userId: req.user._id,
      productId,
      roomNumber: req.user.roomNumber || '',
      deliveryNote: deliveryNote || '',
      statusHistory: [{ status: 'Pending', note: 'Order placed' }],
    });

    // Reduce stock
    product.stock -= Number(quantity);
    if (product.stock === 0) product.isAvailable = false;
    await product.save();

    const populated = await Order.findById(order._id)
      .populate('productId', 'productName image category')
      .populate('userId', 'name email roomNumber');

    res.status(201).json({ success: true, message: 'Order placed successfully!', order: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
};

// @desc  Get all orders (admin)
// @route GET /api/orders
// @access Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('userId', 'name email roomNumber phone')
      .populate('productId', 'productName image category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Analytics data
    const analytics = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.json({
      success: true,
      orders,
      analytics,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
};

// @desc  Get user's orders
// @route GET /api/orders/user/:id
// @access Student (own orders) / Admin
const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.id;

    // Students can only see their own orders
    if (req.user.role === 'student' && req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId };
    if (status && status !== 'All') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('productId', 'productName image category price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user orders.' });
  }
};

// @desc  Update order status (admin)
// @route PATCH /api/orders/:id/status
// @access Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${order.status} order.`,
      });
    }

    // Restore stock if cancelling
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock += order.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    await order.save();

    const updated = await Order.findById(order._id)
      .populate('userId', 'name email roomNumber')
      .populate('productId', 'productName image');

    res.json({ success: true, message: 'Order status updated!', order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating order status.' });
  }
};

// @desc  Cancel order
// @route DELETE /api/orders/:id
// @access Student (Pending only) / Admin
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Students can only cancel their own pending orders
    if (req.user.role === 'student') {
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (order.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending orders can be cancelled.',
        });
      }
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order already cancelled.' });
    }

    // Restore stock
    const product = await Product.findById(order.productId);
    if (product) {
      product.stock += order.quantity;
      product.isAvailable = true;
      await product.save();
    }

    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Order cancelled' });
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling order.' });
  }
};

// @desc  Get order analytics (admin)
// @route GET /api/orders/analytics
// @access Admin
const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$productId', orderCount: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.productName',
          image: '$product.image',
          category: '$product.category',
          orderCount: 1,
          revenue: 1,
        },
      },
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'name roomNumber')
      .populate('productId', 'productName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown,
        topProducts,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching analytics.' });
  }
};

module.exports = { placeOrder, getAllOrders, getUserOrders, updateOrderStatus, cancelOrder, getAnalytics };
