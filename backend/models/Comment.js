const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaPost',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
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
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaUser'
    },
    text: {
      type: String,
      required: true,
      trim: true
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('InstaComment', commentSchema);