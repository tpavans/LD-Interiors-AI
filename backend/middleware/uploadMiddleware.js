const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads temporary directory exists
const tempUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Filter to check file MIME type and extensions (both images and videos allowed)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = [
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
    '.mp4', '.mov', '.webm', '.m4v', '.mkv', '.avi', '.3gp'
  ];
  if (
    (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))) ||
    allowedExts.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit for videos
  },
});

module.exports = upload;
