const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'received'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  paidDate: {
    type: Date
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'],
    default: 'upi'
  },
  note: {
    type: String,
    default: ''
  }
});

const projectExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Teakwood Logs', 'Hardware & Brass', 'PU Polish & Chemicals', 'Glass & Mirrors', 'Transport', 'Carpentry Labor', 'Miscellaneous'],
    default: 'Teakwood Logs'
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  receiptUrl: {
    type: String,
    default: ''
  }
});

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  clientPhone: {
    type: String,
    trim: true,
    default: ''
  },
  clientCity: {
    type: String,
    trim: true,
    default: 'Rajahmundry'
  },
  status: {
    type: String,
    enum: ['quotation', 'in_progress', 'completed', 'on_hold'],
    default: 'in_progress'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  totalBudget: {
    type: Number,
    required: true,
    default: 0
  },
  receivedAmount: {
    type: Number,
    default: 0
  },
  milestones: [milestoneSchema],
  expenses: [projectExpenseSchema],
  materialsCost: {
    type: Number,
    default: 0
  },
  laborCost: {
    type: Number,
    default: 0
  },
  transportCost: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-calculate receivedAmount & total expenses before save
projectSchema.pre('save', function (next) {
  if (Array.isArray(this.milestones)) {
    this.receivedAmount = this.milestones
      .filter(m => m.status === 'received')
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  }
  if (Array.isArray(this.expenses)) {
    this.materialsCost = this.expenses
      .filter(e => e.category !== 'Carpentry Labor' && e.category !== 'Transport')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    this.laborCost = this.expenses
      .filter(e => e.category === 'Carpentry Labor')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    this.transportCost = this.expenses
      .filter(e => e.category === 'Transport')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
