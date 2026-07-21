const Category = require('../models/Category');
const Product = require('../models/Product');

const DEFAULT_CATEGORIES = [
  "Living Room", "Kitchen", "Bedroom", "Kids Room", "Sofas", 
  "Wooden Beds", "Dining Tables", "TV Units", "Uyyala Swings", 
  "Wooden Windows", "Mesh Doors", "Polish Items", "Money Boxes", 
  "Glass Windows", "Office", "Bathroom", "Puja Mandiralu", 
  "Gummalu", "Dressing Tables"
];

/**
 * @desc    Get all categories (auto-seeds defaults if DB is empty)
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({}).sort({ name: 1 });

    // Auto-seed default categories if empty
    if (categories.length === 0) {
      console.log('Seeding initial categories into MongoDB...');
      const seedDocs = DEFAULT_CATEGORIES.map(name => ({ name }));
      await Category.insertMany(seedDocs, { ordered: false }).catch(() => {});
      categories = await Category.find({}).sort({ name: 1 });
    }

    // Include categories from existing products if any were missed
    const productCategories = await Product.distinct('category');
    const existingNames = new Set(categories.map(c => c.name.toLowerCase()));
    
    const missingDocs = [];
    for (const catName of productCategories) {
      if (catName && !existingNames.has(catName.trim().toLowerCase())) {
        missingDocs.push({ name: catName.trim() });
        existingNames.add(catName.trim().toLowerCase());
      }
    }

    if (missingDocs.length > 0) {
      await Category.insertMany(missingDocs, { ordered: false }).catch(() => {});
      categories = await Category.find({}).sort({ name: 1 });
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.error('GET CATEGORIES EXCEPTION:', error);
    return res.status(500).json({
      message: 'Server error fetching categories',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = await Category.create({ name: trimmedName });
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('CREATE CATEGORY EXCEPTION:', error);
    return res.status(500).json({
      message: 'Server error creating category',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    return res.status(200).json({ message: 'Category removed successfully', id: req.params.id });
  } catch (error) {
    console.error('DELETE CATEGORY EXCEPTION:', error);
    return res.status(500).json({
      message: 'Server error deleting category',
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
