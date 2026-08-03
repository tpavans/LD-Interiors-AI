// const Product = require('../models/Product');
// const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// /**
//  * @desc    Retrieve all products sorted by latest
//  * @route   GET /api/products
//  * @access  Public
//  */
// const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find({}).sort({ createdAt: -1 });
//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Server error fetching products' });
//   }
// };

// /**
//  * @desc    Retrieve single product by ID
//  * @route   GET /api/products/:id
//  * @access  Public
//  */
// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.json(product);
//   } catch (error) {
//     console.error('Error fetching product details:', error);
//     res.status(500).json({ message: 'Server error fetching product details' });
//   }
// };

// /**
//  * @desc    Create new product with image upload
//  * @route   POST /api/products
//  * @access  Private (Admin protected)
//  */
// const createProduct = async (req, res) => {
//   try {
//     const { title, category } = req.body;

//     if (!title || !category) {
//       return res.status(400).json({ message: 'Please provide title and category' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: 'Please upload an image' });
//     }

//     // Upload temporary file to Cloudinary
//     const uploadResult = await uploadToCloudinary(req.file.path);

//     const product = await Product.create({
//       title,
//       category,
//       image: uploadResult.url,
//       imagePublicId: uploadResult.publicId,
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     console.error('Error creating product:', error);
//     res.status(500).json({ message: 'Server error creating product' });
//   }
// };

// /**
//  * @desc    Update an existing product
//  * @route   PUT /api/products/:id
//  * @access  Private (Admin protected)
//  */
// const updateProduct = async (req, res) => {
//   try {
//     const { title, category } = req.body;
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     let imageUrl = product.image;
//     let imagePublicId = product.imagePublicId;

//     // Check if new image file is provided
//     if (req.file) {
//       // Upload new image
//       const uploadResult = await uploadToCloudinary(req.file.path);
      
//       // Clean up old image from Cloudinary
//       try {
//         await deleteFromCloudinary(product.imagePublicId);
//       } catch (err) {
//         console.error('Could not delete old image from Cloudinary during update:', err);
//       }

//       imageUrl = uploadResult.url;
//       imagePublicId = uploadResult.publicId;
//     }

//     product.title = title || product.title;
//     product.category = category || product.category;
//     product.image = imageUrl;
//     product.imagePublicId = imagePublicId;

//     const updatedProduct = await product.save();
//     res.json(updatedProduct);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ message: 'Server error updating product' });
//   }
// };

// /**
//  * @desc    Delete a product and its associated Cloudinary asset
//  * @route   DELETE /api/products/:id
//  * @access  Private (Admin protected)
//  */
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Delete image from Cloudinary
//     try {
//       await deleteFromCloudinary(product.imagePublicId);
//     } catch (err) {
//       console.error('Could not delete image from Cloudinary during deletion:', err);
//     }

//     // Delete document from MongoDB
//     await Product.deleteOne({ _id: req.params.id });

//     res.json({ message: 'Product and image deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({ message: 'Server error deleting product' });
//   }
// };

// module.exports = {
//   getProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// };


const mongoose = require('mongoose');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @desc    Get all products (with pagination support)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline. Please whitelist your current public IP address or allow access from anywhere (0.0.0.0/0) in your MongoDB Atlas Network Access settings.',
    });
  }
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Server error fetching products',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline. Please whitelist your current public IP address or allow access from anywhere (0.0.0.0/0) in your MongoDB Atlas Network Access settings.',
    });
  }
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({
      message: 'Server error fetching product details',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new product (with image upload)
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
const createProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline. Please whitelist your current public IP address or allow access from anywhere (0.0.0.0/0) in your MongoDB Atlas Network Access settings.',
    });
  }
  try {
    const title = req.body.title?.trim();
    const category = req.body.category?.trim();
    const price = req.body.price ? Number(req.body.price) : 0;
    const description = req.body.description?.trim() || '';
    const rating = req.body.rating ? Number(req.body.rating) : 5;

    if (!title || !category) {
      return res.status(400).json({
        message: 'Title and category are required',
      });
    }

    let images = [];
    let imagesPublicIds = [];
    let videoUrl = '';
    let videoPublicId = '';

    // Handle images array
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map(file => uploadToCloudinary(file.path, 'ld_interiors', 'image'));
      const uploadResults = await Promise.all(uploadPromises);
      images = uploadResults.map(res => res.url);
      imagesPublicIds = uploadResults.map(res => res.publicId);
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video.length > 0) {
      const videoFile = req.files.video[0];
      const videoResult = await uploadToCloudinary(videoFile.path, 'ld_interiors', 'video');
      videoUrl = videoResult.url;
      videoPublicId = videoResult.publicId;
    } else if (req.body.video) {
      videoUrl = req.body.video;
      videoPublicId = '';
    }

    if (images.length === 0) {
      return res.status(400).json({
        message: 'At least one image file is required',
      });
    }

    const product = await Product.create({
      title,
      category,
      image: images[0],
      imagePublicId: imagesPublicIds[0],
      images,
      imagesPublicIds,
      video: videoUrl,
      videoPublicId,
      price,
      description,
      rating,
      ratingsCount: 1,
      ratingsSum: rating,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Server error creating product',
      error: error.message,
    });
  }
};

