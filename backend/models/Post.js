const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true
  },
  images: [{
    url: String,
    publicId: String
  }],
  caption: {
    type: String,
    trim: true,
    maxlength: 2200
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaUser'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Denormalized like count for fast sorting/queries
  likesCount: {
    type: Number,
    default: 0,
    index: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaComment'
  }],
  location: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  commentsDisabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
// Compound index to support explore sorting by likesCount then createdAt
postSchema.index({ likesCount: -1, createdAt: -1 });

module.exports = mongoose.model('InstaPost', postSchema);