const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

const connectedUsers = new Map(); // userId -> Set of socket IDs
const userHeartbeats = new Map(); // userId -> last heartbeat timestamp

const socketHandler = (io) => {
  console.log('🔌 Socket handler initialized');

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.log('❌ User not found for token');
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      
      console.log(`✅ User ${user.username} authenticated for socket connection`);
      next();
    } catch (error) {
      console.log('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    try {
      console.log(`🟢 User ${socket.user.username} connected with socket ID: ${socket.id}`);
      
      // Store connected user (allow multiple connections per user)
      if (!connectedUsers.has(socket.userId)) {
        connectedUsers.set(socket.userId, new Set());
      }
      connectedUsers.get(socket.userId).add(socket.id);
      
      // Update user online status to true
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: true,
          lastSeen: new Date()
        }, { new: true });
        console.log(`✅ User ${socket.user.username} marked as online`);
      } catch (dbError) {
        console.error('Error updating user online status:', dbError);
      }
      
      // Initialize heartbeat
      userHeartbeats.set(socket.userId, Date.now());

      // Join user to their own room for private notifications
      socket.join(socket.userId);
      
      // Emit updated online users list
      const onlineUserIds = Array.from(connectedUsers.keys());
      io.emit('user_online', onlineUserIds);
      console.log('📡 Broadcasted online users:', onlineUserIds);

      // Handle joining chat rooms
      socket.on('join_chat', async (chatId) => {
        try {
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId);
          if (chat && chat.participants.includes(socket.userId)) {
            socket.join(chatId);
            console.log(`👥 User ${socket.user.username} joined chat ${chatId}`);
          } else {
            socket.emit('error', { message: 'Not authorized to join this chat' });
          }
        } catch (error) {
          console.error('Error joining chat:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Handle leaving chat rooms
      socket.on('leave_chat', (chatId) => {
        socket.leave(chatId);
        console.log(`👋 User ${socket.user.username} left chat ${chatId}`);
      });

      // Handle new message
      socket.on('send_message', async (data) => {
        try {
          const { chatId, message } = data;
          
          if (!chatId || !message) {
            return socket.emit('error', { message: 'Missing required fields' });
          }
          
          console.log(`💬 Message from ${socket.user.username} in chat ${chatId}`);
          
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId).populate('participants');
          if (!chat || !chat.participants.some(p => p._id.toString() === socket.userId)) {
            return socket.emit('error', { message: 'Not authorized to send message to this chat' });
          }
          
          // Mark message as read by sender
          if (!message.readBy) {
            message.readBy = [];
          }
          message.readBy.push({ user: socket.userId, readAt: new Date() });
          
          // Emit to all participants in the chat except sender
          socket.to(chatId).emit('new_message', {
            chatId,
            message: {
              ...message,
              sender: {
                _id: socket.userId,
                username: socket.user.username,
                avatar: socket.user.avatar
              }
            }
          });

          // Send push notification to offline users
          chat.participants.forEach(participant => {
            const participantId = participant._id.toString();
            if (participantId !== socket.userId && !connectedUsers.has(participantId)) {
              console.log(`📱 Send push notification to ${participant.username}`);
              // Here you would integrate with push notification service
            }
          });

        } catch (error) {
          console.error('❌ Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle message read receipts
      socket.on('mark_read', async (data) => {
        try {
          const { chatId } = data;
          
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(socket.userId)) {
            return socket.emit('error', { message: 'Not authorized for this chat' });
          }

          // Emit read receipt to other participants
          socket.to(chatId).emit('message_read', {
            chatId,
            userId: socket.userId,
            readAt: new Date()
          });

        } catch (error) {
          console.error('Error marking messages as read:', error);
          socket.emit('error', { message: 'Failed to mark messages as read' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        if (data && data.chatId) {
          socket.to(data.chatId).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            chatId: data.chatId
          });
        }
      });

      socket.on('typing_stop', (data) => {
        if (data && data.chatId) {
          socket.to(data.chatId).emit('user_stop_typing', {
            userId: socket.userId,
            chatId: data.chatId
          });
        }
      });

      // Handle message reactions
      socket.on('message_reaction', async (data) => {
        try {
          const { chatId, messageId, emoji } = data;
          
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(socket.userId)) {
            return socket.emit('error', { message: 'Not authorized for this chat' });
          }

          const message = chat.messages.id(messageId);
          if (!message) {
            return socket.emit('error', { message: 'Message not found' });
          }

          // Initialize reactions array if it doesn't exist
          if (!message.reactions) {
            message.reactions = [];
          }

          // Remove existing reaction from this user
          message.reactions = message.reactions.filter(
            r => r.user.toString() !== socket.userId
          );

          // Add new reaction if emoji provided
          if (emoji) {
            message.reactions.push({
              emoji,
              user: socket.userId
            });
          }

          await chat.save();

          // Emit to all participants
          io.to(chatId).emit('message_reaction_update', {
            chatId,
            messageId,
            reactions: message.reactions
          });

        } catch (error) {
          console.error('❌ Error handling message reaction:', error);
          socket.emit('error', { message: 'Failed to update message reaction' });
        }
      });

      // Handle message edits
      socket.on('edit_message', async (data) => {
        try {
          const { chatId, messageId, text } = data;
          
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(socket.userId)) {
            return socket.emit('error', { message: 'Not authorized for this chat' });
          }

          const message = chat.messages.id(messageId);
          if (!message) {
            return socket.emit('error', { message: 'Message not found' });
          }

          if (message.sender.toString() !== socket.userId) {
            return socket.emit('error', { message: 'Can only edit your own messages' });
          }

          // Initialize editHistory if it doesn't exist
          if (!message.editHistory) {
            message.editHistory = [];
          }

          // Store edit history
          message.editHistory.push({
            text: message.text,
            editedAt: new Date()
          });

          message.text = text;
          message.isEdited = true;

          await chat.save();

          // Emit to all participants
          io.to(chatId).emit('message_edited', {
            chatId,
            messageId,
            text,
            editHistory: message.editHistory
          });

        } catch (error) {
          console.error('❌ Error editing message:', error);
          socket.emit('error', { message: 'Failed to edit message' });
        }
      });

      // Handle message deletions
      socket.on('delete_message', async (data) => {
        try {
          const { chatId, messageId } = data;
          
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(socket.userId)) {
            return socket.emit('error', { message: 'Not authorized for this chat' });
          }

          const message = chat.messages.id(messageId);
          if (!message) {
            return socket.emit('error', { message: 'Message not found' });
          }

          if (message.sender.toString() !== socket.userId) {
            return socket.emit('error', { message: 'Can only delete your own messages' });
          }

          // Soft delete message
          message.isDeleted = true;
          message.text = null;
          message.image = null;
          message.reactions = [];

          await chat.save();

          // Emit to all participants
          io.to(chatId).emit('message_deleted', {
            chatId,
            messageId
          });

        } catch (error) {
          console.error('❌ Error deleting message:', error);
          socket.emit('error', { message: 'Failed to delete message' });
        }
      });

      // Handle voice messages
      socket.on('voice_message', async (data) => {
        try {
          const { chatId, audioData } = data;
          
          // Verify user is participant in this chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(socket.userId)) {
            return socket.emit('error', { message: 'Not authorized for this chat' });
          }

          const message = {
            sender: socket.userId,
            messageType: 'audio',
            audio: audioData,
            readBy: [{ user: socket.userId, readAt: new Date() }],
            createdAt: new Date()
          };

          chat.messages.push(message);
          await chat.save();

          // Emit to all participants except sender
          socket.to(chatId).emit('new_message', {
            chatId,
            message: {
              ...message,
              sender: {
                _id: socket.userId,
                username: socket.user.username,
                avatar: socket.user.avatar
              }
            }
          });

        } catch (error) {
          console.error('❌ Error sending voice message:', error);
          socket.emit('error', { message: 'Failed to send voice message' });
        }
      });

      // Handle group chat management
      socket.on('update_group', async (data) => {
        try {
          const { chatId, updates } = data;
          
          // Verify user is admin in this chat
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.isGroupChat) {
            return socket.emit('error', { message: 'Not a group chat' });
          }

          if (!chat.admins || !chat.admins.includes(socket.userId)) {
            return socket.emit('error', { message: 'Only admins can update group settings' });
          }

          // Apply updates
          if (updates.name) chat.groupName = updates.name;
          if (updates.addParticipants) {
            const newParticipants = updates.addParticipants.filter(
              id => !chat.participants.includes(id)
            );
            chat.participants.push(...newParticipants);
          }
          if (updates.removeParticipants) {
            chat.participants = chat.participants.filter(
              id => !updates.removeParticipants.includes(id.toString())
            );
          }
          if (updates.addAdmins) {
            const newAdmins = updates.addAdmins.filter(
              id => !chat.admins.includes(id)
            );
            chat.admins.push(...newAdmins);
          }
          if (updates.removeAdmins) {
            chat.admins = chat.admins.filter(
              id => !updates.removeAdmins.includes(id.toString())
            );
          }

          await chat.save();

          // Populate and emit updated chat to all participants
          const populatedChat = await Chat.findById(chatId)
            .populate('participants', 'username fullName avatar isOnline')
            .populate('admins', 'username');

          io.to(chatId).emit('group_updated', {
            chat: populatedChat
          });

        } catch (error) {
          console.error('❌ Error updating group:', error);
          socket.emit('error', { message: 'Failed to update group' });
        }
      });

      // Handle real-time notifications
      socket.on('send_notification', (data) => {
        try {
          const { recipientId, notification } = data;
          
          if (!recipientId || !notification) {
            return socket.emit('error', { message: 'Missing recipient or notification data' });
          }
          
          const recipientSocketIds = connectedUsers.get(recipientId);
          
          if (recipientSocketIds && recipientSocketIds.size > 0) {
            recipientSocketIds.forEach(socketId => {
              io.to(socketId).emit('new_notification', {
                ...notification,
                timestamp: new Date()
              });
            });
            console.log(`🔔 Notification sent to user ${recipientId}`);
          } else {
            console.log(`📴 User ${recipientId} is offline, notification queued`);
          }
        } catch (error) {
          console.error('Error sending notification:', error);
          socket.emit('error', { message: 'Failed to send notification' });
        }
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        userHeartbeats.set(socket.userId, Date.now());
        console.log(`🫀 Heartbeat received from ${socket.user.username}`);
      });

      // Handle disconnect
      socket.on('disconnect', async (reason) => {
        try {
          console.log(`🔴 User ${socket.user.username} disconnected: ${reason}`);
          
          // Remove this specific socket connection
          const userSockets = connectedUsers.get(socket.userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            
            // If no more connections for this user, mark as offline
            if (userSockets.size === 0) {
              connectedUsers.delete(socket.userId);
              userHeartbeats.delete(socket.userId);
              
              try {
                await User.findByIdAndUpdate(socket.userId, {
                  isOnline: false,
                  lastSeen: new Date()
                });
                console.log(`🔴 User ${socket.user.username} marked as offline`);
              } catch (dbError) {
                console.error('Error updating user offline status:', dbError);
              }
            }
          }
          
          // Emit updated online users list
          const onlineUserIds = Array.from(connectedUsers.keys());
          io.emit('user_online', onlineUserIds);
          
        } catch (error) {
          console.error('❌ Error handling disconnect:', error);
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for user ${socket.user.username}:`, error);
      });

    } catch (error) {
      console.error('❌ Error in socket connection handler:', error);
      socket.disconnect();
    }
  });

  // Heartbeat monitoring to detect stale connections
  const heartbeatMonitor = setInterval(() => {
    const now = Date.now();
    const staleThreshold = 35000; // 35 seconds (client sends every 15s)
    
    userHeartbeats.forEach(async (lastBeat, userId) => {
      if (now - lastBeat > staleThreshold) {
        console.log(`🫀 User ${userId} heartbeat stale, forcing disconnect`);
        
        // Remove user from connected users
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
              socket.disconnect(true);
            }
          });
        }
        
        connectedUsers.delete(userId);
        userHeartbeats.delete(userId);
        
        // Update user status in database
        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date()
          });
        } catch (err) {
          console.error('Error updating stale user:', err);
        }
        
        // Emit updated online users list
        const onlineUserIds = Array.from(connectedUsers.keys());
        io.emit('user_online', onlineUserIds);
      }
    });
  }, 10000); // Check every 10 seconds

  // Handle io errors
  io.on('error', (error) => {
    console.error('❌ Socket.IO server error:', error);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🔄 Shutting down socket server...');
    clearInterval(heartbeatMonitor);
    io.close();
  });

  process.on('SIGTERM', () => {
    console.log('🔄 Shutting down socket server...');
    clearInterval(heartbeatMonitor);
    io.close();
  });
};

module.exports = socketHandler;