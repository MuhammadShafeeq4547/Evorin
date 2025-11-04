// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Profile metrics
  profileViews: {
    type: Number,
    default: 0
  },
  profileViewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaUser'
    },
    viewedAt: Date
  }],
  
  // Content metrics
  postsCreated: {
    type: Number,
    default: 0
  },
  storiesCreated: {
    type: Number,
    default: 0
  },
  reelsCreated: {
    type: Number,
    default: 0
  },
  
  // Engagement metrics
  totalLikes: {
    type: Number,
    default: 0
  },
  totalComments: {
    type: Number,
    default: 0
  },
  totalShares: {
    type: Number,
    default: 0
  },
  totalSaves: {
    type: Number,
    default: 0
  },
  
  // Reach metrics
  postReach: {
    type: Number,
    default: 0
  },
  storyReach: {
    type: Number,
    default: 0
  },
  reelReach: {
    type: Number,
    default: 0
  },
  
  // Growth metrics
  followersGained: {
    type: Number,
    default: 0
  },
  followersLost: {
    type: Number,
    default: 0
  },
  
  // Activity metrics
  messagesReceived: {
    type: Number,
    default: 0
  },
  messagesSent: {
    type: Number,
    default: 0
  },
  
  // Top performing content
  topPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaPost'
  },
  topReel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaReel'
  }
}, {
  timestamps: true
});

// Compound indexes
analyticsSchema.index({ user: 1, date: -1 });

// Static method to get or create analytics for a specific date
analyticsSchema.statics.getOrCreate = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  let analytics = await this.findOne({
    user: userId,
    date: startOfDay
  });
  
  if (!analytics) {
    analytics = await this.create({
      user: userId,
      date: startOfDay
    });
  }
  
  return analytics;
};

// Method to increment a metric
analyticsSchema.methods.increment = async function(metric, value = 1) {
  this[metric] = (this[metric] || 0) + value;
  await this.save();
  return this;
};

module.exports = mongoose.model('InstaAnalytics', analyticsSchema);