const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  image: {
    url: String,
    publicId: String
  },
  audio: {
    url: String,
    publicId: String,
    duration: Number
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaPost'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstaUser'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [reactionSchema],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    text: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'post', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaMessage'
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: String,
  groupAvatar: String,
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('InstaChat', chatSchema);