/**
 * Helper: AI Smart Title Generator based on file keywords & category
 */
const generateSmartProductTitle = (file, category, customPrefix = '') => {
  if (customPrefix && customPrefix.trim() !== '') {
    return customPrefix.trim();
  }

  const origName = (file?.originalname || file?.filename || file?.name || '').toLowerCase();
  const name = origName;

  if (name.includes('smasher') || name.includes('masher') || name.includes('mudgar') || name.includes('churner') || name.includes('mathani') || name.includes('pestle') || name.includes('mortar')) {
    return 'Handcrafted Teakwood Vegetable & Potato Smasher';
  }
  if (name.includes('spoon') || name.includes('ladle') || name.includes('spatula') || name.includes('cutlery') || name.includes('fork') || name.includes('utensil')) {
    return 'Grade-A Burma Teak Kitchen Spoon & Spatula Set';
  }
  if (name.includes('rolling') || name.includes('belan')) {
    return 'Solid Teakwood Ergonomic Rolling Pin (Belan)';
  }
  if (name.includes('spice') || name.includes('anjal')) {
    return 'Traditional Teakwood Multi-Compartment Spice Box';
  }
  if (name.includes('bat') || name.includes('cricket')) {
    return 'Solid Burma Teak Premium Wooden Cricket Bat';
  }
  if (name.includes('bar') || name.includes('wine') || name.includes('liquor')) {
    return 'Royal Teakwood Luxury Bar Cabinet & Wine Storage';
  }
  if (name.includes('mandir') || name.includes('pooja') || name.includes('temple') || name.includes('puja')) {
    return 'Handcarved Teakwood Temple Puja Mandiram';
  }
  if (name.includes('door') || name.includes('gummalu') || name.includes('entrance')) {
    return 'Carved Burma Teakwood Grand Entrance Main Door';
  }
  if (name.includes('dining') || name.includes('table')) {
    return 'Maharaj Model Teakwood Dining Table Set';
  }
  if (name.includes('bed') || name.includes('cot') || name.includes('bedroom')) {
    return 'Royal Burma Teak King Size Bedroom Cot';
  }
  if (name.includes('plant') || name.includes('planter') || name.includes('pot') || name.includes('stand')) {
    return 'Modern Teakwood Tiered Indoor Plant Stand';
  }

  const categoryTitleMap = {
    'Kitchen': 'Handcrafted Grade-A Teakwood Kitchen Utensil',
    'Sports': 'Burma Teak Handcrafted Sports Equipment',
    'Doors': 'Handcarved Teakwood Architectural Entrance Door',
    'Wooden Beds': 'Luxury Burma Teakwood Bedroom Furniture Cot',
    'Puja Mandiralu': 'Traditional Handcarved Teak Puja Mandiram',
    'Dining Tables': 'Teakwood Luxury Dining Room Furniture Set',
    'Living Room': 'Royal Burma Teakwood Living Room Showcase',
    'Garden & Decor': 'Teakwood Handcrafted Home & Garden Decor',
    'Carvings & Handicrafts': 'Artisanal Teakwood Sculpted Handicraft'
  };

  return categoryTitleMap[category] || `Premium Handcrafted Burma Teakwood ${category} Design`;
};

/**
 * Helper: AI Category Classifier for image filenames / visual keywords
 */
