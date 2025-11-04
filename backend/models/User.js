// models/User.js - Enhanced version
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 150
  },
  website: {
    type: String,
    default: ''
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstaUser' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstaUser' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstaPost' }],
  saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstaPost' }],
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstaUser' }],
  
  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    },
    allowTagging: {
      type: String,
      enum: ['everyone', 'followers', 'none'],
      default: 'everyone'
    },
    allowMessagesFrom: {
      type: String,
      enum: ['everyone', 'followers', 'none'],
      default: 'everyone'
    },
    showActivityStatus: {
      type: Boolean,
      default: true
    },
    showReadReceipts: {
      type: Boolean,
      default: true
    }
  },
  
  // Notification preferences
  notificationSettings: {
    email: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    },
    push: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    }
  },
  
  // Verification and status
  isVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Account status
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  
  // Role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Two-factor authentication
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: String,
    tempSecret: String,
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Device management
  devices: [{
    deviceId: String,
    deviceName: String,
    lastActive: {
      type: Date,
      default: Date.now
    },
    pushToken: String
  }],
  
  // Theme preference
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Convert to JSON (remove sensitive fields)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorAuth.secret;
  delete user.twoFactorAuth.tempSecret;
  delete user.twoFactorAuth.backupCodes;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  return user;
};

// Virtual for posts count
userSchema.virtual('postsCount').get(function() {
  return this.posts.length;
});

// Virtual for followers count
userSchema.virtual('followersCount').get(function() {
  return this.followers.length;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

// Method to check if user can message another user
userSchema.methods.canMessage = function(targetUser) {
  const settings = this.privacySettings.allowMessagesFrom;
  
  if (settings === 'everyone') return true;
  if (settings === 'none') return false;
  if (settings === 'followers') {
    return this.followers.includes(targetUser._id);
  }
  
  return false;
};

// Method to check if user is blocked
userSchema.methods.isBlockedBy = function(userId) {
  return this.blocked.includes(userId);
};

module.exports = mongoose.model('InstaUser', userSchema);