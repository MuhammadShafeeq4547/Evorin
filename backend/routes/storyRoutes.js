const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const storyController = require('../controllers/storyController');


// Public stories endpoint (no auth) for health checks or public feeds
router.get('/public', storyController.getPublicStories);

// Upload a story (single file: media)
router.post('/', auth, upload.single('media'), storyController.uploadStory);

// Get all stories available to the user (simple implementation)
router.get('/', auth, storyController.getStories);

// Get stories of a specific user
router.get('/:userId', auth, storyController.getUserStories);

// Mark story as viewed
router.post('/view/:id', auth, storyController.viewStory);

// Highlights
router.post('/highlights', auth, storyController.createHighlight);
// Highlights listing: all highlights for current user or a specific user
router.get('/highlights', auth, storyController.getHighlights);
router.get('/highlights/:userId', auth, storyController.getHighlights);
router.post('/highlights/:highlightId/add', auth, storyController.addStoryToHighlight);
router.post('/highlights/:highlightId/remove', auth, storyController.removeStoryFromHighlight);

module.exports = router;
