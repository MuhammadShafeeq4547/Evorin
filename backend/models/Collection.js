// models/Collection.js
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    trim: true
  },
  coverImage: {
    url: String,
    publicId: String
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaPost'
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
collectionSchema.index({ user: 1, createdAt: -1 });
collectionSchema.index({ user: 1, name: 1 });

// Virtual for posts count
collectionSchema.virtual('postsCount').get(function() {
  return this.posts.length;
});

// Method to add post to collection
collectionSchema.methods.addPost = async function(postId) {
  if (!this.posts.includes(postId)) {
    this.posts.push(postId);
    await this.save();
  }
  return this;
};

// Method to remove post from collection
collectionSchema.methods.removePost = async function(postId) {
  this.posts = this.posts.filter(id => id.toString() !== postId.toString());
  await this.save();
  return this;
};

module.exports = mongoose.model('InstaCollection', collectionSchema);