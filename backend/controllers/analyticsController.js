const AnalyticsEvent = require('../models/AnalyticsEvent');
const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');

// Helper to classify user-agent into device type
const getDeviceType = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\s+phone/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

// Hash IP for privacy compliance
const hashIp = (ip = '') => {
  return crypto.createHash('sha256').update(ip || '127.0.0.1').digest('hex').substring(0, 16);
};

/**
 * @desc    Log a real visitor event (page_view, design_click, design_like, search_query, etc.)
 * @route   POST /api/analytics/log
 * @access  Public
 */
const logEvent = async (req, res) => {
  try {
    const { eventType, path, productId, searchKeyword } = req.body;

    if (!eventType) {
      return res.status(400).json({ message: 'eventType is required' });
    }

    const userAgent = req.headers['user-agent'] || '';
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '';

    const newEvent = new AnalyticsEvent({
      eventType,
      path: path || '/',
      productId: productId || null,
      searchKeyword: searchKeyword ? searchKeyword.trim().toLowerCase() : '',
      deviceType: getDeviceType(userAgent),
      referrer: req.headers['referer'] || '',
      ipHash: hashIp(clientIp),
      timestamp: new Date()
    });

    await newEvent.save();
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error logging analytics event:', error);
    return res.status(500).json({ message: 'Failed to record analytics event' });
  }
};

/**
 * @desc    Get 100% real aggregated analytics stats from database
 * @route   GET /api/analytics/stats
 * @access  Private (Admin protected)
 */
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // 1. Total Page Views (last 30 days)
    const totalPageViews = await AnalyticsEvent.countDocuments({
      eventType: 'page_view',
      timestamp: { $gte: thirtyDaysAgo }
    });

    // 2. Real-time Live Active Visitors (distinct IPs in last 15 minutes)
    const activeVisitorsList = await AnalyticsEvent.distinct('ipHash', {
      timestamp: { $gte: fifteenMinsAgo }
    });
    const liveActiveVisitors = activeVisitorsList.length;

    // 3. Real Total Design Clicks & Impressions
    const totalDesignClicks = await AnalyticsEvent.countDocuments({
      eventType: 'design_click',
      timestamp: { $gte: thirtyDaysAgo }
    });

    // 4. Real Pinterest-style Likes / Saved Designs
    const totalLikes = await AnalyticsEvent.countDocuments({
      eventType: 'design_like',
      timestamp: { $gte: thirtyDaysAgo }
    });

    // 5. Real WhatsApp Share Conversions
    const totalWhatsappShares = await AnalyticsEvent.countDocuments({
      eventType: 'whatsapp_share',
      timestamp: { $gte: thirtyDaysAgo }
    });

    // 6. Device Distribution (% Mobile vs Desktop vs Tablet)
    const deviceAgg = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    let mobileCount = 0, desktopCount = 0, tabletCount = 0, totalEvents = 0;
    deviceAgg.forEach(item => {
      totalEvents += item.count;
      if (item._id === 'Mobile') mobileCount = item.count;
      else if (item._id === 'Desktop') desktopCount = item.count;
      else if (item._id === 'Tablet') tabletCount = item.count;
    });

    const devices = {
      mobilePercent: totalEvents > 0 ? Math.round((mobileCount / totalEvents) * 100) : 0,
      desktopPercent: totalEvents > 0 ? Math.round((desktopCount / totalEvents) * 100) : 0,
      tabletPercent: totalEvents > 0 ? Math.round((tabletCount / totalEvents) * 100) : 0
    };

    // 7. Most Visited Pages Breakdown
    const pageAgg = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'page_view', timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    const pageViewsBreakdown = pageAgg.map(p => ({
      path: p._id,
      views: p.views
    }));

    // 8. Top Real Search Keywords
    const searchAgg = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'search_query', searchKeyword: { $ne: '' }, timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$searchKeyword', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const topKeywords = searchAgg.map(s => ({
      keyword: s._id,
      count: s.count
    }));

    // 9. Pinterest-Style Top Saved / Clicked Designs
    const topDesignsAgg = await AnalyticsEvent.aggregate([
      { $match: { productId: { $ne: null }, eventType: { $in: ['design_click', 'design_like'] }, timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$productId', engagementCount: { $sum: 1 } } },
      { $sort: { engagementCount: -1 } },
      { $limit: 5 }
    ]);

    const productIds = topDesignsAgg.map(d => d._id);
    const productsList = await Product.find({ _id: { $in: productIds } }).select('title category price image');

    const topDesigns = topDesignsAgg.map(item => {
      const prod = productsList.find(p => p._id.toString() === item._id.toString());
      return {
        _id: item._id,
        title: prod ? prod.title : 'Design Layout',
        category: prod ? prod.category : 'Furniture',
        price: prod ? prod.price : 0,
        image: prod ? prod.image : '',
        engagementCount: item.engagementCount
      };
    });

    // 10. Financial Summary from Real MongoDB Orders
    const orders = await Order.find({});
    let totalRevenue = 0;
    let pendingBalance = 0;
    orders.forEach(o => {
      totalRevenue += (o.paidAmount || 0);
      pendingBalance += (o.remainingBalance || 0);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalPageViews,
        liveActiveVisitors,
        totalDesignClicks,
        totalLikes,
        totalWhatsappShares,
        devices,
        pageViewsBreakdown,
        topKeywords,
        topDesigns,
        financials: {
          totalRevenue,
          pendingBalance,
          totalOrdersCount: orders.length
        }
      }
    });

  } catch (error) {
    console.error('Error computing analytics stats:', error);
    return res.status(500).json({ message: 'Failed to compute analytics stats' });
  }
};

module.exports = {
  logEvent,
  getStats
};
