// controllers/searchController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Reel = require('../models/Reel');

const searchController = {
  // Global search across all content types
  globalSearch: async (req, res) => {
    try {
      const { query, type, page = 1, limit = 20 } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(query.trim(), 'i');
      
      let results = {
        users: [],
        posts: [],
        reels: [],
        hashtags: [],
        locations: []
      };

      // Search users
      if (!type || type === 'users') {
        results.users = await User.find({
          $or: [
            { username: searchRegex },
            { fullName: searchRegex }
          ],
          isBlocked: { $ne: true }
        })
          .select('username fullName avatar isVerified bio')
          .limit(parseInt(limit))
          .skip(skip)
          .lean();

        // Add following status
        results.users = results.users.map(user => ({
          ...user,
          isFollowing: req.user.following.includes(user._id),
          isOwnProfile: user._id.toString() === req.user._id.toString()
        }));
      }

      // Search posts
      if (!type || type === 'posts') {
        results.posts = await Post.find({
          $or: [
            { caption: searchRegex },
            { tags: searchRegex },
            { location: searchRegex }
          ],
          isArchived: false
        })
          .populate('user', 'username fullName avatar isVerified')
          .sort({ likesCount: -1, createdAt: -1 })
          .limit(parseInt(limit))
          .skip(skip)
          .lean();

        results.posts = results.posts.map(post => ({
          ...post,
          isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
          likesCount: post.likesCount || post.likes.length,
          commentsCount: post.comments.length
        }));
      }

      // Search reels
      if (!type || type === 'reels') {
        results.reels = await Reel.find({
          $or: [
            { caption: searchRegex },
            { hashtags: searchRegex }
          ],
          isArchived: false
        })
          .populate('user', 'username fullName avatar isVerified')
          .sort({ engagementScore: -1, createdAt: -1 })
          .limit(parseInt(limit))
          .skip(skip)
          .lean();

        results.reels = results.reels.map(reel => ({
          ...reel,
          isLiked: reel.likes.some(like => like.user.toString() === req.user._id.toString()),
          likesCount: reel.likesCount || reel.likes.length,
          viewsCount: reel.viewsCount || reel.views.length
        }));
      }

      // Search hashtags (aggregate from posts and reels)
      if (!type || type === 'hashtags') {
        const postHashtags = await Post.aggregate([
          { $match: { tags: searchRegex, isArchived: false } },
          { $unwind: '$tags' },
          { $match: { tags: searchRegex } },
          { $group: { _id: '$tags', count: { $sum: 1 }, posts: { $push: '$_id' } } },
          { $sort: { count: -1 } },
          { $limit: parseInt(limit) }
        ]);

        const reelHashtags = await Reel.aggregate([
          { $match: { hashtags: searchRegex, isArchived: false } },
          { $unwind: '$hashtags' },
          { $match: { hashtags: searchRegex } },
          { $group: { _id: '$hashtags', count: { $sum: 1 }, reels: { $push: '$_id' } } },
          { $sort: { count: -1 } },
          { $limit: parseInt(limit) }
        ]);

        // Merge and sort hashtags
        const hashtagMap = new Map();
        
        postHashtags.forEach(tag => {
          hashtagMap.set(tag._id.toLowerCase(), {
            hashtag: tag._id,
            postsCount: tag.count,
            reelsCount: 0,
            totalCount: tag.count
          });
        });

        reelHashtags.forEach(tag => {
          const key = tag._id.toLowerCase();
          if (hashtagMap.has(key)) {
            const existing = hashtagMap.get(key);
            existing.reelsCount = tag.count;
            existing.totalCount += tag.count;
          } else {
            hashtagMap.set(key, {
              hashtag: tag._id,
              postsCount: 0,
              reelsCount: tag.count,
              totalCount: tag.count
            });
          }
        });

        results.hashtags = Array.from(hashtagMap.values())
          .sort((a, b) => b.totalCount - a.totalCount)
          .slice(0, parseInt(limit));
      }

      // Search locations
      if (!type || type === 'locations') {
        const locations = await Post.aggregate([
          { $match: { location: searchRegex, isArchived: false } },
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: parseInt(limit) }
        ]);

        results.locations = locations.map(loc => ({
          location: loc._id,
          postsCount: loc.count
        }));
      }

      res.json({
        success: true,
        query: query.trim(),
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Global search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get trending hashtags
  getTrendingHashtags: async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Get trending hashtags from recent posts
      const postHashtags = await Post.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, isArchived: false } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);

      // Get trending hashtags from recent reels
      const reelHashtags = await Reel.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, isArchived: false } },
        { $unwind: '$hashtags' },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);

      // Merge and sort
      const hashtagMap = new Map();
      
      postHashtags.forEach(tag => {
        hashtagMap.set(tag._id.toLowerCase(), {
          hashtag: tag._id,
          postsCount: tag.count,
          reelsCount: 0,
          totalCount: tag.count
        });
      });

      reelHashtags.forEach(tag => {
        const key = tag._id.toLowerCase();
        if (hashtagMap.has(key)) {
          const existing = hashtagMap.get(key);
          existing.reelsCount = tag.count;
          existing.totalCount += tag.count;
        } else {
          hashtagMap.set(key, {
            hashtag: tag._id,
            postsCount: 0,
            reelsCount: tag.count,
            totalCount: tag.count
          });
        }
      });

      const trending = Array.from(hashtagMap.values())
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        hashtags: trending
      });
    } catch (error) {
      console.error('Get trending hashtags error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get posts by hashtag
  getPostsByHashtag: async (req, res) => {
    try {
      const { hashtag } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const posts = await Post.find({
        tags: { $in: [new RegExp(`^${hashtag}$`, 'i')] },
        isArchived: false
      })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ likesCount: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const total = await Post.countDocuments({
        tags: { $in: [new RegExp(`^${hashtag}$`, 'i')] },
        isArchived: false
      });

      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likesCount || post.likes.length,
        commentsCount: post.comments.length
      }));

      res.json({
        success: true,
        hashtag,
        posts: postsWithStatus,
        postsCount: total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          hasMore: skip + posts.length < total
        }
      });
    } catch (error) {
      console.error('Get posts by hashtag error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get posts by location
  getPostsByLocation: async (req, res) => {
    try {
      const { location } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const posts = await Post.find({
        location: new RegExp(location, 'i'),
        isArchived: false
      })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const total = await Post.countDocuments({
        location: new RegExp(location, 'i'),
        isArchived: false
      });

      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likesCount || post.likes.length,
        commentsCount: post.comments.length
      }));

      res.json({
        success: true,
        location,
        posts: postsWithStatus,
        postsCount: total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          hasMore: skip + posts.length < total
        }
      });
    } catch (error) {
      console.error('Get posts by location error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get search suggestions (autocomplete)
  getSearchSuggestions: async (req, res) => {
    try {
      const { query } = req.query;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          suggestions: []
        });
      }

      const searchRegex = new RegExp(`^${query.trim()}`, 'i');

      // Get user suggestions
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex }
        ]
      })
        .select('username fullName avatar')
        .limit(5)
        .lean();

      // Get hashtag suggestions
      const hashtags = await Post.aggregate([
        { $match: { tags: searchRegex } },
        { $unwind: '$tags' },
        { $match: { tags: searchRegex } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Get location suggestions
      const locations = await Post.aggregate([
        { $match: { location: searchRegex } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        success: true,
        suggestions: {
          users: users.map(u => ({
            type: 'user',
            id: u._id,
            username: u.username,
            fullName: u.fullName,
            avatar: u.avatar
          })),
          hashtags: hashtags.map(h => ({
            type: 'hashtag',
            hashtag: h._id,
            count: h.count
          })),
          locations: locations.map(l => ({
            type: 'location',
            location: l._id,
            count: l.count
          }))
        }
      });
    } catch (error) {
      console.error('Get search suggestions error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = searchController;