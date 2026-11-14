const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// 1. Get All Workshop Reels (Public)
router.get('/', reelController.getReels);

// 2. Create Workshop Reel (Admin Protected, supports video and image upload)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  reelController.createReel
);

// 3. Update Workshop Reel (Admin Protected)
router.put('/:id', protect, reelController.updateReel);

// 4. Delete Workshop Reel (Admin Protected)
router.delete('/:id', protect, reelController.deleteReel);

// 5. Increment Real-Time View Count (Public)
router.post('/:id/view', reelController.incrementView);

// 6. Toggle Real-Time Like Count (Public)
router.post('/:id/like', reelController.toggleLike);

module.exports = router;
