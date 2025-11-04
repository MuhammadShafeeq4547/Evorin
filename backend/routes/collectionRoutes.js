// routes/collectionRoutes.js
const express = require('express');
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

// Validation
const collectionValidation = [
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Collection name must be between 1 and 50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
    .trim()
];

// Routes
router.post('/', auth, upload.single('coverImage'), collectionValidation, collectionController.createCollection);
router.get('/', auth, collectionController.getUserCollections);
router.get('/:collectionId', auth, collectionController.getCollection);
router.put('/:collectionId', auth, upload.single('coverImage'), collectionValidation, collectionController.updateCollection);
router.delete('/:collectionId', auth, collectionController.deleteCollection);
router.post('/:collectionId/posts/:postId', auth, collectionController.addPostToCollection);
router.delete('/:collectionId/posts/:postId', auth, collectionController.removePostFromCollection);

module.exports = router;