const mongoose = require('mongoose');
const Order = require('../models/Order');
const sendOrderEmail = require('../utils/sendEmail');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

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
    const { name, phone, product, imageUrl, notes, productId, email, address, customSize, desiredPrice } = req.body;

    if (!name || !phone || !product || !email || !address) {
      return res.status(400).json({
        message: 'Name, phone, product, email, and address are required fields.',
      });
    }

    let finalImageUrl = imageUrl ? imageUrl.trim() : undefined;
    let finalImagePublicId = undefined;

    // Handle reference image file upload
    if (req.file) {
      try {
        console.log('Uploading customer reference image to Cloudinary:', req.file.path);
        const uploadResult = await uploadToCloudinary(req.file.path, 'ld_orders');
        finalImageUrl = uploadResult.url;
        finalImagePublicId = uploadResult.publicId;
      } catch (uploadErr) {
        console.error('Failed to upload customer reference image:', uploadErr.message);
        return res.status(500).json({
          message: 'Failed to upload reference image. Please try again.',
          error: uploadErr.message,
        });
      }
    }

    const order = await Order.create({
      name: name.trim(),
      phone: phone.trim(),
      product: product.trim(),
      imageUrl: finalImageUrl,
      imagePublicId: finalImagePublicId,
      email: email.trim(),
      address: address.trim(),
      customSize: customSize ? customSize.trim() : undefined,
      desiredPrice: desiredPrice ? desiredPrice.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
      productId: productId ? productId.trim() : undefined,
    });

    // Send order email notification to ldinteriors.in@gmail.com
    sendOrderEmail(order).catch((err) => {
      console.error('Failed to send order email:', err);
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
    order.updatedAt = Date.now();

    // If order status is Completed or Cancelled, delete the custom reference image to free up storage
    if ((status === 'Completed' || status === 'Cancelled') && order.imagePublicId) {
      try {
        console.log(`Order status updated to ${status}. Deleting reference image ${order.imagePublicId} from Cloudinary...`);
        await deleteFromCloudinary(order.imagePublicId);
        order.imageUrl = undefined;
        order.imagePublicId = undefined;
      } catch (cloudinaryErr) {
        console.error('Failed to delete reference image on completion:', cloudinaryErr.message);
      }
    }

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

    // Clean up reference image if present when deleting the order
    if (order.imagePublicId) {
      try {
        console.log(`Deleting order. Deleting reference image ${order.imagePublicId} from Cloudinary...`);
        await deleteFromCloudinary(order.imagePublicId);
      } catch (cloudinaryErr) {
        console.error('Failed to delete reference image on order deletion:', cloudinaryErr.message);
      }
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
