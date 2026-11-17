const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  workerId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Worker name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true,
    default: 'Carpenter'
  },
  wageType: {
    type: String,
    enum: ['daily', 'monthly'],
    default: 'daily'
  },
  dailyRate: {
    type: Number,
    default: 900
  },
  monthlySalary: {
    type: Number,
    default: 0
  },
  photo: {
    type: String,
    default: ''
  },
  aadharNumber: {
    type: String,
    trim: true,
    default: ''
  },
  bloodGroup: {
    type: String,
    trim: true,
    default: 'O+'
  },
  emergencyContact: {
    type: String,
    trim: true,
    default: ''
  },
  qrCodeData: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-populate qrCodeData before saving
workerSchema.pre('save', function (next) {
  if (!this.qrCodeData) {
    this.qrCodeData = `LDI-WORKER:${this.workerId}`;
  }
  next();
});

module.exports = mongoose.model('Worker', workerSchema);
