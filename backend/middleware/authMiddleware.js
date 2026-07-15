const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Verify database state
    if (mongoose.connection.readyState !== 1) {
      console.error(`AUTH MIDDLEWARE ERROR: Database is not connected (readyState = ${mongoose.connection.readyState}).`);
      return res.status(500).json({ message: 'Database connection is offline.' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // 2. Verify JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error('AUTH MIDDLEWARE CONFIG ERROR: JWT_SECRET environment variable is missing.');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.warn('AUTH MIDDLEWARE: Token verification failed:', jwtErr.message);
      return res.status(401).json({ message: 'Token invalid or expired' });
    }

    // 3. Find user in database
    if (!mongoose.isValidObjectId(decoded.id)) {
      console.warn(`AUTH MIDDLEWARE: Invalid ObjectId format: "${decoded.id}"`);
      return res.status(401).json({ message: 'Token contains invalid user ID format' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.warn(`AUTH MIDDLEWARE: User ID "${decoded.id}" extracted from token not found in database.`);
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      console.warn(`AUTH MIDDLEWARE: User "${user.email}" does not have admin permissions (role: ${user.role}). Access denied.`);
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('AUTH MIDDLEWARE UNEXPECTED EXCEPTION:', error);
    console.error(error.stack);
    return res.status(500).json({
      message: 'Authentication check failed due to server error.',
      error: error.message
    });
  }
};

const protectUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is offline.' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('USER AUTH MIDDLEWARE EXCEPTION:', error);
    return res.status(500).json({
      message: 'User authentication check failed.',
      error: error.message
    });
  }
};

module.exports = { protect, protectUser };