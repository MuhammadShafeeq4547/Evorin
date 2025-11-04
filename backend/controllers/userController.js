const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

const userController = {
  // Get user profile (with paginated posts)
  getUserProfile: async (req, res) => {
    try {
      const { username } = req.params;
      const { page = 1, limit = 21 } = req.query;
      const skip = (page - 1) * limit;

      // Find user basic info and followers/following
      const user = await User.findOne({ username })
        .populate('followers', 'username fullName avatar')
        .populate('following', 'username fullName avatar');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Paginate posts for profile
      const posts = await Post.find({ user: user._id, isArchived: false })
        .populate('user', 'username avatar')
        .populate({
          path: 'comments',
          populate: { path: 'user', select: 'username avatar' },
          options: { sort: { createdAt: -1 }, limit: 3 }
        })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean();

      const totalPosts = await Post.countDocuments({ user: user._id, isArchived: false });

      // Attach pagination metadata
      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPosts,
        hasMore: totalPosts > skip + posts.length
      };

      res.json({ success: true, user, posts, pagination });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { fullName, bio, website } = req.body;
      const updates = { fullName, bio, website };

      if (req.file) {
        // Delete old avatar if exists
        if (req.user.avatar) {
          const publicId = req.user.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`instagram_clone/${publicId}`);
        }
        updates.avatar = req.file.path;
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Follow/Unfollow user
  toggleFollow: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentUser = await User.findById(req.user._id);
      const isFollowing = currentUser.following.includes(userId);

      if (isFollowing) {
        // Unfollow
        currentUser.following.pull(userId);
        targetUser.followers.pull(req.user._id);
      } else {
        // Follow
        currentUser.following.push(userId);
        targetUser.followers.push(req.user._id);

        // Create notification
        const notification = new Notification({
          recipient: userId,
          sender: req.user._id,
          type: 'follow',
          message: `${req.user.username} started following you`
        });
        await notification.save();
      }

      await currentUser.save();
      await targetUser.save();

      res.json({
        success: true,
        isFollowing: !isFollowing,
        followersCount: targetUser.followers.length
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Search users
  searchUsers: async (req, res) => {
    try {
      const { query } = req.query;
      
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } }
        ]
      })
      .select('username fullName avatar isVerified')
      .limit(20);

      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Public list of users (limited fields) - useful for health checks or public browsing
  listUsers: async (req, res) => {
    try {
      const users = await User.find({})
        .select('username fullName avatar isVerified')
        .limit(50)
        .lean();

      res.json({ success: true, users });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get suggested users
  getSuggestedUsers: async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit, 10) || 10;

      const currentUser = await User.findById(req.user._id).select('following');
      if (!currentUser) {
        return res.status(404).json({ success: false, message: 'Current user not found' });
      }

      // Build exclude list: users already followed and the current user
      const exclude = Array.isArray(currentUser.following) ? currentUser.following.map(String) : [];
      exclude.push(req.user._id.toString());

      // Find users not followed by current user, limit by query param
      const suggestedUsers = await User.find({ _id: { $nin: exclude } })
        .select('username fullName avatar isVerified')
        .limit(limit)
        .lean();

      res.json({ success: true, users: suggestedUsers });
    } catch (error) {
      console.error('Get suggested users error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getFollowers: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'followers',
          select: 'username fullName avatar isVerified',
          options: {
            limit: parseInt(limit),
            skip: skip
          }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add following status for each follower
      const followersWithStatus = user.followers.map(follower => ({
        ...follower.toObject(),
        isFollowing: req.user.following.includes(follower._id),
        isOwnProfile: follower._id.toString() === req.user._id.toString()
      }));

      res.json({
        success: true,
        followers: followersWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: user.followers.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get following
  getFollowing: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'following',
          select: 'username fullName avatar isVerified',
          options: {
            limit: parseInt(limit),
            skip: skip
          }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add following status for each user
      const followingWithStatus = user.following.map(followedUser => ({
        ...followedUser.toObject(),
        isFollowing: req.user.following.includes(followedUser._id),
        isOwnProfile: followedUser._id.toString() === req.user._id.toString()
      }));

      res.json({
        success: true,
        following: followingWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: user.following.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Block user
  blockUser: async (req, res) => {
    try {
      const { userId } = req.params;

      if (userId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot block yourself'
        });
      }

      const user = await User.findById(req.user._id);
      const targetUser = await User.findById(userId);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add to blocked list if not already blocked
      if (!user.blocked.includes(userId)) {
        user.blocked.push(userId);
      }

      // Remove from following/followers
      user.following.pull(userId);
      targetUser.followers.pull(req.user._id);
      targetUser.following.pull(req.user._id);
      user.followers.pull(userId);

      await user.save();
      await targetUser.save();

      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Unblock user
  unblockUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(req.user._id);
      if (!user.blocked.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: 'User is not blocked'
        });
      }

      user.blocked.pull(userId);
      await user.save();

      res.json({
        success: true,
        message: 'User unblocked successfully'
      });
    } catch (error) {
      console.error('Unblock user error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get blocked users
  getBlockedUsers: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('blocked', 'username fullName avatar');

      res.json({
        success: true,
        blocked: user.blocked
      });
    } catch (error) {
      console.error('Get blocked users error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
,

  // Report a user
  reportUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason, details } = req.body;
      const Report = require('../models/Report');

      const targetUser = await User.findById(userId);
      if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

      const report = new Report({
        reporter: req.user._id,
        targetUser: userId,
        reason,
        details
      });
      await report.save();

      res.json({ success: true, message: 'User reported', report });
    } catch (error) {
      console.error('Report user error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Report a post
  reportPost: async (req, res) => {
    try {
      const { postId } = req.params;
      const { reason, details } = req.body;
      const Report = require('../models/Report');

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      const report = new Report({
        reporter: req.user._id,
        targetPost: postId,
        reason,
        details
      });
      await report.save();

      res.json({ success: true, message: 'Post reported', report });
    } catch (error) {
      console.error('Report post error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = userController;
