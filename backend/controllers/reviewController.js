const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { uploadToCloudinary } = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * Helper to safely cleanup local temporary files
 */
const cleanupLocalFiles = (files) => {
  if (!files) return;
  const fileList = Array.isArray(files) ? files : Object.values(files).flat();
  fileList.forEach(f => {
    if (f && f.path && fs.existsSync(f.path)) {
      try {
        fs.unlinkSync(f.path);
      } catch (e) {
        console.warn('Failed to unlink temporary file:', e.message);
      }
    }
  });
};

/**
 * 1. Submit Customer Review (Delivered/Completed Orders Only)
 * POST /api/reviews
 */
exports.submitReview = async (req, res) => {
  try {
    const {
      orderId,
      phone,
      rating,
      reviewText,
      city,
      state,
      country,
      locationConsent,
      publicConsent,
      projectCategory,
      reviewType
    } = req.body;

    // Validation
    if (!orderId || !rating || !reviewText || !city || !state) {
      cleanupLocalFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: orderId, rating, reviewText, city, state.'
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      cleanupLocalFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.'
      });
    }

    // 1. Check Order Existence & Status Eligibility
    const order = await Order.findById(orderId);
    if (!order) {
      cleanupLocalFiles(req.files);
      return res.status(404).json({
        success: false,
        message: 'Order reference not found in our records.'
      });
    }

    const orderStatus = (order.status || '').toLowerCase();
    const isCompletedOrDelivered = orderStatus === 'completed' || orderStatus === 'delivered';
    if (!isCompletedOrDelivered) {
      cleanupLocalFiles(req.files);
      return res.status(403).json({
        success: false,
        message: `Reviews can only be submitted for Completed or Delivered orders. Current status: ${order.status}`
      });
    }

    // 2. Verify Customer Ownership (Phone or Email match)
    const cleanCustomerPhone = (phone || req.user?.phone || '').replace(/\D/g, '');
    const cleanOrderPhone = (order.phone || '').replace(/\D/g, '');
    const emailMatch = req.user?.email && order.email && req.user.email.toLowerCase() === order.email.toLowerCase();
    const phoneMatch = cleanCustomerPhone && cleanOrderPhone && (
      cleanCustomerPhone.endsWith(cleanOrderPhone.slice(-10)) ||
      cleanOrderPhone.endsWith(cleanCustomerPhone.slice(-10))
    );

    if (!phoneMatch && !emailMatch && req.user?.role !== 'admin') {
      cleanupLocalFiles(req.files);
      return res.status(403).json({
        success: false,
        message: 'Customer verification failed. You can only review your own verified orders.'
      });
    }

    // 3. Enforce One Review Per Order/Project
    const existingReview = await Review.findOne({ orderId: order._id });
    if (existingReview) {
      cleanupLocalFiles(req.files);
      return res.status(409).json({
        success: false,
        message: 'A review has already been submitted for this completed order/project.'
      });
    }

    // 4. Handle Uploads to Cloudinary (Multiple Images + Optional Video)
    const imageUrls = [];
    const imagePublicIds = [];
    let videoUrl = '';
    let videoPublicId = '';

    const imageFiles = req.files?.images || [];
    const videoFiles = req.files?.video || [];

    for (const imgFile of imageFiles) {
      try {
        const uploadResult = await uploadToCloudinary(imgFile.path, 'ld_interiors/reviews', 'image');
        if (uploadResult?.url) {
          imageUrls.push(uploadResult.url);
          imagePublicIds.push(uploadResult.publicId);
        }
      } catch (uploadErr) {
        console.error('Cloudinary image upload error:', uploadErr.message);
      }
    }

    if (videoFiles.length > 0) {
      try {
        const vidFile = videoFiles[0];
        const vidUploadResult = await uploadToCloudinary(vidFile.path, 'ld_interiors/reviews', 'video');
        if (vidUploadResult?.url) {
          videoUrl = vidUploadResult.url;
          videoPublicId = vidUploadResult.publicId;
        }
      } catch (vidErr) {
        console.error('Cloudinary video upload error:', vidErr.message);
      }
    }

    // 5. Create Review Record
    const newReview = await Review.create({
      orderId: order._id,
      orderRefNumber: order._id.toString().slice(-6).toUpperCase(),
      productId: order.productId || '',
      productName: order.product || 'Custom Teakwood Furniture',
      reviewType: reviewType === 'custom_project' ? 'custom_project' : 'product',
      projectCategory: projectCategory || 'Customized Furniture',
      customerName: order.name,
      customerPhone: order.phone,
      customerEmail: order.email || '',
      rating: numRating,
      reviewText: reviewText.trim(),
      imageUrls,
      imagePublicIds,
      videoUrl,
      videoPublicId,
      city: city.trim(),
      state: state.trim(),
      country: country?.trim() || 'India',
      locationConsent: locationConsent !== 'false' && locationConsent !== false,
      publicConsent: publicConsent !== 'false' && publicConsent !== false,
      verifiedPurchase: true,
      approvalStatus: 'Pending', // Awaiting Admin Approval
      isFeatured: false,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been submitted successfully and will be published upon quick admin review.',
      review: newReview,
    });
  } catch (error) {
    cleanupLocalFiles(req.files);
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting customer review.',
    });
  }
};

