const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  product: {
    type: String,
  },
  recipient: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  error: {
    type: String,
  },
  smtpUser: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);
