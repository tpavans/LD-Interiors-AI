const express = require('express');
const router = express.Router();
const { loginUser, getMe, sendOtp, verifyOtp, updateProfile } = require('../controllers/authController');
const { protect, protectUser } = require('../middleware/authMiddleware');

// Public route to log in
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get('/me', protectUser, getMe);
router.put('/profile', protectUser, updateProfile);

module.exports = router;
