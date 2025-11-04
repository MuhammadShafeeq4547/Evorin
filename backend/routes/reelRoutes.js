// routes/reelRoutes.js
const express = require('express');
const reelController = require('../controllers/reelController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

// Validation
const reelValidation = [
  body('caption')
    .optional()
    .isLength({ max: 2200 })
    .withMessage('Caption cannot exceed 2200 characters')
    .trim(),
  body('hashtags')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        if (tags.length > 30) {
          throw new Error('Cannot have more than 30 hashtags');
        }
      }
      return true;
    })
];

// Routes
router.post('/', auth, upload.single('video'), reelValidation, reelController.createReel);
router.get('/feed', auth, reelController.getReelsFeed);
router.get('/trending', auth, reelController.getTrendingReels);
router.get('/search', auth, reelController.searchReelsByHashtag);
router.get('/:reelId', auth, reelController.getReel);
router.post('/:reelId/like', auth, reelController.toggleLike);
router.post('/:reelId/view', auth, reelController.viewReel);
router.delete('/:reelId', auth, reelController.deleteReel);

module.exports = router;