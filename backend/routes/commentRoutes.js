const express = require('express');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

const commentValidation = [
  body('text')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .trim()
];

const replyValidation = [
  body('text')
    .isLength({ min: 1, max: 300 })
    .withMessage('Reply must be between 1 and 300 characters')
    .trim()
];

router.post('/:postId', auth, commentValidation, commentController.addComment);
router.get('/:postId', auth, commentController.getPostComments);
router.post('/like/:commentId', auth, commentController.toggleCommentLike);
router.post('/:commentId/reply', auth, replyValidation, commentController.replyToComment);
router.put('/:commentId', auth, commentValidation, commentController.updateComment);
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router;