const detectCategoryFromImage = (file, primaryBatchCategory = null) => {
  const origName = (file?.originalname || file?.filename || file?.name || '').toLowerCase();
  const name = origName;
  
  if (name.includes('bat') || name.includes('cricket') || name.includes('ball') || name.includes('sport') || name.includes('racket') || name.includes('game')) {
    return 'Sports';
  }
  if (name.includes('spoon') || name.includes('ladle') || name.includes('spatula') || name.includes('rolling') || name.includes('spice') || name.includes('kitchen') || name.includes('utensil') || name.includes('bowl') || name.includes('plate') || name.includes('tray') || name.includes('chop') || name.includes('fork') || name.includes('cutlery') || name.includes('smasher') || name.includes('masher') || name.includes('mudgar') || name.includes('churner') || name.includes('mathani') || name.includes('pestle') || name.includes('mortar')) {
    return 'Kitchen';
  }
  if (name.includes('door') || name.includes('gummalu') || name.includes('doorframe') || name.includes('darabandham') || name.includes('main_door') || name.includes('entrance') || name.includes('wooddoor')) {
    return 'Doors';
  }
  if (name.includes('bed') || name.includes('cot') || name.includes('bedroom') || name.includes('mattress') || name.includes('king') || name.includes('queen') || name.includes('wardrobe') || name.includes('almirah') || name.includes('closet')) {
    return 'Wooden Beds';
  }
  if (name.includes('mandir') || name.includes('pooja') || name.includes('temple') || name.includes('puja') || name.includes('god') || name.includes('devudu') || name.includes('idol') || name.includes('statue')) {
    return 'Puja Mandiralu';
  }
  if (name.includes('dining') || name.includes('table') || name.includes('chair') || name.includes('dinning') || name.includes('eat')) {
    return 'Dining Tables';
  }
  if (name.includes('sofa') || name.includes('couch') || name.includes('living') || name.includes('hall') || name.includes('tv') || name.includes('seating') || name.includes('bench') || name.includes('bar') || name.includes('cabinet') || name.includes('wine')) {
    return 'Living Room';
  }
  if (name.includes('plant') || name.includes('planter') || name.includes('pot') || name.includes('garden') || name.includes('flower') || name.includes('stand')) {
    return 'Garden & Decor';
  }
  if (name.includes('toy') || name.includes('craft') || name.includes('sculpture') || name.includes('artifact') || name.includes('carving') || name.includes('horse') || name.includes('elephant')) {
    return 'Carvings & Handicrafts';
  }

  const cleanFallback = (primaryBatchCategory && primaryBatchCategory !== 'AI_AUTO_DETECT') ? primaryBatchCategory : 'Kitchen';
  return cleanFallback;
};

/**
 * @desc    Bulk upload design catalog items (with AI Category Detection & Automatic Single Product Catalog Grouping)
 * @route   POST /api/products/bulk
 * @access  Private (Admin only)
 */
