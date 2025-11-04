// models/Reel.js
const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true,
    index: true
  },
  video: {
    url: {
      type: String,
      required: true
    },
    publicId: String,
    duration: Number, // in seconds
    thumbnail: String,
    width: Number,
    height: Number
  },
  audio: {
    name: String,
    artist: String,
    url: String,
    originalReel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaReel'
    }
  },
  caption: {
    type: String,
    maxlength: 2200,
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
  likesCount: {
    type: Number,
    default: 0,
    index: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaComment'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaUser'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    duration: Number // How long they watched (seconds)
  }],
  viewsCount: {
    type: Number,
    default: 0,
    index: true
  },
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaUser'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharesCount: {
    type: Number,
    default: 0
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser'
  }],
  location: {
    type: String,
    trim: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowRemix: {
    type: Boolean,
    default: true
  },
  isRemix: {
    type: Boolean,
    default: false
  },
  originalReel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaReel'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  // Engagement metrics for algorithm
  engagementScore: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for trending and explore
reelSchema.index({ createdAt: -1 });
reelSchema.index({ likesCount: -1, viewsCount: -1 });
reelSchema.index({ engagementScore: -1, createdAt: -1 });
reelSchema.index({ hashtags: 1 });
reelSchema.index({ user: 1, createdAt: -1 });

// Calculate engagement score before saving
reelSchema.pre('save', function(next) {
  if (this.isModified('likesCount') || this.isModified('commentsCount') || this.isModified('sharesCount') || this.isModified('viewsCount')) {
    // Weighted engagement formula
    this.engagementScore = (
      (this.likesCount * 2) +
      (this.commentsCount * 3) +
      (this.sharesCount * 5) +
      (this.viewsCount * 0.1)
    );
  }
  next();
});

// Virtual for reel URL
reelSchema.virtual('reelUrl').get(function() {
  return `/reels/${this._id}`;
});

module.exports = mongoose.model('InstaReel', reelSchema);