const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes the local temporary file.
 * For videos, uses upload_large chunked streaming to prevent timeouts.
 * @param {string} filePath - Path to the temporary local file
 * @param {string} folder - Folder name on Cloudinary
 * @param {string} resourceType - Resource type ('image', 'video', 'auto')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = async (filePath, folder = 'ld_interiors', resourceType = 'auto') => {
  try {
    let result;
    if (resourceType === 'video') {
      // For videos, use chunked upload_large to prevent timeouts and memory overflow on large files
      result = await cloudinary.uploader.upload_large(filePath, {
        folder: folder,
        resource_type: 'video',
        chunk_size: 6000000, // 6 MB chunks
        timeout: 180000,     // 3 minutes timeout
      });
    } else {
      const options = {
        folder: folder,
        resource_type: resourceType,
      };
      if (resourceType === 'image' || resourceType === 'auto') {
        options.transformation = [{ width: 1600, crop: 'limit', quality: 'auto:good' }];
      }
      result = await cloudinary.uploader.upload(filePath, options);
    }

    // Remove local file safely
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.warn('Failed to unlink local file:', unlinkErr.message);
      }
    }
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Make sure to clean up the local file even if upload fails
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.warn('Failed to unlink local file on error:', unlinkErr.message);
      }
    }
    console.error('Cloudinary upload utility error:', error);
    throw new Error('Upload failed: ' + error.message);
  }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - Public ID of the asset
 * @param {string} resourceType - Resource type ('image', 'video')
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete utility error:', error);
    throw new Error('Deletion failed: ' + error.message);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
