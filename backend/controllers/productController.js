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
  updateProduct,
  deleteProduct,
  rateProduct,
};