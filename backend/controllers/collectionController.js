// controllers/collectionController.js
const Collection = require('../models/Collection');
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

const collectionController = {
  // Create a new collection
  createCollection: async (req, res) => {
    try {
      const { name, description, isPrivate = true } = req.body;

      // Check if collection with same name exists for this user
      const existingCollection = await Collection.findOne({
        user: req.user._id,
        name: name.trim()
      });

      if (existingCollection) {
        return res.status(400).json({
          success: false,
          message: 'Collection with this name already exists'
        });
      }

      let coverImage = {};
      if (req.file) {
        coverImage = {
          url: req.file.path,
          publicId: req.file.filename
        };
      }

      const collection = new Collection({
        user: req.user._id,
        name: name.trim(),
        description: description?.trim(),
        isPrivate,
        coverImage
      });

      await collection.save();

      res.status(201).json({
        success: true,
        message: 'Collection created successfully',
        collection
      });
    } catch (error) {
      console.error('Create collection error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all collections for current user
  getUserCollections: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const collections = await Collection.find({ user: req.user._id })
        .populate({
          path: 'posts',
          select: 'images caption likesCount commentsCount',
          options: { limit: 4 }
        })
        .sort({ order: 1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const total = await Collection.countDocuments({ user: req.user._id });

      // Add posts count to each collection
      const collectionsWithCount = collections.map(collection => ({
        ...collection,
        postsCount: collection.posts.length
      }));

      res.json({
        success: true,
        collections: collectionsWithCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get collections error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get single collection with all posts
  getCollection: async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      // Check authorization
      if (collection.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this collection'
        });
      }

      // Paginate posts
      const posts = await Post.find({
        _id: { $in: collection.posts }
      })
        .populate('user', 'username fullName avatar isVerified')
        .populate({
          path: 'comments',
          options: { limit: 3, sort: { createdAt: -1 } },
          populate: {
            path: 'user',
            select: 'username avatar'
          }
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      // Add interaction status for each post
      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        isSaved: true, // Already in collection
        likesCount: post.likesCount || post.likes.length,
        commentsCount: post.comments.length
      }));

      res.json({
        success: true,
        collection,
        posts: postsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: collection.posts.length,
          hasMore: skip + posts.length < collection.posts.length
        }
      });
    } catch (error) {
      console.error('Get collection error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Add post to collection
  addPostToCollection: async (req, res) => {
    try {
      const { collectionId, postId } = req.params;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      // Check authorization
      if (collection.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Check if post exists
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Add post to collection
      if (collection.posts.includes(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Post already in collection'
        });
      }

      collection.posts.push(postId);
      await collection.save();

      res.json({
        success: true,
        message: 'Post added to collection',
        collection
      });
    } catch (error) {
      console.error('Add post to collection error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Remove post from collection
  removePostFromCollection: async (req, res) => {
    try {
      const { collectionId, postId } = req.params;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      // Check authorization
      if (collection.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Remove post from collection
      collection.posts = collection.posts.filter(
        id => id.toString() !== postId
      );
      await collection.save();

      res.json({
        success: true,
        message: 'Post removed from collection',
        collection
      });
    } catch (error) {
      console.error('Remove post from collection error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update collection
  updateCollection: async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { name, description, isPrivate } = req.body;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      // Check authorization
      if (collection.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Update fields
      if (name) collection.name = name.trim();
      if (description !== undefined) collection.description = description?.trim();
      if (isPrivate !== undefined) collection.isPrivate = isPrivate;

      // Update cover image if provided
      if (req.file) {
        // Delete old cover image
        if (collection.coverImage?.publicId) {
          try {
            await cloudinary.uploader.destroy(collection.coverImage.publicId);
          } catch (err) {
            console.error('Error deleting old cover image:', err);
          }
        }

        collection.coverImage = {
          url: req.file.path,
          publicId: req.file.filename
        };
      }

      await collection.save();

      res.json({
        success: true,
        message: 'Collection updated successfully',
        collection
      });
    } catch (error) {
      console.error('Update collection error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete collection
  deleteCollection: async (req, res) => {
    try {
      const { collectionId } = req.params;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      // Check authorization
      if (collection.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Delete cover image from cloudinary
      if (collection.coverImage?.publicId) {
        try {
          await cloudinary.uploader.destroy(collection.coverImage.publicId);
        } catch (err) {
          console.error('Error deleting cover image:', err);
        }
      }

      await Collection.findByIdAndDelete(collectionId);

      res.json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (error) {
      console.error('Delete collection error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = collectionController;