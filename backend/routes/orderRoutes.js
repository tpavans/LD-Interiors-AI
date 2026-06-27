const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  trackOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to track orders by phone query parameter
router.get('/track', trackOrders);

// Public route to book/create a new order (handles optional reference image file upload)
router.post('/', upload.single('referenceImage'), createOrder);

// Admin-only route to retrieve all orders
router.get('/', protect, getOrders);

// Admin-only routes to update or delete order status
router.route('/:id')
  .put(protect, updateOrderStatus)
  .delete(protect, deleteOrder);

module.exports = router;