/**
 * 2. Get Public Approved Reviews with Filters & Aggregates
 * GET /api/reviews
 */
exports.getApprovedReviews = async (req, res) => {
  try {
    const {
      productId,
      category,
      reviewType,
      rating,
      city,
      isFeatured,
      search,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { approvalStatus: 'Approved' };

    if (productId) {
      query.productId = productId;
    }
    if (category && category !== 'All') {
      query.projectCategory = category;
    }
    if (reviewType) {
      query.reviewType = reviewType;
    }
    if (rating && Number(rating) > 0) {
      query.rating = Number(rating);
    }
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { reviewText: new RegExp(s, 'i') },
        { customerName: new RegExp(s, 'i') },
        { productName: new RegExp(s, 'i') },
        { city: new RegExp(s, 'i') },
        { state: new RegExp(s, 'i') }
      ];
    }

    const sortOption = sort === 'highest_rated'
      ? { rating: -1, createdAt: -1 }
      : sort === 'oldest'
        ? { createdAt: 1 }
        : { createdAt: -1 }; // newest default

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalCount, statsAgg] = await Promise.all([
      Review.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: { approvalStatus: 'Approved' } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          }
        }
      ])
    ]);

    const stats = statsAgg[0] || {
      totalReviews: 0,
      avgRating: 5.0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    };

    res.json({
      success: true,
      reviews,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      stats: {
        totalReviews: stats.totalReviews,
        averageRating: Number((stats.avgRating || 5.0).toFixed(1)),
        ratingCounts: {
          5: stats.fiveStars,
          4: stats.fourStars,
          3: stats.threeStars,
          2: stats.twoStars,
          1: stats.oneStar,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer reviews.',
    });
  }
};

/**
 * 3. Amazon-Style Product-Specific Reviews Endpoint
 * GET /api/reviews/product/:productId
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const reviews = await Review.find({
      productId: productId,
      approvalStatus: 'Approved'
    })
      .sort({ createdAt: -1 })
      .lean();

    const total = reviews.length;
    let sum = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const allCustomerPhotos = [];

    reviews.forEach(r => {
      sum += r.rating;
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
      }
      if (Array.isArray(r.imageUrls)) {
        r.imageUrls.forEach(url => {
          allCustomerPhotos.push({
            url,
            customerName: r.customerName,
            city: r.city,
            rating: r.rating,
            reviewText: r.reviewText,
            createdAt: r.createdAt
          });
        });
      }
    });

    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 5.0;

    res.json({
      success: true,
      productId,
      totalReviews: total,
      averageRating,
      ratingCounts,
      allCustomerPhotos,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load product customer reviews.',
    });
  }
};

/**
 * 4. Check Order Review Eligibility
 * GET /api/reviews/eligibility/:orderId
 */
