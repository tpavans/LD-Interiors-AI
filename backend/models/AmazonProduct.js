const mongoose = require('mongoose');

const AmazonProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  affiliateUrl: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Amazon Home & Living',
    trim: true,
  },
  price: {
    type: String,
    default: 'Check Price on Amazon',
  },
  pinterestSeoTitle: {
    type: String,
    default: '',
  },
  pinterestSeoDescription: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AmazonProduct', AmazonProductSchema);
