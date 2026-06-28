const express = require('express');
const router = express.Router();
const SupportRequest = require('../models/SupportRequest');
const { sendCustomerSupportEmail } = require('../utils/sendEmail');

// @route   POST /api/support
// @desc    Create a new customer support ticket
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, issue } = req.body;

    if (!name || !phone || !email || !issue) {
      return res.status(400).json({
        message: 'Name, phone, email, and issue description are required.',
      });
    }

    const ticket = await SupportRequest.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      issue: issue.trim(),
    });

    // Send email alert to Pavan Sai / Nagaraju
    sendCustomerSupportEmail(ticket).catch((err) => {
      console.error('Failed to send customer support email notification:', err);
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      message: 'Server error submitting support ticket.',
      error: error.message,
    });
  }
});

// @route   GET /api/support
// @desc    Get all support tickets
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const tickets = await SupportRequest.find({}).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      message: 'Server error fetching support tickets.',
      error: error.message,
    });
  }
});

module.exports = router;
