const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

// Socket instance to be set by app.js
let io;

const postController = {
  // Create post
  createPost: async (req, res) => {
    try {
      const { caption, location, tags } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'At least one image is required' 
        });
      }

      const images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));

      const post = new Post({
        user: req.user._id,
        images,
        caption,
        location,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      });

      await post.save();

      // Add post to user's posts array
      await User.findByIdAndUpdate(req.user._id, {
        $push: { posts: post._id }
      });

      const populatedPost = await Post.findById(post._id)
        .populate('user', 'username fullName avatar isVerified')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'username avatar'
          },
          options: { limit: 3, sort: { createdAt: -1 } }
        });

      // Emit socket event for new post
      if (io) {
        io.emit('new_post', { post: populatedPost });
      }

      res.status(201).json({ success: true, post: populatedPost });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get feed posts - FIXED VERSION
  getFeedPosts: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Get current user with following list
      const currentUser = await User.findById(req.user._id);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Include user's own posts and posts from users they follow
      const userIds = [...currentUser.following, req.user._id];

      const posts = await Post.find({
        user: { $in: userIds },
        isArchived: false
      })
      .populate('user', 'username fullName avatar isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Use lean for better performance

      // Add interaction status for each post
      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      }));

      res.json({ 
        success: true, 
        posts: postsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: posts.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get feed posts error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get explore posts
  getExplorePosts: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      // Fetch one extra to determine hasMore reliably
      const fetchLimit = parseInt(limit) + 1;

      const posts = await Post.find({
        isArchived: false,
        user: { $ne: req.user._id }
      })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ likesCount: -1, createdAt: -1 })
        .limit(fetchLimit)
        .skip(skip)
        .lean();

      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      }));

      // If we fetched an extra, trim it before returning
      const hasMore = posts.length === fetchLimit;
      const trimmedPosts = hasMore ? posts.slice(0, -1) : posts;

      res.json({
        success: true,
        posts: postsWithStatus.slice(0, trimmedPosts.length),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore
        }
      });
    } catch (error) {
      console.error('Get explore posts error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get single post
  getPost: async (req, res) => {
    try {
      const { postId } = req.params;

      const post = await Post.findById(postId)
        .populate('user', 'username fullName avatar isVerified')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'username avatar'
          },
          options: { sort: { createdAt: -1 } }
        });

      if (!post) {
        return res.status(404).json({ 
          success: false,
          message: 'Post not found' 
        });
      }

      // Add interaction status
      const postWithStatus = {
        ...post.toObject(),
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      };

      res.json({ success: true, post: postWithStatus });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Like/Unlike post
  toggleLike: async (req, res) => {
    try {
      const { postId } = req.params;
  const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ 
          success: false,
          message: 'Post not found' 
        });
      }

      const existingLike = post.likes.find(
        like => like.user.toString() === req.user._id.toString()
      );

      let isLiked;
      if (existingLike) {
        // Unlike: remove like and decrement likesCount
        await Post.findByIdAndUpdate(postId, {
          $pull: { likes: { user: req.user._id } },
          $inc: { likesCount: -1 }
        });
        isLiked = false;
      } else {
        // Like: add like and increment likesCount
        await Post.findByIdAndUpdate(postId, {
          $push: { likes: { user: req.user._id } },
          $inc: { likesCount: 1 }
        });

        // Create notification if not own post
        if (post.user.toString() !== req.user._id.toString()) {
          const notification = new Notification({
            recipient: post.user,
            sender: req.user._id,
            type: 'like',
            post: postId,
            message: `${req.user.username} liked your post`
          });
          await notification.save();
        }

        isLiked = true;
      }

      // Retrieve updated likesCount
      const updated = await Post.findById(postId).select('likesCount');
      const updatedLikesCount = updated ? updated.likesCount : 0;

      // Emit socket event for post like update
      if (io) {
        io.emit('post_liked', {
          postId,
          likesCount: updatedLikesCount,
          userId: req.user._id.toString()
        });
      }

      res.json({
        success: true,
        isLiked,
        likesCount: updatedLikesCount
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Delete post
  deletePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ 
          success: false,
          message: 'Post not found' 
        });
      }

      // Check if user owns the post
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized' 
        });
      }

      // Delete images from cloudinary
      for (const image of post.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
          } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
          }
        }
      }

      // Delete comments
      await Comment.deleteMany({ post: postId });

      // Remove post from user's posts array
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { posts: postId }
      });

      // Delete notifications related to this post
      await Notification.deleteMany({ post: postId });

      // Delete post
      await Post.findByIdAndDelete(postId);

      res.json({ 
        success: true, 
        message: 'Post deleted successfully' 
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Save/Unsave post
  toggleSave: async (req, res) => {
    try {
      const { postId } = req.params;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isSaved = user.saved.includes(postId);

      if (isSaved) {
        user.saved.pull(postId);
      } else {
        user.saved.push(postId);
      }

      await user.save();

      res.json({
        success: true,
        isSaved: !isSaved
      });
    } catch (error) {
      console.error('Toggle save error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get user's saved posts
  getSavedPosts: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user._id)
        .populate({
          path: 'saved',
          populate: {
            path: 'user',
            select: 'username fullName avatar isVerified'
          },
          options: {
            sort: { createdAt: -1 },
            limit: parseInt(limit),
            skip: skip
          }
        });

      const savedPosts = user.saved.map(post => ({
        ...post.toObject(),
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isSaved: true
      }));

      res.json({
        success: true,
        posts: savedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: savedPosts.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get saved posts error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },
  searchPosts: async (req, res) => {
    try {
      const { query, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const searchQuery = {
        $or: [
          { caption: { $regex: query.trim(), $options: 'i' } },
          { location: { $regex: query.trim(), $options: 'i' } },
          { tags: { $in: [new RegExp(query.trim(), 'i')] } }
        ],
        isArchived: false
      };

      const posts = await Post.find(searchQuery)
        .populate('user', 'username fullName avatar isVerified')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'username avatar'
          },
          options: { limit: 3, sort: { createdAt: -1 } }
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(like => like.user.toString() === req.user._id.toString()),
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      }));

      res.json({
        success: true,
        posts: postsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: posts.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Search posts error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update post
  updatePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const { caption, location, tags, commentsDisabled } = req.body;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this post'
        });
      }

      // Update fields
      if (caption !== undefined) post.caption = caption;
      if (location !== undefined) post.location = location;
      if (tags !== undefined) {
        post.tags = typeof tags === 'string' 
          ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : tags;
      }
      if (commentsDisabled !== undefined) post.commentsDisabled = commentsDisabled;

      await post.save();

      const updatedPost = await Post.findById(postId)
        .populate('user', 'username fullName avatar isVerified')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'username avatar'
          },
          options: { limit: 3, sort: { createdAt: -1 } }
        });

      res.json({
        success: true,
        post: {
          ...updatedPost.toObject(),
          isLiked: updatedPost.likes.some(like => like.user.toString() === req.user._id.toString()),
          likesCount: updatedPost.likes.length,
          commentsCount: updatedPost.comments.length
        }
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = postController;

// Attach setter for socket instance so server can inject io
postController.setSocketInstance = (socketInstance) => {
  io = socketInstance;
};