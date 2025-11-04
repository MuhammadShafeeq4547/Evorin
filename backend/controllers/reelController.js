// controllers/reelController.js
const Reel = require('../models/Reel');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');
const cloudinary = require('../config/cloudinary');

// Socket instance to be injected
let io;

const reelController = {
  // Create new reel
  createReel: async (req, res) => {
    try {
      const { caption, audioName, audioArtist, hashtags, location, allowComments = true, allowRemix = true } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Video file is required'
        });
      }

      // Parse hashtags
      const parsedHashtags = hashtags 
        ? (typeof hashtags === 'string' ? hashtags.split(',').map(tag => tag.trim()) : hashtags)
        : [];

      const reel = new Reel({
        user: req.user._id,
        video: {
          url: req.file.path,
          publicId: req.file.filename,
          duration: req.body.duration || 0,
          thumbnail: req.file.path.replace(/\.(mp4|mov)$/, '.jpg')
        },
        audio: audioName ? {
          name: audioName,
          artist: audioArtist
        } : undefined,
        caption: caption?.trim(),
        hashtags: parsedHashtags,
        location: location?.trim(),
        allowComments,
        allowRemix
      });

      await reel.save();

      // Update user's reels count in analytics
      const today = new Date();
      const analytics = await Analytics.getOrCreate(req.user._id, today);
      await analytics.increment('reelsCreated');

      // Populate user info
      const populatedReel = await Reel.findById(reel._id)
        .populate('user', 'username fullName avatar isVerified');

      // Emit socket event
      if (io) {
        io.emit('new_reel', { reel: populatedReel });
      }

      res.status(201).json({
        success: true,
        message: 'Reel created successfully',
        reel: populatedReel
      });
    } catch (error) {
      console.error('Create reel error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get reels feed (for current user)
  getReelsFeed: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Get current user with following list
      const currentUser = await User.findById(req.user._id);
      const userIds = [...currentUser.following, req.user._id];

      const reels = await Reel.find({
        user: { $in: userIds },
        isArchived: false
      })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      // Add interaction status
      const reelsWithStatus = reels.map(reel => ({
        ...reel,
        isLiked: reel.likes.some(like => like.user.toString() === req.user._id.toString()),
        hasViewed: reel.views.some(view => view.user.toString() === req.user._id.toString()),
        likesCount: reel.likesCount || reel.likes.length,
        commentsCount: reel.commentsCount || reel.comments.length,
        viewsCount: reel.viewsCount || reel.views.length
      }));

      res.json({
        success: true,
        reels: reelsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: reels.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get reels feed error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get trending reels
  getTrendingReels: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      // Get trending reels based on engagement score
      const reels = await Reel.find({
        isArchived: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ engagementScore: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const reelsWithStatus = reels.map(reel => ({
        ...reel,
        isLiked: reel.likes.some(like => like.user.toString() === req.user._id.toString()),
        hasViewed: reel.views.some(view => view.user.toString() === req.user._id.toString()),
        likesCount: reel.likesCount || reel.likes.length,
        commentsCount: reel.commentsCount || reel.comments.length,
        viewsCount: reel.viewsCount || reel.views.length
      }));

      res.json({
        success: true,
        reels: reelsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: reels.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get trending reels error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get single reel
  getReel: async (req, res) => {
    try {
      const { reelId } = req.params;

      const reel = await Reel.findById(reelId)
        .populate('user', 'username fullName avatar isVerified')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'username avatar'
          },
          options: { sort: { createdAt: -1 }, limit: 20 }
        });

      if (!reel) {
        return res.status(404).json({
          success: false,
          message: 'Reel not found'
        });
      }

      // Add interaction status
      const reelWithStatus = {
        ...reel.toObject(),
        isLiked: reel.likes.some(like => like.user.toString() === req.user._id.toString()),
        hasViewed: reel.views.some(view => view.user.toString() === req.user._id.toString()),
        likesCount: reel.likesCount || reel.likes.length,
        commentsCount: reel.commentsCount || reel.comments.length,
        viewsCount: reel.viewsCount || reel.views.length
      };

      res.json({
        success: true,
        reel: reelWithStatus
      });
    } catch (error) {
      console.error('Get reel error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Like/Unlike reel
  toggleLike: async (req, res) => {
    try {
      const { reelId } = req.params;
      const reel = await Reel.findById(reelId);

      if (!reel) {
        return res.status(404).json({
          success: false,
          message: 'Reel not found'
        });
      }

      const existingLike = reel.likes.find(
        like => like.user.toString() === req.user._id.toString()
      );

      let isLiked;
      if (existingLike) {
        // Unlike
        await Reel.findByIdAndUpdate(reelId, {
          $pull: { likes: { user: req.user._id } },
          $inc: { likesCount: -1 }
        });
        isLiked = false;
      } else {
        // Like
        await Reel.findByIdAndUpdate(reelId, {
          $push: { likes: { user: req.user._id } },
          $inc: { likesCount: 1 }
        });

        // Create notification
        if (reel.user.toString() !== req.user._id.toString()) {
          const notification = new Notification({
            recipient: reel.user,
            sender: req.user._id,
            type: 'like',
            post: reelId,
            message: `${req.user.username} liked your reel`
          });
          await notification.save();

          // Emit socket notification
          if (io) {
            io.to(reel.user.toString()).emit('new_notification', notification);
          }
        }

        isLiked = true;
      }

      const updated = await Reel.findById(reelId).select('likesCount');

      // Emit socket event
      if (io) {
        io.emit('reel_liked', {
          reelId,
          likesCount: updated.likesCount,
          userId: req.user._id.toString(),
          isLiked
        });
      }

      res.json({
        success: true,
        isLiked,
        likesCount: updated.likesCount
      });
    } catch (error) {
      console.error('Toggle reel like error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Track reel view
  viewReel: async (req, res) => {
    try {
      const { reelId } = req.params;
      const { duration = 0 } = req.body;

      const reel = await Reel.findById(reelId);

      if (!reel) {
        return res.status(404).json({
          success: false,
          message: 'Reel not found'
        });
      }

      // Check if user already viewed
      const existingView = reel.views.find(
        view => view.user.toString() === req.user._id.toString()
      );

      if (!existingView) {
        reel.views.push({
          user: req.user._id,
          duration
        });
        reel.viewsCount = (reel.viewsCount || 0) + 1;
        await reel.save();
      }

      res.json({
        success: true,
        viewsCount: reel.viewsCount
      });
    } catch (error) {
      console.error('View reel error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete reel
  deleteReel: async (req, res) => {
    try {
      const { reelId } = req.params;
      const reel = await Reel.findById(reelId);

      if (!reel) {
        return res.status(404).json({
          success: false,
          message: 'Reel not found'
        });
      }

      // Check authorization
      if (reel.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Delete video from cloudinary
      if (reel.video.publicId) {
        try {
          await cloudinary.uploader.destroy(reel.video.publicId, {
            resource_type: 'video'
          });
        } catch (err) {
          console.error('Cloudinary deletion error:', err);
        }
      }

      // Delete associated comments
      await Comment.deleteMany({ post: reelId });

      // Delete notifications
      await Notification.deleteMany({ post: reelId });

      await Reel.findByIdAndDelete(reelId);

      res.json({
        success: true,
        message: 'Reel deleted successfully'
      });
    } catch (error) {
      console.error('Delete reel error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Search reels by hashtag
  searchReelsByHashtag: async (req, res) => {
    try {
      const { hashtag, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const reels = await Reel.find({
        hashtags: { $in: [new RegExp(hashtag, 'i')] },
        isArchived: false
      })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ engagementScore: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const reelsWithStatus = reels.map(reel => ({
        ...reel,
        isLiked: reel.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: reel.likesCount || reel.likes.length,
        commentsCount: reel.commentsCount || reel.comments.length,
        viewsCount: reel.viewsCount || reel.views.length
      }));

      res.json({
        success: true,
        reels: reelsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: reels.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Search reels error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

// Socket instance setter
reelController.setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

module.exports = reelController;