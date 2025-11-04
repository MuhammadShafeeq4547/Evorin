const express = require('express');
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

const postValidation = [
  body('caption')
    .optional()
    .isLength({ max: 2200 })
    .withMessage('Caption cannot exceed 2200 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        if (tags.length > 20) {
          throw new Error('Cannot have more than 20 tags');
        }
        if (tags.some(tag => tag.length > 30)) {
          throw new Error('Each tag cannot exceed 30 characters');
        }
      }
      return true;
    })
];

router.post('/', auth, upload.array('images', 10), postValidation, postController.createPost);
router.get('/feed', auth, postController.getFeedPosts);
router.get('/explore', auth, postController.getExplorePosts);
router.get('/saved', auth, postController.getSavedPosts);
router.get('/search', auth, postController.searchPosts);
router.get('/:postId', auth, postController.getPost);
router.post('/:postId/like', auth, postController.toggleLike);
router.post('/:postId/save', auth, postController.toggleSave);
router.put('/:postId', auth, postController.updatePost);
router.delete('/:postId', auth, postController.deletePost);

module.exports = router;
