const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const twilio = require('twilio');

// Helper function to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environmental variables.');
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

/**
 * @desc    Authenticate admin and retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  console.log('--- ADMIN LOGIN ATTEMPT ---');
  console.log('Received login request for email:', req.body?.email);

  try {
    const { email, password } = req.body;

    // 1. Validate input presence
    if (!email || !password) {
      console.warn('LOGIN VALIDATION WARNING: Missing email or password parameter.');
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // 2. Verify JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error('LOGIN CONFIG ERROR: JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        message: 'Server configuration error: JWT_SECRET is not defined.'
      });
    }

    // 3. Verify Database Connection State
    if (mongoose.connection.readyState !== 1) {
      console.error(`LOGIN CONNECTION ERROR: Database is not connected (readyState = ${mongoose.connection.readyState}).`);
      return res.status(500).json({
        message: 'Database connection is offline. One common reason is that your local IP address is not whitelisted on MongoDB Atlas. Please update your cluster security settings or start local MongoDB.'
      });
    }

    // 4. Query user collection (Real MongoDB flow)
    const user = await User.findOne({ email });

    if (!user) {
      console.warn(`LOGIN AUTHENTICATION FAILED: User "${email}" was not found.`);
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // 5. Compare passwords using bcrypt
    let isMatch = false;
    try {
      isMatch = await user.matchPassword(password);
    } catch (bcryptErr) {
      console.error('LOGIN BCRYPT ERROR: Password matching failed with exception:', bcryptErr);
      return res.status(500).json({
        message: 'Error verifying credentials: password comparison failed.',
        error: bcryptErr.message,
        stack: bcryptErr.stack
      });
    }

    if (!isMatch) {
      console.warn(`LOGIN AUTHENTICATION FAILED: Password mismatch for user "${email}".`);
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // 6. Sign and return token
    let token;
    try {
      token = generateToken(user._id);
    } catch (jwtErr) {
      console.error('LOGIN JWT ERROR: Token generation failed:', jwtErr);
      return res.status(500).json({
        message: 'Server token signing failed.',
        error: jwtErr.message,
        stack: jwtErr.stack
      });
    }

    console.log(`LOGIN SUCCESS: Session authorized for admin "${email}".`);
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });

  } catch (error) {
    console.error('LOGIN UNEXPECTED EXCEPTION:', error);
    console.error(error.stack);
    return res.status(500).json({
      message: 'An unexpected internal server error occurred.',
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * @desc    Retrieve logged-in user profile details
 * @route   GET /api/auth/me
 * @access  Private (Admin protected)
 */
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no user context' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database connection is offline.' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('PROFILE RETRIEVAL EXCEPTION:', error);
    console.error(error.stack);
    return res.status(500).json({
      message: 'Internal server error retrieving profile.',
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * @desc    Send OTP to phone number (simulated SMS)
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Please provide a phone number' });
    }

    const cleanedPhone = phone.trim();
    let user = await User.findOne({ phone: cleanedPhone });

    // If user does not exist, create a new admin/user with a dummy email/password
    if (!user) {
      user = await User.create({
        name: `Admin (${cleanedPhone})`,
        email: `${cleanedPhone}@ldinteriors.com`,
        password: Math.random().toString(36).slice(-10),
        phone: cleanedPhone,
        role: 'admin'
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    await user.save();

    console.log(`[OTP SERVICE] Generated OTP ${otp} for phone ${cleanedPhone}`);

    // Try sending real Twilio SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    
    let realSmsSent = false;
    let smsError = '';

    if (accountSid && authToken && fromNumber) {
      let formattedPhone = cleanedPhone;
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
          formattedPhone = '+' + formattedPhone;
        } else {
          formattedPhone = '+91' + formattedPhone;
        }
      }

      try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
          body: `Your LD Interiors verification code is: ${otp}. It is valid for 5 minutes.`,
          from: fromNumber,
          to: formattedPhone
        });
        console.log(`[SMS SERVICE] Twilio SMS sent successfully to ${formattedPhone}. Message SID: ${message.sid}`);
        realSmsSent = true;
      } catch (err) {
        console.error('[SMS SERVICE] Twilio SMS failed to send:', err.message);
        smsError = err.message;
      }
    } else {
      console.warn('[SMS SERVICE] Twilio configuration is missing. Cannot send real SMS.');
      smsError = 'Twilio config missing';
    }

    if (realSmsSent) {
      return res.status(200).json({
        message: 'OTP sent to your mobile number successfully',
        phone: cleanedPhone,
        realSms: true
      });
    } else {
      // Fallback: send simulated OTP to keep system testable and responsive
      return res.status(200).json({
        message: `OTP generated (Real SMS failed: ${smsError})`,
        phone: cleanedPhone,
        otp: otp, // Fallback simulated OTP
        realSms: false
      });
    }
  } catch (error) {
    console.error('SEND OTP EXCEPTION:', error);
    return res.status(500).json({
      message: 'Server error sending OTP',
      error: error.message
    });
  }
};

/**
 * @desc    Verify OTP and log user in
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Please provide phone and OTP' });
    }

    const cleanedPhone = phone.trim();
    const user = await User.findOne({ phone: cleanedPhone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP matching and expiry
    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP details upon success
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (error) {
    console.error('VERIFY OTP EXCEPTION:', error);
    return res.status(500).json({
      message: 'Server error verifying OTP',
      error: error.message
    });
  }
};

module.exports = {
  loginUser,
  getMe,
  sendOtp,
  verifyOtp,
};
