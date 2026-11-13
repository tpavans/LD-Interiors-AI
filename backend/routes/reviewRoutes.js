const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// 1. Submit a Customer Review (Protected upload)
router.post(
  '/',
  upload.fields([
    { name: 'images', maxCount: 6 },
    { name: 'video', maxCount: 1 }
  ]),
  reviewController.submitReview
);

// 2. Get Public Approved Reviews with Filters & Aggregates
router.get('/', reviewController.getApprovedReviews);

// 3. Amazon-Style Product-Specific Reviews
router.get('/product/:productId', reviewController.getProductReviews);

// 4. Check Order Review Eligibility
router.get('/eligibility/:orderId', reviewController.checkReviewEligibility);

// 5. Admin Routes (Protected with Admin Auth)
router.get('/admin/all', protect, reviewController.getAdminReviews);
router.put('/admin/:id/status', protect, reviewController.updateReviewStatus);
router.put('/admin/:id/feature', protect, reviewController.toggleFeatureReview);
router.delete('/admin/:id', protect, reviewController.deleteReview);

module.exports = router;
