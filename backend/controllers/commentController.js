const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Socket instance to be set by app.js
let io;

const commentController = {
  // Add comment
  addComment: async (req, res) => {
    try {
      const { postId } = req.params;
      const { text } = req.body;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.commentsDisabled) {
        return res.status(400).json({ message: 'Comments are disabled for this post' });
      }

      const comment = new Comment({
        user: req.user._id,
        post: postId,
        text
      });

      await comment.save();

      // Add comment to post
      post.comments.push(comment._id);
      await post.save();

      // Create notification if not own post
      if (post.user.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: post.user,
          sender: req.user._id,
          type: 'comment',
          post: postId,
          comment: comment._id,
          message: `${req.user.username} commented on your post`
        });
        await notification.save();
      }

      const populatedComment = await Comment.findById(comment._id)
        .populate('user', 'username avatar');

      // Count total comments for the post
      const commentsCount = post.comments.length;

      // Emit socket event for new comment
      if (io) {
        io.emit('comment_added', {
          postId,
          comment: populatedComment,
          commentsCount
        });
      }

      res.status(201).json({ success: true, comment: populatedComment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get post comments
  getPostComments: async (req, res) => {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const comments = await Comment.find({ post: postId })
        .populate('user', 'username avatar')
        .populate('replies.user', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      res.json({ success: true, comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Like/Unlike comment
  toggleCommentLike: async (req, res) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const existingLike = comment.likes.find(
        like => like.user.toString() === req.user._id.toString()
      );

      if (existingLike) {
        comment.likes = comment.likes.filter(
          like => like.user.toString() !== req.user._id.toString()
        );
      } else {
        comment.likes.push({ user: req.user._id });
      }

      await comment.save();

      res.json({
        success: true,
        isLiked: !existingLike,
        likesCount: comment.likes.length
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Reply to comment
  replyToComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { text } = req.body;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const reply = {
        user: req.user._id,
        text,
        likes: [],
        createdAt: new Date()
      };

      comment.replies.push(reply);
      await comment.save();

      const populatedComment = await Comment.findById(commentId)
        .populate('user', 'username avatar')
        .populate('replies.user', 'username avatar');

      res.json({ success: true, comment: populatedComment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete comment
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user owns the comment or the post
      const post = await Post.findById(comment.post);
      if (comment.user.toString() !== req.user._id.toString() && 
          post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Remove comment from post
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId }
      });

      await Comment.findByIdAndDelete(commentId);

      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { text } = req.body;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this comment'
        });
      }

      comment.text = text;
      comment.isEdited = true;
      await comment.save();

      const updatedComment = await Comment.findById(commentId)
        .populate('user', 'username avatar')
        .populate('replies.user', 'username avatar');

      res.json({
        success: true,
        comment: updatedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

};

module.exports = commentController;

// Attach setter for socket instance
commentController.setSocketInstance = (socketInstance) => {
  io = socketInstance;
};
