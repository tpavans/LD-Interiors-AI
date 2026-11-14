const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Workshop',
    trim: true,
  },
  video: {
    type: String,
    required: true,
    trim: true,
  },
  videoPublicId: {
    type: String,
    default: '',
    trim: true,
  },
  image: {
    type: String,
    default: '',
    trim: true,
  },
  imagePublicId: {
    type: String,
    default: '',
    trim: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [String],
    default: [],
  },
  productId: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reel', ReelSchema);
