const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

// Public list endpoint (no auth)
router.get('/list', userController.listUsers);

const profileUpdateValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Full name must be between 1 and 50 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 150 })
    .withMessage('Bio cannot exceed 150 characters')
    .trim(),
  body('website')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid website URL')
];

router.get('/profile/:username', auth, userController.getUserProfile);
router.put('/profile', auth, upload.single('avatar'), profileUpdateValidation, userController.updateProfile);
router.post('/follow/:userId', auth, userController.toggleFollow);
router.get('/followers/:userId', auth, userController.getFollowers);
router.get('/following/:userId', auth, userController.getFollowing);
router.get('/search', auth, userController.searchUsers);
router.get('/suggested', auth, userController.getSuggestedUsers);
router.post('/block/:userId', auth, userController.blockUser);
router.post('/unblock/:userId', auth, userController.unblockUser);
router.get('/blocked', auth, userController.getBlockedUsers);
router.post('/report/user/:userId', auth, userController.reportUser);
router.post('/report/post/:postId', auth, userController.reportPost);

module.exports = router;