exports.checkReviewEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const phone = req.query.phone || '';

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        eligible: false,
        reason: 'Order record not found.'
      });
    }

    const orderStatus = (order.status || '').toLowerCase();
    const isCompleted = orderStatus === 'completed' || orderStatus === 'delivered';
    if (!isCompleted) {
      return res.json({
        eligible: false,
        reason: `Order is currently in '${order.status}' status. Only Completed or Delivered orders can be reviewed.`,
        order: {
          _id: order._id,
          product: order.product,
          status: order.status
        }
      });
    }

    const existingReview = await Review.findOne({ orderId: order._id });
    if (existingReview) {
      return res.json({
        eligible: false,
        alreadyReviewed: true,
        reason: 'You have already submitted a review for this order.',
        reviewStatus: existingReview.approvalStatus,
        review: existingReview
      });
    }

    res.json({
      eligible: true,
      order: {
        _id: order._id,
        product: order.product,
        productId: order.productId,
        name: order.name,
        phone: order.phone,
        email: order.email,
        address: order.address,
        status: order.status,
        createdAt: order.createdAt,
      }
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      eligible: false,
      message: 'Failed to check review eligibility.'
    });
  }
};

/**
 * 5. Admin: Get All Reviews (Pending, Approved, Rejected)
 * GET /api/reviews/admin/all
 */
exports.getAdminReviews = async (req, res) => {
  try {
    const { status, rating, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.approvalStatus = status;
    }
    if (rating && Number(rating) > 0) {
      query.rating = Number(rating);
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { customerName: new RegExp(s, 'i') },
        { customerPhone: new RegExp(s, 'i') },
        { productName: new RegExp(s, 'i') },
        { reviewText: new RegExp(s, 'i') },
        { city: new RegExp(s, 'i') },
        { orderRefNumber: new RegExp(s, 'i') }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalCount, countsByStatus] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        {
          $group: {
            _id: '$approvalStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const statusCounts = {
      All: 0,
      Pending: 0,
      Approved: 0,
      Rejected: 0
    };

    countsByStatus.forEach(item => {
      if (item._id && statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
      statusCounts.All += item.count;
    });

    res.json({
      success: true,
      reviews,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      statusCounts,
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin reviews.'
    });
  }
};

/**
 * 6. Admin: Update Review Approval Status
 * PUT /api/reviews/admin/:id/status
 */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status value.' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { approvalStatus: status, updatedAt: new Date() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // If review is linked to a product, re-calculate product's aggregate rating
    if (review.productId) {
      try {
        const approvedProductReviews = await Review.find({
          productId: review.productId,
          approvalStatus: 'Approved'
        });

        if (approvedProductReviews.length > 0) {
          const sum = approvedProductReviews.reduce((acc, r) => acc + r.rating, 0);
          const avg = Number((sum / approvedProductReviews.length).toFixed(1));
          await Product.findByIdAndUpdate(review.productId, {
            rating: avg,
            ratingsCount: approvedProductReviews.length,
            ratingsSum: sum,
          });
        }
      } catch (prodUpdateErr) {
        console.warn('Failed to update product aggregate rating:', prodUpdateErr.message);
      }
    }

    res.json({
      success: true,
      message: `Review has been marked as ${status}.`,
      review,
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review approval status.'
    });
  }
};

/**
 * 7. Admin: Toggle Feature Review
 * PUT /api/reviews/admin/:id/feature
 */
exports.toggleFeatureReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.isFeatured = !review.isFeatured;
    review.updatedAt = new Date();
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isFeatured ? 'featured on homepage showcase' : 'unfeatured from homepage'}.`,
      review,
    });
  } catch (error) {
    console.error('Error toggling featured review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status.'
    });
  }
};

/**
 * 8. Admin: Delete Review
 * DELETE /api/reviews/admin/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Cleanup images on Cloudinary if public IDs are tracked
    if (Array.isArray(review.imagePublicIds) && review.imagePublicIds.length > 0) {
      for (const pubId of review.imagePublicIds) {
        try {
          await cloudinary.uploader.destroy(pubId);
        } catch (cErr) {
          console.warn('Cloudinary delete image warning:', cErr.message);
        }
      }
    }
    if (review.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(review.videoPublicId, { resource_type: 'video' });
      } catch (cErr) {
        console.warn('Cloudinary delete video warning:', cErr.message);
      }
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Customer review and associated media deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review.'
    });
  }
};
