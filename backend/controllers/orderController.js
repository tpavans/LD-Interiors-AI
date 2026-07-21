const mongoose = require('mongoose');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { sendOrderEmail, sendCustomerGreetingEmail, sendCustomerStatusUpdateEmail } = require('../utils/sendEmail');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { triggerCustomerVoiceCall } = require('../utils/voiceCall');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

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

    // Auto-create/update customer profile on order placement
    try {
      const User = require('../models/User');
      const cleanedPhone = phone.trim();
      let user = await User.findOne({ phone: cleanedPhone });
      if (!user) {
        await User.create({
          name: name.trim(),
          email: email.trim(),
          phone: cleanedPhone,
          address: address.trim(),
          password: Math.random().toString(36).slice(-10),
          role: 'user'
        });
        console.log(`[AUTO-PROFILE] Created customer profile for phone: ${cleanedPhone}`);
      } else {
        let updated = false;
        if (!user.address) { user.address = address.trim(); updated = true; }
        if (user.name.startsWith('Customer (')) { user.name = name.trim(); updated = true; }
        if (user.email.startsWith(cleanedPhone)) { user.email = email.trim(); updated = true; }
        if (updated) {
          await user.save();
          console.log(`[AUTO-PROFILE] Updated customer profile details for phone: ${cleanedPhone}`);
        }
      }
    } catch (profileErr) {
      console.error('[AUTO-PROFILE ERROR] Failed to manage customer profile:', profileErr.message);
    }

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
    const { amount, upiIdUsed, utrNumber } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required.' });
    }
    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({ message: 'Valid 12-digit UTR / Reference number is required for manual payment verification.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const cleanUtr = utrNumber.trim();

    // Append to payments with custom status
    order.payments.push({
      amount: Number(amount),
      utrNumber: cleanUtr,
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
      sendAdminPaymentAlertEmail(updatedOrder, amount, cleanUtr).catch(e => console.error(e));
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

/**
 * @desc    Create a new Razorpay Order (with convenience fee)
 * @route   POST /api/orders/:id/razorpay-order
 * @access  Public
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, fee } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const baseAmount = Number(amount);
    const feeAmount = Number(fee || 0);
    const totalAmount = baseAmount + feeAmount;

    let razorpayOrderId = `order_mock_${Date.now()}`;

    // If live credentials exist, create actual Razorpay order
    if (razorpayInstance) {
      const options = {
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: `receipt_order_${order._id}_${Date.now()}`
      };
      const rpOrder = await razorpayInstance.orders.create(options);
      razorpayOrderId = rpOrder.id;
    }

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey_9346325291',
      orderId: razorpayOrderId,
      amount: totalAmount,
      currency: 'INR',
      isMock: !razorpayInstance
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to initiate gateway payment.', error: error.message });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/orders/:id/razorpay-verify
 * @access  Public
 */
const verifyRazorpaySignature = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, actualAmountPaid } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let isVerified = false;

    if (razorpayInstance && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        isVerified = true;
      }
    } else {
      // Mock mode verification automatically passes for testing
      isVerified = true;
    }

    if (!isVerified) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Find the corresponding payment in order payments array
    const payment = order.payments.find(p => p.utrNumber === `RP-Order: ${razorpay_order_id}`);
    if (payment) {
      payment.status = 'Approved';
      payment.utrNumber = `Razorpay PayID: ${razorpay_payment_id}`;
    } else {
      // Create a new approved payment if not pre-logged
      order.payments.push({
        amount: Number(actualAmountPaid),
        utrNumber: `Razorpay PayID: ${razorpay_payment_id}`,
        upiIdUsed: 'Razorpay Gateway',
        status: 'Approved',
        createdAt: Date.now()
      });
    }

    order.paidAmount += Number(actualAmountPaid);
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

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    // Trigger customer receipt email
    try {
      const { sendCustomerPaymentReceiptEmail } = require('../utils/sendEmail');
      sendCustomerPaymentReceiptEmail(updatedOrder, Number(actualAmountPaid)).catch(e => console.error(e));
    } catch (err) {
      console.error('Failed to send payment receipt:', err);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Payment verification error.', error: error.message });
  }
};

/**
 * @desc    Cancel a pending payment verification request to allow customer retry
 * @route   POST /api/orders/:id/cancel-pending-verification
 * @access  Public
 */
const cancelPendingPaymentVerification = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const originalLength = order.payments.length;
    // Keep only non-pending payments
    order.payments = order.payments.filter(p => p.status !== 'Pending');

    if (order.payments.length === originalLength) {
      return res.status(400).json({ message: 'No pending payment verification found.' });
    }

    // Reset paymentStatus based on verified ledger
    if (order.paidAmount >= order.totalPrice && order.totalPrice > 0) {
      order.paymentStatus = 'Paid';
    } else if (order.paidAmount > 0) {
      order.paymentStatus = 'Partially Paid';
    } else {
      order.paymentStatus = 'Unpaid';
    }

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling pending payment verification:', error);
    res.status(500).json({ message: 'Server error resetting payment.', error: error.message });
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
  createRazorpayOrder,
  verifyRazorpaySignature,
  cancelPendingPaymentVerification,
};
