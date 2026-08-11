const AmazonProduct = require('../models/AmazonProduct');

// Helper function to auto-generate Pinterest SEO Title & Description with Keywords & Hashtags
const generatePinterestSEO = (title, category) => {
  const cleanTitle = (title || 'Home Essential').trim();
  const cleanCat = (category || 'Home & Kitchen').trim();

  const seoTitle = `${cleanTitle} - Top Rated ${cleanCat} Find | Amazon Deals`;
  
  const seoDescription = `Discover ${cleanTitle} on Amazon! High-quality ${cleanCat} items for modern homes, luxury interior aesthetics & everyday convenience. Check latest price & shop online via Amazon. #${cleanCat.replace(/\s+/g, '')} #AmazonFinds #HomeEssentials #ShoppingDeals #BestDecor #AmazonAffiliate #TrendingHome`;

  return { seoTitle, seoDescription };
};

/**
 * @desc    Get all Amazon Affiliate Products
 * @route   GET /api/amazon
 * @access  Public
 */
const getAmazonProducts = async (req, res) => {
  try {
    const products = await AmazonProduct.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    res.status(500).json({ message: 'Server error fetching Amazon products', error: error.message });
  }
};

/**
 * @desc    Create a new Amazon Affiliate Product with Auto SEO
 * @route   POST /api/amazon
 * @access  Private / Admin
 */
const createAmazonProduct = async (req, res) => {
  try {
    const { title, affiliateUrl, image, category, price } = req.body;

    if (!title || !affiliateUrl || !image) {
      return res.status(400).json({ message: 'Title, Affiliate Link, and Image URL are required' });
    }

    const { seoTitle, seoDescription } = generatePinterestSEO(title, category);

    const amazonProd = new AmazonProduct({
      title,
      affiliateUrl,
      image,
      category: category || 'Amazon Home & Kitchen',
      price: price || 'Check Price on Amazon',
      pinterestSeoTitle: seoTitle,
      pinterestSeoDescription: seoDescription,
    });

    const saved = await amazonProd.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating Amazon product:', error);
    res.status(500).json({ message: 'Server error creating Amazon product', error: error.message });
  }
};

/**
 * @desc    Delete an Amazon Affiliate Product
 * @route   DELETE /api/amazon/:id
 * @access  Private / Admin
 */
const deleteAmazonProduct = async (req, res) => {
  try {
    const product = await AmazonProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Amazon product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Amazon affiliate product deleted successfully' });
  } catch (error) {
    console.error('Error deleting Amazon product:', error);
    res.status(500).json({ message: 'Server error deleting Amazon product', error: error.message });
  }
};

/**
 * @desc    Bulk Create Amazon Affiliate Products
 * @route   POST /api/amazon/bulk
 * @access  Private / Admin
 */
const bulkCreateAmazonProducts = async (req, res) => {
  try {
    const { items } = req.body; // Array of { title, affiliateUrl, image, category, price }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const prepared = items.map((item) => {
      const { seoTitle, seoDescription } = generatePinterestSEO(item.title, item.category);
      return {
        title: item.title || 'Amazon Home Product',
        affiliateUrl: item.affiliateUrl || 'https://www.amazon.in',
        image: item.image || 'https://www.ldinteriors.in/logo.png',
        category: item.category || 'Amazon Home & Living',
        price: item.price || 'Check Price on Amazon',
        pinterestSeoTitle: seoTitle,
        pinterestSeoDescription: seoDescription,
      };
    });

    const created = await AmazonProduct.insertMany(prepared);
    res.status(201).json({ message: `Successfully added ${created.length} Amazon Affiliate products!`, count: created.length });
  } catch (error) {
    console.error('Error bulk adding Amazon products:', error);
    res.status(500).json({ message: 'Server error bulk creating Amazon products', error: error.message });
  }
};

module.exports = {
  getAmazonProducts,
  createAmazonProduct,
  deleteAmazonProduct,
  bulkCreateAmazonProducts,
};
