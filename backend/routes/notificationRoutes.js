const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, notificationController.getNotifications);
router.post('/:notificationId/read', auth, notificationController.markAsRead);
router.post('/read-all', auth, notificationController.markAllAsRead);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.delete('/:notificationId', auth, notificationController.deleteNotification);
router.delete('/clear-all', auth, notificationController.clearAllNotifications);

module.exports = router;