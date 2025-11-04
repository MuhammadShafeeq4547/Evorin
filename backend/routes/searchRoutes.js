// routes/searchRoutes.js
const express = require('express');
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');

const router = express.Router();

// Global search
router.get('/', auth, searchController.globalSearch);

// Search suggestions (autocomplete)
router.get('/suggestions', auth, searchController.getSearchSuggestions);

// Trending hashtags
router.get('/trending/hashtags', auth, searchController.getTrendingHashtags);

// Content by hashtag
router.get('/hashtag/:hashtag', auth, searchController.getPostsByHashtag);

// Content by location
router.get('/location/:location', auth, searchController.getPostsByLocation);

module.exports = router;