const express = require('express');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

const messageValidation = [
  body('text')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim(),
  body('messageType')
    .isIn(['text', 'image', 'post'])
    .withMessage('Invalid message type'),
  body('postId')
    .optional()
    .isMongoId()
    .withMessage('Invalid post ID')
];

// Get all user chats
router.get('/', auth, chatController.getUserChats);

// Create or get chat with specific user
router.get('/:userId', auth, chatController.getOrCreateChat);

// Send message to chat
router.post('/:chatId/message', auth, upload.single('image'), messageValidation, chatController.sendMessage);

// Get chat messages
router.get('/messages/:chatId', auth, chatController.getChatMessages);

// Mark messages as read
router.post('/:chatId/read', auth, chatController.markAsRead);

// Delete chat
router.delete('/:chatId', auth, chatController.deleteChat);

// Message interactions - FIXED PATHS
router.post('/:chatId/messages/:messageId/react', auth, chatController.reactToMessage);
router.put('/:chatId/messages/:messageId', auth, chatController.editMessage);
router.delete('/:chatId/messages/:messageId', auth, chatController.deleteMessage);
router.get('/:chatId/search', auth, chatController.searchMessages);

// Group chat management - FIXED PATHS
router.post('/group', auth, chatController.createGroupChat);
router.put('/:chatId/group', auth, upload.single('avatar'), chatController.updateGroupChat);

module.exports = router;