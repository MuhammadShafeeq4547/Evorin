// utils/pushNotificationService.js
const webpush = require('web-push');
const User = require('../models/User');

// Configure VAPID keys (generate with: npx web-push generate-vapid-keys)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:example@yourdomain.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const pushNotificationService = {
  // Subscribe user to push notifications
  subscribe: async (userId, subscription) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add or update device with push subscription
      const deviceIndex = user.devices.findIndex(
        d => d.pushToken === subscription.endpoint
      );

      if (deviceIndex >= 0) {
        user.devices[deviceIndex].pushToken = JSON.stringify(subscription);
        user.devices[deviceIndex].lastActive = new Date();
      } else {
        user.devices.push({
          deviceId: `device_${Date.now()}`,
          deviceName: 'Web Browser',
          pushToken: JSON.stringify(subscription),
          lastActive: new Date()
        });
      }

      await user.save();
      return { success: true, message: 'Subscribed to push notifications' };
    } catch (error) {
      console.error('Subscribe to push error:', error);
      return { success: false, error: error.message };
    }
  },

  // Unsubscribe from push notifications
  unsubscribe: async (userId, endpoint) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.devices = user.devices.filter(
        d => d.pushToken !== endpoint && d.pushToken !== JSON.stringify(endpoint)
      );

      await user.save();
      return { success: true, message: 'Unsubscribed from push notifications' };
    } catch (error) {
      console.error('Unsubscribe from push error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send push notification to specific user
  sendToUser: async (userId, payload) => {
    try {
      const user = await User.findById(userId);
      if (!user || !user.devices || user.devices.length === 0) {
        return { success: false, message: 'No push subscriptions found' };
      }

      const notificationPayload = JSON.stringify({
        title: payload.title || 'Instagram',
        body: payload.body || 'You have a new notification',
        icon: payload.icon || '/logo192.png',
        badge: payload.badge || '/badge-96x96.png',
        data: payload.data || {},
        tag: payload.tag || 'notification'
      });

      const results = [];

      for (const device of user.devices) {
        if (!device.pushToken) continue;

        try {
          const subscription = JSON.parse(device.pushToken);
          
          const result = await webpush.sendNotification(
            subscription,
            notificationPayload
          );

          results.push({ success: true, device: device.deviceId });
        } catch (error) {
          // If subscription is no longer valid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            user.devices = user.devices.filter(d => d._id.toString() !== device._id.toString());
            await user.save();
          }

          results.push({ success: false, device: device.deviceId, error: error.message });
        }
      }

      return {
        success: true,
        results,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Send push notification error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send notification to multiple users
  sendToMultipleUsers: async (userIds, payload) => {
    const results = [];

    for (const userId of userIds) {
      const result = await pushNotificationService.sendToUser(userId, payload);
      results.push({ userId, ...result });
    }

    return {
      success: true,
      results,
      totalSent: results.reduce((sum, r) => sum + (r.sent || 0), 0),
      totalFailed: results.reduce((sum, r) => sum + (r.failed || 0), 0)
    };
  },

  // Send new follower notification
  sendNewFollowerNotification: async (userId, followerUsername) => {
    return await pushNotificationService.sendToUser(userId, {
      title: 'New Follower',
      body: `${followerUsername} started following you`,
      tag: 'follow',
      data: {
        type: 'follow',
        username: followerUsername,
        url: `/profile/${followerUsername}`
      }
    });
  },

  // Send new like notification
  sendNewLikeNotification: async (userId, likerUsername, postId) => {
    return await pushNotificationService.sendToUser(userId, {
      title: 'New Like',
      body: `${likerUsername} liked your post`,
      tag: 'like',
      data: {
        type: 'like',
        username: likerUsername,
        postId,
        url: `/p/${postId}`
      }
    });
  },

  // Send new comment notification
  sendNewCommentNotification: async (userId, commenterUsername, postId, commentText) => {
    return await pushNotificationService.sendToUser(userId, {
      title: 'New Comment',
      body: `${commenterUsername}: ${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
      tag: 'comment',
      data: {
        type: 'comment',
        username: commenterUsername,
        postId,
        url: `/p/${postId}`
      }
    });
  },

  // Send new message notification
  sendNewMessageNotification: async (userId, senderUsername, messagePreview) => {
    return await pushNotificationService.sendToUser(userId, {
      title: `Message from ${senderUsername}`,
      body: messagePreview.substring(0, 100),
      tag: 'message',
      data: {
        type: 'message',
        username: senderUsername,
        url: '/messages'
      }
    });
  },

  // Get VAPID public key
  getPublicKey: () => {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
};

module.exports = pushNotificationService;