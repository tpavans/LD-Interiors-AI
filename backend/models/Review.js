const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  orderRefNumber: {
    type: String,
    trim: true,
  },
  productId: {
    type: String,
    trim: true,
    index: true, // Indexed for instant product-level review queries
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  reviewType: {
    type: String,
    enum: ['product', 'custom_project'],
    default: 'product',
  },
  projectCategory: {
    type: String,
    enum: [
      'Living Room',
      'Bedroom',
      'Kitchen',
      'Wall Designs',
      'Ceiling Designs',
      'Lighting',
      'Customized Furniture',
      'Wooden Products',
      'Other Interior Projects'
    ],
    default: 'Customized Furniture',
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    trim: true,
    default: '',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
  imagePublicIds: {
    type: [String],
    default: [],
  },
  videoUrl: {
    type: String,
    trim: true,
    default: '',
  },
  videoPublicId: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
    trim: true,
  },
  locationConsent: {
    type: Boolean,
    default: true,
  },
  publicConsent: {
    type: Boolean,
    default: true,
  },
  verifiedPurchase: {
    type: Boolean,
    default: true,
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
