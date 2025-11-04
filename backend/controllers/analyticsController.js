// controllers/analyticsController.js
const Analytics = require('../models/Analytics');
const Post = require('../models/Post');
const Reel = require('../models/Reel');
const User = require('../models/User');
const Story = require('../models/Story');

const analyticsController = {
  // Get user analytics overview
  getUserAnalytics: async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      startDate.setHours(0, 0, 0, 0);

      // Get analytics for the period
      const analytics = await Analytics.find({
        user: req.user._id,
        date: { $gte: startDate }
      }).sort({ date: 1 });

      // Calculate totals
      const totals = analytics.reduce((acc, day) => ({
        profileViews: acc.profileViews + day.profileViews,
        postsCreated: acc.postsCreated + day.postsCreated,
        storiesCreated: acc.storiesCreated + day.storiesCreated,
        reelsCreated: acc.reelsCreated + day.reelsCreated,
        totalLikes: acc.totalLikes + day.totalLikes,
        totalComments: acc.totalComments + day.totalComments,
        totalShares: acc.totalShares + day.totalShares,
        followersGained: acc.followersGained + day.followersGained,
        followersLost: acc.followersLost + day.followersLost
      }), {
        profileViews: 0,
        postsCreated: 0,
        storiesCreated: 0,
        reelsCreated: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        followersGained: 0,
        followersLost: 0
      });

      // Get current stats
      const user = await User.findById(req.user._id);
      const postsCount = await Post.countDocuments({ user: req.user._id, isArchived: false });
      const reelsCount = await Reel.countDocuments({ user: req.user._id, isArchived: false });

      // Calculate engagement rate
      const totalEngagement = totals.totalLikes + totals.totalComments + totals.totalShares;
      const totalContent = totals.postsCreated + totals.reelsCreated;
      const engagementRate = totalContent > 0 
        ? ((totalEngagement / totalContent) * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        period: {
          days: parseInt(days),
          startDate,
          endDate: new Date()
        },
        overview: {
          followers: user.followers.length,
          following: user.following.length,
          posts: postsCount,
          reels: reelsCount,
          engagementRate: `${engagementRate}%`
        },
        totals,
        daily: analytics.map(day => ({
          date: day.date,
          profileViews: day.profileViews,
          likes: day.totalLikes,
          comments: day.totalComments,
          followers: day.followersGained - day.followersLost
        }))
      });
    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get post insights
  getPostInsights: async (req, res) => {
    try {
      const { postId } = req.params;

      const post = await Post.findById(postId).populate('user', 'username');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check authorization
      if (post.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view insights for this post'
        });
      }

      // Calculate metrics
      const likesCount = post.likesCount || post.likes.length;
      const commentsCount = post.comments.length;
      const sharesCount = post.shares?.length || 0;
      const savesCount = post.insights?.saves || 0;
      const reach = post.insights?.reach || post.views?.length || 0;

      const totalEngagement = likesCount + commentsCount + sharesCount + savesCount;
      const engagementRate = reach > 0 
        ? ((totalEngagement / reach) * 100).toFixed(2)
        : 0;

      // Get likes by day
      const likesByDay = {};
      post.likes.forEach(like => {
        const date = new Date(like.createdAt).toISOString().split('T')[0];
        likesByDay[date] = (likesByDay[date] || 0) + 1;
      });

      res.json({
        success: true,
        post: {
          id: post._id,
          caption: post.caption,
          createdAt: post.createdAt
        },
        metrics: {
          likes: likesCount,
          comments: commentsCount,
          shares: sharesCount,
          saves: savesCount,
          reach: reach,
          engagement: totalEngagement,
          engagementRate: `${engagementRate}%`
        },
        likesByDay,
        topComments: post.comments.slice(0, 5)
      });
    } catch (error) {
      console.error('Get post insights error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get reel insights
  getReelInsights: async (req, res) => {
    try {
      const { reelId } = req.params;

      const reel = await Reel.findById(reelId).populate('user', 'username');

      if (!reel) {
        return res.status(404).json({
          success: false,
          message: 'Reel not found'
        });
      }

      // Check authorization
      if (reel.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view insights for this reel'
        });
      }

      const likesCount = reel.likesCount || reel.likes.length;
      const commentsCount = reel.commentsCount || reel.comments.length;
      const viewsCount = reel.viewsCount || reel.views.length;
      const sharesCount = reel.sharesCount || reel.shares.length;

      const totalEngagement = likesCount + commentsCount + sharesCount;
      const engagementRate = viewsCount > 0 
        ? ((totalEngagement / viewsCount) * 100).toFixed(2)
        : 0;

      // Calculate average watch time
      const totalWatchTime = reel.views.reduce((sum, view) => sum + (view.duration || 0), 0);
      const avgWatchTime = viewsCount > 0 
        ? (totalWatchTime / viewsCount).toFixed(2)
        : 0;

      // Get views by day
      const viewsByDay = {};
      reel.views.forEach(view => {
        const date = new Date(view.viewedAt).toISOString().split('T')[0];
        viewsByDay[date] = (viewsByDay[date] || 0) + 1;
      });

      res.json({
        success: true,
        reel: {
          id: reel._id,
          caption: reel.caption,
          duration: reel.video.duration,
          createdAt: reel.createdAt
        },
        metrics: {
          views: viewsCount,
          likes: likesCount,
          comments: commentsCount,
          shares: sharesCount,
          engagement: totalEngagement,
          engagementRate: `${engagementRate}%`,
          avgWatchTime: `${avgWatchTime}s`,
          watchRate: reel.video.duration > 0 
            ? `${((avgWatchTime / reel.video.duration) * 100).toFixed(2)}%`
            : '0%'
        },
        viewsByDay
      });
    } catch (error) {
      console.error('Get reel insights error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get audience insights
  getAudienceInsights: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('followers', 'username fullName avatar createdAt');

      // Calculate follower growth
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentFollowers = user.followers.filter(
        follower => new Date(follower.createdAt) >= thirtyDaysAgo
      );

      // Get analytics for follower activity
      const analytics = await Analytics.find({
        user: req.user._id,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: 1 });

      const followerGrowth = analytics.map(day => ({
        date: day.date,
        gained: day.followersGained,
        lost: day.followersLost,
        net: day.followersGained - day.followersLost
      }));

      res.json({
        success: true,
        audience: {
          total: user.followers.length,
          recentGrowth: recentFollowers.length,
          growthRate: user.followers.length > 0
            ? `${((recentFollowers.length / user.followers.length) * 100).toFixed(2)}%`
            : '0%'
        },
        followerGrowth,
        topFollowers: user.followers
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
      });
    } catch (error) {
      console.error('Get audience insights error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get content performance
  getContentPerformance: async (req, res) => {
    try {
      const { type = 'posts', limit = 10 } = req.query;

      let content;
      if (type === 'posts') {
        content = await Post.find({ 
          user: req.user._id,
          isArchived: false 
        })
          .select('caption images likesCount commentsCount createdAt')
          .sort({ likesCount: -1 })
          .limit(parseInt(limit))
          .lean();
      } else if (type === 'reels') {
        content = await Reel.find({ 
          user: req.user._id,
          isArchived: false 
        })
          .select('caption video.thumbnail likesCount viewsCount engagementScore createdAt')
          .sort({ engagementScore: -1 })
          .limit(parseInt(limit))
          .lean();
      }

      res.json({
        success: true,
        type,
        content: content.map(item => ({
          id: item._id,
          caption: item.caption,
          thumbnail: item.images?.[0]?.url || item.video?.thumbnail,
          likes: item.likesCount || 0,
          comments: item.commentsCount || 0,
          views: item.viewsCount || 0,
          engagement: item.engagementScore || 0,
          createdAt: item.createdAt
        }))
      });
    } catch (error) {
      console.error('Get content performance error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Track profile view
  trackProfileView: async (req, res) => {
    try {
      const { userId } = req.params;

      // Don't track own profile views
      if (userId === req.user._id.toString()) {
        return res.json({ success: true });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const analytics = await Analytics.getOrCreate(userId, today);

      // Check if user already viewed today
      const alreadyViewed = analytics.profileViewers.some(
        viewer => viewer.user.toString() === req.user._id.toString()
      );

      if (!alreadyViewed) {
        analytics.profileViews += 1;
        analytics.profileViewers.push({
          user: req.user._id,
          viewedAt: new Date()
        });
        await analytics.save();
      }

      res.json({
        success: true,
        message: 'Profile view tracked'
      });
    } catch (error) {
      console.error('Track profile view error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = analyticsController;