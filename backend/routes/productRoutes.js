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

// Get all products, or upload a new one (admin only, multiple images parsed via upload middleware)
router.route('/')
  .get(getProducts)
  .post(protect, upload.array('images', 5), createProduct);

// Rate a single product (public customer feedback)
router.route('/:id/rate')
  .post(rateProduct);

// Get, update or delete a single product (update/delete are admin protected)
router.route('/:id')
  .get(getProductById)
  .put(protect, upload.array('images', 5), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