const createBulkProducts = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection is offline.' });
  }
  try {
    const { category, price, titlePrefix, aiAutoDetect, groupAsOneProduct } = req.body;
    const isAiAutoDetect = aiAutoDetect === 'true' || aiAutoDetect === true || category === 'AI_AUTO_DETECT';
    const isGroupAsOne = groupAsOneProduct === 'true' || groupAsOneProduct === true;
    const selectedCategory = (category?.trim() && category?.trim() !== 'AI_AUTO_DETECT' && category?.trim() !== 'Gummalu') 
      ? category.trim() 
      : (category?.trim() === 'Gummalu' ? 'Doors' : 'Kitchen');
    const defaultPrice = price ? Number(price) : 0;

    const files = Array.isArray(req.files)
      ? req.files
      : (req.files ? Object.values(req.files).flat() : (req.file ? [req.file] : []));

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Please select image files for bulk upload.' });
    }

    console.log(`[Bulk Upload] Processing ${files.length} images (AI Auto-Detect: ${isAiAutoDetect}, Force Single Product: ${isGroupAsOne})...`);

    // Upload files to Cloudinary gracefully
    const uploadPromises = files.map(async (file, idx) => {
      try {
        if (!file || !file.path) return null;
        const res = await uploadToCloudinary(file.path);
        return { ...res, fileRef: file, fileIdx: idx };
      } catch (err) {
        console.error(`[Bulk Upload Error] File #${idx} failed:`, err.message);
        return null;
      }
    });

    const rawResults = await Promise.all(uploadPromises);
    const uploadResults = rawResults.filter(Boolean);

    if (uploadResults.length === 0) {
      return res.status(400).json({ message: 'Could not process or upload selected images to Cloudinary.' });
    }

    // Group uploadResults by AI-detected category
    const itemsByCategory = {};
    uploadResults.forEach((result) => {
      const file = result.fileRef || {};
      const cat = isAiAutoDetect ? detectCategoryFromImage(file, selectedCategory) : selectedCategory;
      if (!itemsByCategory[cat]) {
        itemsByCategory[cat] = [];
      }
      itemsByCategory[cat].push(result);
    });

    const productsToCreate = [];
    const categoryCounts = {};

    // Process each category group
    for (const [catName, catResults] of Object.entries(itemsByCategory)) {
      // Auto-create Category document in MongoDB if it doesn't exist yet!
      try {
        const Category = require('../models/Category');
        const existingCat = await Category.findOne({ name: { $regex: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (!existingCat) {
          await Category.create({ name: catName });
          console.log(`[Bulk Upload] Auto-created new Category in MongoDB: ${catName}`);
        }
      } catch (e) {
        console.error('[Bulk Upload] Category auto-creation check error:', e.message);
      }

      if (isGroupAsOne) {
        // Group ALL photos of this category into 1 single Product catalog item (e.g. Maharaj Table Set or Smasher 3-pack)
        const imageUrls = catResults.map(r => r.url);
        const imagePublicIds = catResults.map(r => r.publicId);
        const smartTitle = generateSmartProductTitle(catResults[0]?.fileRef, catName, titlePrefix);

        productsToCreate.push({
          title: `${smartTitle} #${Date.now().toString().slice(-4)}`,
          category: catName,
          image: imageUrls[0],
          imageUrl: imageUrls[0],
          imagePublicId: imagePublicIds[0],
          images: imageUrls,
          imagesPublicIds: imagePublicIds,
          price: defaultPrice,
          description: `Handcrafted Grade-A Burma Teakwood design for ${catName}. Contains ${imageUrls.length} showcase photos.`,
          rating: 4.9,
          ratingsCount: 1,
          ratingsSum: 4.9,
          createdAt: new Date()
        });
        categoryCounts[catName] = 1;
      } else {
        // Automatically group up to 5 gallery images per product catalog entry!
        const CHUNK_SIZE = 5;
        for (let i = 0; i < catResults.length; i += CHUNK_SIZE) {
          const chunk = catResults.slice(i, i + CHUNK_SIZE);
          const imageUrls = chunk.map(r => r.url);
          const imagePublicIds = chunk.map(r => r.publicId);
          categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

          const smartTitle = generateSmartProductTitle(chunk[0]?.fileRef, catName, titlePrefix);

          productsToCreate.push({
            title: `${smartTitle} #${Date.now().toString().slice(-4)}-${categoryCounts[catName]}`,
            category: catName,
            image: imageUrls[0],
            imageUrl: imageUrls[0],
            imagePublicId: imagePublicIds[0],
            images: imageUrls,
            imagesPublicIds: imagePublicIds,
            price: defaultPrice,
            description: `Handcrafted Grade-A Burma Teakwood design for ${catName}. Contains ${imageUrls.length} showcase gallery photo(s).`,
            rating: 4.9,
            ratingsCount: 1,
            ratingsSum: 4.9,
            createdAt: new Date()
          });
        }
      }
    }

    const insertedProducts = await Product.insertMany(productsToCreate);
    console.log(`[Bulk Upload] Successfully inserted ${insertedProducts.length} catalog item(s)!`);

    const summaryParts = Object.entries(categoryCounts).map(([cat, count]) => `${count} product(s) in ${cat}`);

    res.status(201).json({
      message: `🎉 Successfully created ${insertedProducts.length} catalog item(s): ${summaryParts.join(', ')}!`,
      count: insertedProducts.length,
      categoryCounts,
      products: insertedProducts
    });
  } catch (error) {
    console.error('Error in bulk catalog upload:', error);
    res.status(500).json({
      message: 'Server error during bulk catalog upload: ' + error.message,
      error: error.message,
    });
  }
};

/**
 * @desc    Update product (with optional image replace)
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
const updateProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline. Please whitelist your current public IP address or allow access from anywhere (0.0.0.0/0) in your MongoDB Atlas Network Access settings.',
    });
  }
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const title = req.body.title?.trim();
    const category = req.body.category?.trim();
    const price = req.body.price;
    const description = req.body.description;
    const rating = req.body.rating;

    // Update fields only if provided
    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description.trim();
    if (rating !== undefined) {
      product.rating = Number(rating);
      product.ratingsCount = 1;
      product.ratingsSum = Number(rating);
    }

    let imageUrl = product.image;
    let imagePublicId = product.imagePublicId;
    let images = product.images || [];
    let imagesPublicIds = product.imagesPublicIds || [];
    let videoUrl = product.video || '';
    let videoPublicId = product.videoPublicId || '';

    // If new images uploaded
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map(file => uploadToCloudinary(file.path, 'ld_interiors', 'image'));
      const uploadResults = await Promise.all(uploadPromises);

      // delete all old images safely
      if (product.imagesPublicIds && product.imagesPublicIds.length > 0) {
        for (const id of product.imagesPublicIds) {
          try {
            await deleteFromCloudinary(id, 'image');
          } catch (err) {
            console.error('Old image deletion failed:', err.message);
          }
        }
      } else if (product.imagePublicId) {
        try {
          await deleteFromCloudinary(product.imagePublicId, 'image');
        } catch (err) {
          console.error('Old image deletion failed:', err.message);
        }
      }

      images = uploadResults.map(res => res.url);
      imagesPublicIds = uploadResults.map(res => res.publicId);
      imageUrl = images[0];
      imagePublicId = imagesPublicIds[0];
    }

    // If new video uploaded
    if (req.files && req.files.video && req.files.video.length > 0) {
      // Delete old video if exists
      if (product.videoPublicId) {
        try {
          await deleteFromCloudinary(product.videoPublicId, 'video');
        } catch (err) {
          console.error('Old video deletion failed:', err.message);
        }
      }

      const videoFile = req.files.video[0];
      const videoResult = await uploadToCloudinary(videoFile.path, 'ld_interiors', 'video');
      videoUrl = videoResult.url;
      videoPublicId = videoResult.publicId;
    } else if (req.body.video !== undefined) {
      if (req.body.video !== product.video && product.videoPublicId) {
        try {
          await deleteFromCloudinary(product.videoPublicId, 'video');
        } catch (err) {
          console.error('Old video deletion failed:', err.message);
        }
        videoPublicId = '';
      }
      videoUrl = req.body.video;
    }

    product.image = imageUrl;
    product.imagePublicId = imagePublicId;
    product.images = images;
    product.imagesPublicIds = imagesPublicIds;
    product.video = videoUrl;
    product.videoPublicId = videoPublicId;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Server error updating product',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete product + Cloudinary image
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
const deleteProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline. Please whitelist your current public IP address or allow access from anywhere (0.0.0.0/0) in your MongoDB Atlas Network Access settings.',
    });
  }
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete all images from Cloudinary safely
    if (product.imagesPublicIds && product.imagesPublicIds.length > 0) {
      for (const id of product.imagesPublicIds) {
        try {
          await deleteFromCloudinary(id, 'image');
        } catch (err) {
          console.error('Cloudinary delete failed for ID:', id, err.message);
        }
      }
    } else if (product.imagePublicId) {
      try {
        await deleteFromCloudinary(product.imagePublicId, 'image');
      } catch (err) {
        console.error('Cloudinary delete failed:', err.message);
      }
    }

    // Delete video from Cloudinary safely
    if (product.videoPublicId) {
      try {
        await deleteFromCloudinary(product.videoPublicId, 'video');
      } catch (err) {
        console.error('Cloudinary delete failed for video:', product.videoPublicId, err.message);
      }
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: 'Product and all associated media deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Server error deleting product',
      error: error.message,
    });
  }
};

const rateProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is offline.',
    });
  }
  try {
    const { rating } = req.body;

    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle rolling average calculation safely
    const count = (product.ratingsCount || 0) + 1;
    const sum = (product.ratingsSum || 0) + Number(rating);

    product.ratingsCount = count;
    product.ratingsSum = sum;
    product.rating = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place

    const updatedProduct = await product.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: updatedProduct.rating,
      ratingsCount: updatedProduct.ratingsCount,
    });
  } catch (error) {
    console.error('Error rating product:', error);
    res.status(500).json({
      message: 'Server error rating product',
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  createBulkProducts,
  updateProduct,
  deleteProduct,
  rateProduct,
};