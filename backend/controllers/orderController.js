const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendOrderEmail, sendCustomerGreetingEmail, sendCustomerStatusUpdateEmail } = require('../utils/sendEmail');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { triggerCustomerVoiceCall } = require('../utils/voiceCall');

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

    // Dispatch notifications in parallel (so slow SMTP emails don't delay the Twilio voice call)
    sendOrderEmail(order).catch((err) => {
      console.error('Failed to send admin order email:', err);
    });

    sendCustomerGreetingEmail(order).catch((err) => {
      console.error('Failed to send customer greeting email:', err);
    });

    triggerCustomerVoiceCall(order).catch((err) => {
      console.error('Failed to trigger customer voice call:', err);
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

    // Send progress status update email to the customer
    sendCustomerStatusUpdateEmail(updatedOrder, status).catch((err) => {
      console.error('Failed to send customer status update email:', err);
    });

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

/**
 * @desc    Send manual greeting email to customer
 * @route   POST /api/orders/:id/send-greeting
 * @access  Private (Admin only)
 */
const sendManualGreetingEmail = async (req, res) => {
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

    if (!order.email || order.email.includes('no-email') || !order.email.includes('@')) {
      return res.status(400).json({ message: 'This order does not have a valid customer email address.' });
    }

    await sendCustomerGreetingEmail(order);
    res.json({ message: 'Greeting email sent successfully to ' + order.email });
  } catch (error) {
    console.error('Error sending manual greeting email:', error);
    res.status(500).json({
      message: 'Server error sending greeting email.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update order pricing & total cost
 * @route   PUT /api/orders/:id/pricing
 * @access  Private (Admin only)
 */
const updateOrderPricing = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection is offline.' });
  }
  try {
    const { totalPrice, status } = req.body;
    if (totalPrice === undefined) {
      return res.status(400).json({ message: 'Total price value is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.totalPrice = Number(totalPrice);
    order.remainingBalance = Number(totalPrice) - order.paidAmount;
    if (status) {
      order.status = status;
    }
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order pricing:', error);
    res.status(500).json({ message: 'Server error updating pricing.', error: error.message });
  }
};

/**
 * @desc    Customer submit payment UTR for verification
 * @route   POST /api/orders/:id/payments
 * @access  Public
 */
const submitPayment = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection is offline.' });
  }
  try {
    const { amount, utrNumber, upiIdUsed } = req.body;
    if (!utrNumber || !upiIdUsed) {
      return res.status(400).json({ message: 'UTR number and UPI ID are required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Append new payment to the payments array
    order.payments.push({
      amount: amount ? Number(amount) : 0,
      utrNumber: utrNumber.trim(),
      upiIdUsed: upiIdUsed.trim(),
      status: 'Pending',
      createdAt: Date.now()
    });

    order.paymentStatus = 'Pending Verification';
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    // Trigger admin notification alert
    try {
      const { sendAdminPaymentAlertEmail } = require('../utils/sendEmail');
      sendAdminPaymentAlertEmail(updatedOrder, amount || 0, utrNumber).catch(e => console.error(e));
    } catch (err) {
      console.error('Failed to send admin payment alert:', err);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ message: 'Server error submitting payment.', error: error.message });
  }
};

/**
 * @desc    Admin approve or reject a payment installment
 * @route   POST /api/orders/:id/payments/:paymentId/verify
 * @access  Private (Admin only)
 */
const verifyPayment = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection is offline.' });
  }
  try {
    const { action, verifiedAmount } = req.body; // 'approve' or 'reject', verifiedAmount entered by admin
    const { paymentId } = req.params;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Valid action (approve or reject) is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const payment = order.payments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status !== 'Pending') {
      return res.status(400).json({ message: `Payment has already been ${payment.status.toLowerCase()}.` });
    }

    if (action === 'approve') {
      const finalAmount = verifiedAmount !== undefined ? Number(verifiedAmount) : payment.amount;
      if (isNaN(finalAmount) || finalAmount < 0) {
        return res.status(400).json({ message: 'Please provide a valid verified amount received.' });
      }

      payment.amount = finalAmount;
      payment.status = 'Approved';
      order.paidAmount += finalAmount;
      order.remainingBalance = order.totalPrice - order.paidAmount;

      // Recalculate overall paymentStatus
      if (order.paidAmount >= order.totalPrice) {
        order.paymentStatus = 'Paid';
        if (order.status === 'Pending' || order.status === 'Processing') {
          order.status = 'In Progress';
        }
      } else {
        order.paymentStatus = 'Partially Paid';
      }

      // Trigger customer PDF receipt dispatch
      try {
        const { sendCustomerPaymentReceiptEmail } = require('../utils/sendEmail');
        sendCustomerPaymentReceiptEmail(order, finalAmount).catch(e => console.error(e));
      } catch (err) {
        console.error('Failed to send payment receipt:', err);
      }

    } else {
      payment.status = 'Rejected';
      
      const hasPending = order.payments.some(p => p.status === 'Pending');
      const hasApproved = order.payments.some(p => p.status === 'Approved');

      if (hasPending) {
        order.paymentStatus = 'Pending Verification';
      } else if (hasApproved) {
        if (order.paidAmount >= order.totalPrice) {
          order.paymentStatus = 'Paid';
        } else {
          order.paymentStatus = 'Partially Paid';
        }
      } else {
        order.paymentStatus = 'Unpaid';
      }
    }

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error verifying payment.', error: error.message });
  }
};

/**
 * @desc    Customer confirm payment without manual UTR number (for WhatsApp P2P alert flows)
 * @route   POST /api/orders/:id/confirm-payment
 * @access  Public
 */
const confirmCustomerPayment = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection is offline.' });
  }
  try {
    const { amount, upiIdUsed } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Append to payments with custom status
    order.payments.push({
      amount: Number(amount),
      utrNumber: 'WhatsApp Alert Triggered',
      upiIdUsed: upiIdUsed || 'UPI QR / App Link',
      status: 'Pending',
      createdAt: Date.now()
    });

    order.paymentStatus = 'Pending Verification';
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    // Trigger email alert to admin
    try {
      const { sendAdminPaymentAlertEmail } = require('../utils/sendEmail');
      sendAdminPaymentAlertEmail(updatedOrder, amount, 'WhatsApp Alert Triggered').catch(e => console.error(e));
    } catch (err) {
      console.error('Failed to send admin payment alert email:', err);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error confirming customer payment:', error);
    res.status(500).json({ message: 'Server error confirming payment.', error: error.message });
  }
};

/**
 * @desc    Admin update delivery tracking data (deliveryDate, carrier, trackingNumber)
 * @route   PUT /api/orders/:id/delivery-tracking
 * @access  Private (Admin only)
 */
const updateDeliveryTracking = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection is offline.' });
  }
  try {
    const { deliveryDate, carrier, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (deliveryDate !== undefined) {
      order.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
    }
    if (carrier !== undefined) {
      order.carrier = carrier.trim();
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber.trim();
    }

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating delivery tracking:', error);
    res.status(500).json({ message: 'Server error updating delivery details.', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  trackOrders,
  updateOrderStatus,
  deleteOrder,
  sendManualGreetingEmail,
  updateOrderPricing,
  submitPayment,
  verifyPayment,
  confirmCustomerPayment,
  updateDeliveryTracking,
};
