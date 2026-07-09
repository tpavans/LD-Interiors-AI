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
  totalPrice: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  remainingBalance: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Pending Verification', 'Paid', 'Partially Paid'],
    default: 'Unpaid',
  },
  payments: [
    {
      amount: { type: Number, required: true },
      utrNumber: { type: String, required: true, trim: true },
      upiIdUsed: { type: String, required: true },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  deliveryDate: {
    type: Date,
  },
  carrier: {
    type: String,
    trim: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
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
