const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  product: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  imagePublicId: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  customSize: {
    type: String,
    trim: true,
  },
  desiredPrice: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  productId: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
