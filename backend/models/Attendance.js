const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: String, // Stored as 'YYYY-MM-DD' in Asia/Kolkata timezone
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['present', 'half_day', 'absent', 'overtime'],
    default: 'present'
  },
  checkInTime: {
    type: String,
    default: ''
  },
  checkOutTime: {
    type: String,
    default: ''
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  dailyWageEarned: {
    type: Number,
    default: 0
  },
  scanMethod: {
    type: String,
    enum: ['qr_scan', 'manual'],
    default: 'qr_scan'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a worker can only have one attendance record per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
