const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['page_view', 'search_query', 'design_click', 'design_like', 'whatsapp_share', 'order_placed']
  },
  path: {
    type: String,
    default: '/'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  searchKeyword: {
    type: String,
    default: ''
  },
  deviceType: {
    type: String,
    default: 'Mobile'
  },
  referrer: {
    type: String,
    default: ''
  },
  ipHash: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for fast analytics querying
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
