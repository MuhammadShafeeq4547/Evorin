const Notification = require('../models/Notification');

const notificationController = {
  // Get user notifications with pagination and filtering
  getNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 20, type } = req.query;
      const skip = (page - 1) * limit;

      const query = { recipient: req.user._id };
      if (type && ['like', 'comment', 'follow', 'mention', 'post_tag'].includes(type)) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .populate('sender', 'username fullName avatar isVerified')
        .populate('post', 'images caption')
        .populate('comment', 'text')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const totalCount = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
      });

      res.json({
        success: true,
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasMore: skip + notifications.length < totalCount
        },
        unreadCount
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      if (notification.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      notification.isRead = true;
      await notification.save();

      res.json({ success: true, notification });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
      });

      res.json({ success: true, count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      if (notification.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      await Notification.findByIdAndDelete(notificationId);

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Clear all notifications
  clearAllNotifications: async (req, res) => {
    try {
      await Notification.deleteMany({ recipient: req.user._id });

      res.json({
        success: true,
        message: 'All notifications cleared successfully'
      });
    } catch (error) {
      console.error('Clear all notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = notificationController;
