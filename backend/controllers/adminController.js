const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

const adminController = {
  // Get basic platform analytics
  analytics: async (req, res) => {
    try {
      const users = await User.countDocuments();
      const posts = await Post.countDocuments();
      const comments = await Comment.countDocuments();
      const reports = await Report.countDocuments({ status: 'open' });

      res.json({ success: true, data: { users, posts, comments, openReports: reports } });
    } catch (error) {
      console.error('Admin analytics error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // List users with pagination
  listUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      const total = await User.countDocuments();
      res.json({ success: true, users, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Block or unblock user
  setUserStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const { action } = req.body; // block | unblock | delete
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (action === 'block') {
        user.isBlocked = true;
        await user.save();
        return res.json({ success: true, message: 'User blocked' });
      }
      if (action === 'unblock') {
        user.isBlocked = false;
        await user.save();
        return res.json({ success: true, message: 'User unblocked' });
      }
      if (action === 'delete') {
        await User.findByIdAndDelete(userId);
        return res.json({ success: true, message: 'User deleted' });
      }

      res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (error) {
      console.error('Set user status error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // List posts
  listPosts: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      const posts = await Post.find()
        .populate('user', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      const total = await Post.countDocuments();
      res.json({ success: true, posts, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
      console.error('List posts error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete post
  deletePost: async (req, res) => {
    try {
      const { postId } = req.params;
      await Post.findByIdAndDelete(postId);
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Manage reports
  listReports: async (req, res) => {
    try {
      const reports = await Report.find()
        .populate('reporter', 'username fullName avatar')
        .populate('targetUser', 'username fullName avatar')
        .populate('targetPost', 'images caption user')
        .sort({ createdAt: -1 });
      res.json({ success: true, reports });
    } catch (error) {
      console.error('List reports error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateReportStatus: async (req, res) => {
    try {
      const { reportId } = req.params;
      const { status } = req.body;
      const report = await Report.findById(reportId);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
      report.status = status;
      await report.save();
      res.json({ success: true, report });
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = adminController;
