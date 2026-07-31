const express = require('express');
const router = express.Router();
const { logEvent, getStats } = require('../controllers/analyticsController');

// Public route to log events
router.post('/log', logEvent);

// Admin route to fetch stats
router.get('/stats', getStats);

module.exports = router;
