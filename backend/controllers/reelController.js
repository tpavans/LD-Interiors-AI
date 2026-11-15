const Reel = require('../models/Reel');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * Extract YouTube ID from various YouTube URL formats (Shorts, youtu.be, watch)
 */
function extractYouTubeId(url) {
  if (!url) return '';
  try {
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    if (url.includes('embed/')) {
      const parts = url.split('embed/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
  } catch (e) {
    return '';
  }
  return '';
}

/**
 * 1. Get All Workshop Reels (Real-Time from Database)
 * GET /api/reels
 */
exports.getReels = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(category, 'i');
    }

    if (search && search.trim()) {
      const s = search.trim();
      filter.$or = [
        { title: new RegExp(s, 'i') },
        { category: new RegExp(s, 'i') },
        { description: new RegExp(s, 'i') }
      ];
    }

    // 1. Fetch from Reel collection
    const reelsFromDb = await Reel.find(filter).sort({ createdAt: -1 }).lean();

    // 2. Fetch products with uploaded video or video links
    const productFilter = { video: { $exists: true, $ne: '' } };
    if (category && category !== 'All') {
      productFilter.category = new RegExp(category, 'i');
    }
    const productsWithVideo = await Product.find(productFilter).sort({ createdAt: -1 }).lean();

    // Merge: do not duplicate if already in Reel collection
    const combined = [...reelsFromDb];
    const existingVideoUrls = new Set(reelsFromDb.map(r => (r.video || '').trim()));

    productsWithVideo.forEach(prod => {
      const vid = (prod.video || '').trim();
      if (vid && !existingVideoUrls.has(vid)) {
        existingVideoUrls.add(vid);
        let prodImage = prod.image || '';
        if (!prodImage) {
          const ytId = extractYouTubeId(vid);
          if (ytId) {
            prodImage = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          }
        }
        combined.push({
          _id: prod._id,
          title: prod.title,
          category: prod.category || 'Workshop',
          video: prod.video,
          videoPublicId: prod.videoPublicId || '',
          image: prodImage,
          imagePublicId: prod.imagePublicId || '',
          price: prod.price || 0,
          description: prod.description || '',
          views: prod.views || 0,
          likes: prod.likes || 0,
          likedBy: prod.likedBy || [],
          productId: prod._id.toString(),
          createdAt: prod.createdAt,
          isProductSource: true
        });
      }
    });

    res.json({
      success: true,
      count: combined.length,
      reels: combined
    });
  } catch (error) {
    console.error('Error fetching workshop reels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workshop reels'
    });
  }
};

/**
 * 2. Create a Workshop Reel (Admin Only)
 * POST /api/reels
 * Accepts: video file OR video link URL, title, category, price, image file OR image URL
 */
exports.createReel = async (req, res) => {
  try {
    const { title, category, price, description, productId } = req.body;
    let videoUrl = (req.body.video || '').trim();
    let videoPublicId = '';
    let imageUrl = (req.body.image || '').trim();
    let imagePublicId = '';

    // Handle Uploaded Video File if present
    const videoFile = req.files?.video?.[0] || (req.file?.fieldname === 'video' ? req.file : null);
    if (videoFile) {
      try {
        const vidResult = await uploadToCloudinary(videoFile.path, 'ld_interiors/reels', 'video');
        if (vidResult?.url) {
          videoUrl = vidResult.url;
          videoPublicId = vidResult.publicId;
        }
      } catch (uploadErr) {
        console.error('Cloudinary reel video upload error:', uploadErr);
        return res.status(500).json({
          success: false,
          message: 'Video upload failed: ' + uploadErr.message
        });
      }
    }

    // Handle Uploaded Image File if present
    const imageFile = req.files?.image?.[0] || (req.file?.fieldname === 'image' ? req.file : null);
    if (imageFile) {
      try {
        const imgResult = await uploadToCloudinary(imageFile.path, 'ld_interiors/reels', 'image');
        if (imgResult?.url) {
          imageUrl = imgResult.url;
          imagePublicId = imgResult.publicId;
        }
      } catch (imgErr) {
        console.error('Cloudinary reel image upload error:', imgErr);
      }
    }

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reel title is required.'
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a video reel link (e.g., YouTube Shorts, Instagram Reel, MP4) or upload a video file.'
      });
    }

    // Auto-generate thumbnail from YouTube if image was not provided
    if (!imageUrl) {
      const ytId = extractYouTubeId(videoUrl);
      if (ytId) {
        imageUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      } else {
        // Fallback default image
        imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
      }
    }

    const newReel = await Reel.create({
      title: title.trim(),
      category: (category && category.trim()) || 'Workshop',
      video: videoUrl,
      videoPublicId,
      image: imageUrl,
      imagePublicId,
      price: Number(price) || 0,
      description: (description && description.trim()) || '',
      productId: productId || '',
      views: 0,
      likes: 0,
      likedBy: [],
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Workshop reel uploaded successfully!',
      reel: newReel
    });
  } catch (error) {
    console.error('Error creating workshop reel:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating workshop reel.'
    });
  }
};

