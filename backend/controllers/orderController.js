const mongoose = require('mongoose');
const Order = require('../models/Order');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline. Order booking failed.',
    });
  }
  try {
    const { name, phone, product, imageUrl, notes } = req.body;

    if (!name || !phone || !product) {
      return res.status(400).json({
        message: 'Name, phone, and product are required fields.',
      });
    }

    const order = await Order.create({
      name: name.trim(),
      phone: phone.trim(),
      product: product.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Server error creating order.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Admin only)
 */
const getOrders = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline.',
    });
  }
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      message: 'Server error fetching orders.',
      error: error.message,
    });
  }
};

/**
 * @desc    Track orders by customer phone number
 * @route   GET /api/orders/track
 * @access  Public
 */
const trackOrders = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline.',
    });
  }
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        message: 'Phone number parameter is required to track orders.',
      });
    }

    const orders = await Order.find({ phone: phone.trim() }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error tracking orders:', error);
    res.status(500).json({
      message: 'Server error tracking orders.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline.',
    });
  }
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: 'Status value is required.',
      });
    }

    const validStatuses = ['Pending', 'Processing', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      message: 'Server error updating order status.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete an order record
 * @route   DELETE /api/orders/:id
 * @access  Private (Admin only)
 */
const deleteOrder = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline.',
    });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      message: 'Server error deleting order.',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  trackOrders,
  updateOrderStatus,
  deleteOrder,
};
