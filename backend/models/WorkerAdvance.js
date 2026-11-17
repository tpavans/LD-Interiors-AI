const mongoose = require('mongoose');

const workerAdvanceSchema = new mongoose.Schema({
  workerId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  workerName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['advance', 'salary_payout', 'bonus', 'deduction'],
    default: 'advance'
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be greater than zero']
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank'],
    default: 'cash'
  },
  notes: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerAdvance', workerAdvanceSchema);