/**
 * 3. Update Reel (Admin Only)
 * PUT /api/reels/:id
 */
exports.updateReel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, price, description, video, image } = req.body;

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found.' });
    }

    if (title) reel.title = title.trim();
    if (category) reel.category = category.trim();
    if (price !== undefined) reel.price = Number(price) || 0;
    if (description !== undefined) reel.description = description.trim();
    if (video) reel.video = video.trim();
    if (image) reel.image = image.trim();

    await reel.save();

    res.json({
      success: true,
      message: 'Workshop reel updated successfully.',
      reel
    });
  } catch (error) {
    console.error('Error updating reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workshop reel.'
    });
  }
};

/**
 * 4. Delete Reel (Admin Only)
 * DELETE /api/reels/:id
 */
exports.deleteReel = async (req, res) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (reel) {
      // Cleanup Cloudinary media
      if (reel.videoPublicId) {
        try {
          await deleteFromCloudinary(reel.videoPublicId, 'video');
        } catch (e) {
          console.warn('Failed to delete reel video from Cloudinary:', e.message);
        }
      }
      if (reel.imagePublicId) {
        try {
          await deleteFromCloudinary(reel.imagePublicId, 'image');
        } catch (e) {
          console.warn('Failed to delete reel image from Cloudinary:', e.message);
        }
      }
      await Reel.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Reel deleted successfully.' });
    }

    // Check if it was a Product with video
    const product = await Product.findById(id);
    if (product && product.video) {
      product.video = '';
      if (product.videoPublicId) {
        try {
          await deleteFromCloudinary(product.videoPublicId, 'video');
        } catch (e) {}
        product.videoPublicId = '';
      }
      await product.save();
      return res.json({ success: true, message: 'Product video removed successfully.' });
    }

    res.status(404).json({ success: false, message: 'Reel record not found.' });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reel.'
    });
  }
};

/**
 * 5. Increment Real-Time View Count
 * POST /api/reels/:id/view
 */
exports.incrementView = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false });

    // Try finding in Reel collection
    let reel = await Reel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    // If not in Reel, try Product collection
    if (!reel) {
      reel = await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
    }

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    res.json({
      success: true,
      views: reel.views || 0
    });
  } catch (error) {
    console.warn('Error recording reel view:', error.message);
    res.status(500).json({ success: false });
  }
};

/**
 * 6. Toggle Real-Time Like Count
 * POST /api/reels/:id/like
 */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = (req.body.clientId || req.ip || 'anonymous_user').toString();

    // Check Reel collection first
    let reel = await Reel.findById(id);
    let isProduct = false;

    if (!reel) {
      reel = await Product.findById(id);
      isProduct = true;
    }

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const likedByList = Array.isArray(reel.likedBy) ? reel.likedBy : [];
    const isAlreadyLiked = likedByList.includes(clientId);

    let updatedDoc;
    let liked = false;

    if (isAlreadyLiked) {
      // Unlike
      const update = {
        $inc: { likes: -1 },
        $pull: { likedBy: clientId }
      };
      if (isProduct) {
        updatedDoc = await Product.findByIdAndUpdate(id, update, { new: true });
      } else {
        updatedDoc = await Reel.findByIdAndUpdate(id, update, { new: true });
      }
      liked = false;
    } else {
      // Like
      const update = {
        $inc: { likes: 1 },
        $addToSet: { likedBy: clientId }
      };
      if (isProduct) {
        updatedDoc = await Product.findByIdAndUpdate(id, update, { new: true });
      } else {
        updatedDoc = await Reel.findByIdAndUpdate(id, update, { new: true });
      }
      liked = true;
    }

    // Ensure likes never drop below 0
    const finalLikes = Math.max(0, updatedDoc?.likes || 0);
    if (updatedDoc?.likes < 0) {
      if (isProduct) {
        await Product.findByIdAndUpdate(id, { likes: 0 });
      } else {
        await Reel.findByIdAndUpdate(id, { likes: 0 });
      }
    }

    res.json({
      success: true,
      liked,
      likes: finalLikes
    });
  } catch (error) {
    console.error('Error toggling reel like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like status'
    });
  }
};
