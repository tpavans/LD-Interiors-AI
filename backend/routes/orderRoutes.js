const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to track orders by phone query parameter
router.get('/track', trackOrders);

// Public route to book/create a new order (handles optional reference image file upload)
router.post('/', upload.single('referenceImage'), createOrder);

// Public route to submit payment transaction proof
router.post('/:id/payments', submitPayment);

// Public route to submit payment confirmation without UTR (WhatsApp alerts)
router.post('/:id/confirm-payment', confirmCustomerPayment);

// Public route to create Razorpay payment order
router.post('/:id/razorpay-order', createRazorpayOrder);

// Public route to verify Razorpay signature and settle instantly
router.post('/:id/razorpay-verify', verifyRazorpaySignature);

// Public route to cancel/reset pending verification
router.post('/:id/cancel-pending-verification', cancelPendingPaymentVerification);

// Admin-only route to retrieve all orders
router.get('/', protect, getOrders);

// Admin-only route to manually send order greeting email
router.post('/:id/send-greeting', protect, sendManualGreetingEmail);

// Admin-only route to update pricing details
router.put('/:id/pricing', protect, updateOrderPricing);

// Admin-only route to update delivery tracking details
router.put('/:id/delivery-tracking', protect, updateDeliveryTracking);

// Admin-only route to approve or reject a payment
router.post('/:id/payments/:paymentId/verify', protect, verifyPayment);

// Admin-only routes to update or delete order status
router.route('/:id')
  .put(protect, updateOrderStatus)
  .delete(protect, deleteOrder);

module.exports = router;
