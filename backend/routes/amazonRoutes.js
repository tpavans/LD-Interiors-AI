const express = require('express');
const router = express.Router();
const {
  getAmazonProducts,
  createAmazonProduct,
  deleteAmazonProduct,
  bulkCreateAmazonProducts,
} = require('../controllers/amazonController');

router.get('/', getAmazonProducts);
router.post('/', createAmazonProduct);
router.post('/bulk', bulkCreateAmazonProducts);
router.delete('/:id', deleteAmazonProduct);

module.exports = router;
