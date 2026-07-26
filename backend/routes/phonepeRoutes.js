const express = require('express');
const router = express.Router();
const {
  initiatePhonePePayment,
  handlePhonePeCallback,
  checkPhonePeStatus,
} = require('../controllers/phonepeController');

router.post('/pay', initiatePhonePePayment);
router.post('/callback', handlePhonePeCallback);
router.get('/status/:transactionId', checkPhonePeStatus);

module.exports = router;
