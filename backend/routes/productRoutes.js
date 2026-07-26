const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  createBulkProducts,
  updateProduct,
  deleteProduct,
  rateProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all products, or upload a new one
router.route('/')
  .get(getProducts)
  .post(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), createProduct);

// Bulk upload multiple design catalog images at once
router.post('/bulk', protect, upload.array('images', 30), createBulkProducts);

// Rate a single product (public customer feedback)
router.route('/:id/rate')
  .post(rateProduct);

// Get, update or delete a single product (update/delete are admin protected)
router.route('/:id')
  .get(getProductById)
  .put(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
