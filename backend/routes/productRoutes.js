const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all products, or upload a new one (admin only, multiple images and optional video parsed via upload middleware)
router.route('/')
  .get(getProducts)
  .post(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), createProduct);

// Rate a single product (public customer feedback)
router.route('/:id/rate')
  .post(rateProduct);

// Get, update or delete a single product (update/delete are admin protected)
router.route('/:id')
  .get(getProductById)
  .put(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
