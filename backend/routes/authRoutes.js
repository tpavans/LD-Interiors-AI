const express = require('express');
const router = express.Router();
const { loginUser, getMe, sendOtp, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public route to log in
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected route to get currently authenticated user profile
router.get('/me', protect, getMe);

module.exports = router;
