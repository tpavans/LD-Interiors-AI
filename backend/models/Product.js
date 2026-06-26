const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  imagesPublicIds: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 5,
  },
  ratingsCount: {
    type: Number,
    default: 1,
  },
  ratingsSum: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
