const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

// PhonePe Sandbox / Production Config
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02fa-4e11-4f10-18e317c805cd';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';

/**
 * @desc    Initiate PhonePe Payment Request
 * @route   POST /api/phonepe/pay
 * @access  Public
 */
const initiatePhonePePayment = async (req, res) => {
  try {
    const { orderId, amount, phone, customerName } = req.body;

    if (!orderId || !amount || !phone) {
      return res.status(400).json({
        message: 'Order ID, amount, and customer phone number are required.',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order record not found.' });
    }

    const merchantTransactionId = `LD_TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const merchantUserId = `CUST_${phone.replace(/\D/g, '').slice(-10)}`;
    const amountInPaise = Math.round(Number(amount) * 100);

    const redirectUrl = process.env.PHONEPE_REDIRECT_URL || `https://www.ldinteriors.in/orders?txnId=${merchantTransactionId}`;
    const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `https://ld-interiors-backend.onrender.com/api/phonepe/callback`;

    const payPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      amount: amountInPaise,
      redirectUrl: redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: callbackUrl,
      mobileNumber: phone.replace(/\D/g, '').slice(-10),
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payPayload)).toString('base64');
    const apiEndpoint = '/pg/v1/pay';
    const stringToHash = base64Payload + apiEndpoint + PHONEPE_SALT_KEY;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256Hash}###${PHONEPE_SALT_INDEX}`;

    console.log(`[PhonePe] Initiating payment for Order ${orderId}, Txn: ${merchantTransactionId}, Amount: ₹${amount}`);

    const phonepeResponse = await axios.post(
      `${PHONEPE_HOST_URL}${apiEndpoint}`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
      }
    );

    if (phonepeResponse.data && phonepeResponse.data.success) {
      const redirectInfo = phonepeResponse.data.data.instrumentResponse.redirectInfo;
      
      // Store pending payment attempt in order record
      if (!order.payments) order.payments = [];
      order.payments.push({
        utr: merchantTransactionId,
        amount: Number(amount),
        status: 'Pending',
        paymentMethod: 'PhonePe PG',
        createdAt: new Date(),
      });
      await order.save();

      return res.json({
        success: true,
        merchantTransactionId,
        url: redirectInfo.url,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: phonepeResponse.data?.message || 'PhonePe gateway initiation failed.',
      });
    }
  } catch (error) {
    console.error('PhonePe Payment Error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Server error processing PhonePe payment initiation.',
      error: error.response?.data || error.message,
    });
  }
};

/**
 * @desc    PhonePe Callback & Webhook Verification
 * @route   POST /api/phonepe/callback
 * @access  Public
 */
const handlePhonePeCallback = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ message: 'Response payload missing.' });
    }

    const decodedPayload = JSON.parse(Buffer.from(response, 'base64').toString('utf8'));
    console.log('[PhonePe Webhook Callback]:', decodedPayload);

    if (decodedPayload.code === 'PAYMENT_SUCCESS') {
      const merchantTransactionId = decodedPayload.data.merchantTransactionId;
      const amountPaid = decodedPayload.data.amount / 100;

      const order = await Order.findOne({ 'payments.utr': merchantTransactionId });
      if (order) {
        order.paidAmount = (order.paidAmount || 0) + amountPaid;
        order.remainingBalance = Math.max(0, (order.totalPrice || 0) - order.paidAmount);
        order.paymentStatus = order.remainingBalance === 0 ? 'Paid' : 'Partially Paid';
        
        const payIndex = order.payments.findIndex(p => p.utr === merchantTransactionId);
        if (payIndex !== -1) {
          order.payments[payIndex].status = 'Approved';
        }
        await order.save();
        console.log(`[PhonePe] Order ${order._id} payment verified successfully!`);
      }
    }

    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error) {
    console.error('PhonePe Callback Error:', error);
    return res.status(500).json({ message: 'Callback processing error' });
  }
};

/**
 * @desc    Check PhonePe Payment Transaction Status
 * @route   GET /api/phonepe/status/:transactionId
 * @access  Public
 */
const checkPhonePeStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const apiEndpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`;
    const stringToHash = apiEndpoint + PHONEPE_SALT_KEY;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256Hash}###${PHONEPE_SALT_INDEX}`;

    const phonepeResponse = await axios.get(`${PHONEPE_HOST_URL}${apiEndpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
      },
    });

    return res.json(phonepeResponse.data);
  } catch (error) {
    console.error('PhonePe Status Check Error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Error verifying PhonePe transaction status.',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  initiatePhonePePayment,
  handlePhonePeCallback,
  checkPhonePeStatus,
};
