const Chat = require('../models/Chat');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

const chatController = {
  // Get user chats
  getUserChats: async (req, res) => {
    try {
      const chats = await Chat.find({
        participants: req.user._id
      })
      .populate('participants', 'username fullName avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

      res.json({ success: true, chats });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get or create chat
  getOrCreateChat: async (req, res) => {
    try {
      const { userId } = req.params;

      if (userId === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot chat with yourself' });
      }

      let chat = await Chat.findOne({
        participants: { $all: [req.user._id, userId] },
        isGroupChat: false
      })
      .populate('participants', 'username fullName avatar isOnline lastSeen')
      .populate({
        path: 'messages.sender',
        select: 'username avatar'
      });

      if (!chat) {
        chat = new Chat({
          participants: [req.user._id, userId],
          messages: []
        });
        await chat.save();

        chat = await Chat.findById(chat._id)
          .populate('participants', 'username fullName avatar isOnline lastSeen');
      }

      res.json({ success: true, chat });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Send message
  sendMessage: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { text, messageType = 'text', postId } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      if (!chat.participants.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const message = {
        sender: req.user._id,
        messageType,
        createdAt: new Date()
      };

      if (messageType === 'text') {
        message.text = text;
      } else if (messageType === 'image' && req.file) {
        message.image = {
          url: req.file.path,
          publicId: req.file.filename
        };
      } else if (messageType === 'post') {
        message.post = postId;
      }

      chat.messages.push(message);
      chat.updatedAt = new Date();
      await chat.save();

      const populatedChat = await Chat.findById(chatId)
        .populate('participants', 'username fullName avatar isOnline')
        .populate({
          path: 'messages.sender',
          select: 'username avatar'
        })
        .populate('messages.post', 'images caption user');

      const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

      res.json({ success: true, message: newMessage, chat: populatedChat });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    try {
      const { chatId } = req.params;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Mark all messages as read by current user
      chat.messages.forEach(message => {
        const existingRead = message.readBy.find(
          read => read.user.toString() === req.user._id.toString()
        );
        if (!existingRead) {
          message.readBy.push({ user: req.user._id });
        }
      });

      await chat.save();

      res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getChatMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      if (!chat.participants.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Get messages with pagination (reversed for chronological order)
      const messages = chat.messages
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + parseInt(limit))
        .reverse();

      const populatedChat = await Chat.populate(chat, {
        path: 'messages.sender',
        select: 'username avatar'
      });

      res.json({
        success: true,
        messages: populatedChat.messages.slice(skip, skip + parseInt(limit)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: skip + messages.length < chat.messages.length
        }
      });
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete chat
  deleteChat: async (req, res) => {
    try {
      const { chatId } = req.params;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      if (!chat.participants.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Delete images from cloudinary
      for (const message of chat.messages) {
        if (message.image && message.image.publicId) {
          try {
            await cloudinary.uploader.destroy(message.image.publicId);
          } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
          }
        }
      }

      await Chat.findByIdAndDelete(chatId);

      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });
    } catch (error) {
      console.error('Delete chat error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // React to message
  reactToMessage: async (req, res) => {
    try {
      const { chatId, messageId } = req.params;
      const { emoji } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ 
          success: false, 
          message: 'Chat not found' 
        });
      }

      if (!chat.participants.includes(req.user._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized' 
        });
      }

      const message = chat.messages.id(messageId);
      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: 'Message not found' 
        });
      }

      // Remove existing reaction by this user
      message.reactions = message.reactions.filter(
        r => r.user.toString() !== req.user._id.toString()
      );

      // Add new reaction if emoji provided
      if (emoji) {
        message.reactions.push({
          emoji,
          user: req.user._id
        });
      }

      await chat.save();

      res.json({ 
        success: true, 
        reactions: message.reactions 
      });

    } catch (error) {
      console.error('React to message error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Edit message
  editMessage: async (req, res) => {
    try {
      const { chatId, messageId } = req.params;
      const { text } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ 
          success: false, 
          message: 'Chat not found' 
        });
      }

      const message = chat.messages.id(messageId);
      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: 'Message not found' 
        });
      }

      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Can only edit your own messages' 
        });
      }

      // Store edit history
      message.editHistory.push({
        text: message.text,
        editedAt: new Date()
      });

      message.text = text;
      message.isEdited = true;

      await chat.save();

      res.json({ 
        success: true, 
        message 
      });

    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { chatId, messageId } = req.params;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ 
          success: false, 
          message: 'Chat not found' 
        });
      }

      const message = chat.messages.id(messageId);
      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: 'Message not found' 
        });
      }

      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Can only delete your own messages' 
        });
      }

      // Delete image if exists
      if (message.image && message.image.publicId) {
        try {
          await cloudinary.uploader.destroy(message.image.publicId);
        } catch (cloudinaryError) {
          console.error('Cloudinary deletion error:', cloudinaryError);
        }
      }

      message.isDeleted = true;
      message.text = null;
      message.image = null;
      message.reactions = [];

      await chat.save();

      res.json({ 
        success: true,
        message 
      });

    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Search messages
  searchMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { query } = req.query;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ 
          success: false, 
          message: 'Chat not found' 
        });
      }

      if (!chat.participants.includes(req.user._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized' 
        });
      }

      // Search messages with text matching query (case-insensitive)
      const messages = chat.messages.filter(message => 
        message.text && 
        !message.isDeleted &&
        message.text.toLowerCase().includes(query.toLowerCase())
      );

      // Populate sender info for matched messages
      await Chat.populate(messages, {
        path: 'sender',
        select: 'username avatar'
      });

      res.json({
        success: true,
        messages: messages.reverse() // Most recent first
      });

    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Group chat methods
  createGroupChat: async (req, res) => {
    try {
      const { name, participantIds } = req.body;
      
      if (!name || !participantIds || participantIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Group name and participants are required'
        });
      }

      // Add current user to participants
      const allParticipants = [...new Set([...participantIds, req.user._id])];

      const chat = new Chat({
        isGroupChat: true,
        groupName: name,
        participants: allParticipants,
        admins: [req.user._id], // Creator is first admin
        messages: [{
          sender: req.user._id,
          text: 'Group created',
          messageType: 'system'
        }]
      });

      await chat.save();

      const populatedChat = await Chat.findById(chat._id)
        .populate('participants', 'username fullName avatar isOnline')
        .populate('admins', 'username');

      res.json({
        success: true,
        chat: populatedChat
      });

    } catch (error) {
      console.error('Create group chat error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update group chat
  updateGroupChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { name, avatar } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      if (!chat.admins.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Only admins can update group settings'
        });
      }

      if (name) chat.groupName = name;
      if (req.file) {
        // Delete old avatar if exists
        if (chat.groupAvatar) {
          try {
            await cloudinary.uploader.destroy(chat.groupAvatar);
          } catch (err) {
            console.error('Error deleting old group avatar:', err);
          }
        }
        chat.groupAvatar = req.file.path;
      }

      await chat.save();

      res.json({
        success: true,
        chat
      });

    } catch (error) {
      console.error('Update group chat error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = chatController;
