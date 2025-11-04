// routes/analyticsRoutes.js
const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

const router = express.Router();

// User analytics
router.get('/user', auth, analyticsController.getUserAnalytics);
router.get('/audience', auth, analyticsController.getAudienceInsights);
router.get('/content', auth, analyticsController.getContentPerformance);

// Post/Reel insights
router.get('/post/:postId', auth, analyticsController.getPostInsights);
router.get('/reel/:reelId', auth, analyticsController.getReelInsights);

// Track profile view
router.post('/profile-view/:userId', auth, analyticsController.trackProfileView);

module.exports = router;