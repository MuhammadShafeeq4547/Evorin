import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Heart,
  Info,
  Phone,
  Video,
  Search,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Paperclip,
  X,
  Check,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import { formatDistanceToNow } from 'date-fns';
import ProgressiveImage from '../UI/ProgressiveImage';

// MessageBubble component for individual messages
const MessageBubble = ({ message, isOwn, showAvatar = true, nextIsSameUser = false }) => {
  const avatarSize = 'xs';
  const { sender, text, image, createdAt, readBy = [] } = message;

  return (
    <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-1`}>
      {!isOwn && showAvatar && (
        <Avatar src={sender.avatar} alt={sender.username} size={avatarSize} />
      )}
      {!isOwn && !showAvatar && <div className={`w-8 h-${avatarSize}`} />}
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative group max-w-[70%] rounded-2xl px-4 py-2 
          ${isOwn ? 'bg-blue-500 text-white ml-2' : 'bg-gray-100 dark:bg-gray-800 mr-2'}
        `}
      >
        {text && <p className="text-sm whitespace-pre-line">{text}</p>}
        {image && (
          <div className="rounded-lg overflow-hidden max-w-sm">
            <ProgressiveImage src={image.url} alt="Message attachment" className="w-full h-auto" />
          </div>
        )}
        <span className="text-[10px] opacity-50 ml-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
        {isOwn && readBy.length > 0 && (
          <Check className="w-3 h-3 text-blue-300 absolute -bottom-4 right-1" />
        )}
      </motion.div>
    </div>
  );
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typing, setTyping] = useState({});  // { userId: timestamp }
  const [attachmentType, setAttachmentType] = useState(null);  // 'image', 'video', etc
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContentRef = useRef(null);
  const typingTimeoutRef = useRef({});
  
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Initial fetch and chat selection
  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        selectChat(chat);
      }
    }
  }, [chatId, chats]);

  // Listen for real-time chat updates
  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (chat) => {
      setChats(prev => [chat, ...prev]);
    };

    const handleChatUpdated = (chat) => {
      setChats(prev => prev.map(c => c._id === chat._id ? chat : c));
    };

    socket.on('new_chat', handleNewChat);
    socket.on('chat_updated', handleChatUpdated);
    // socket.on('user_online', handleUserOnline);
    // socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('new_chat', handleNewChat);
      socket.off('chat_updated', handleChatUpdated);
      // socket.off('user_online', handleUserOnline);
      // socket.off('user_offline', handleUserOffline);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join_chat', selectedChat._id);
      
      const handleNewMessage = (data) => {
        if (data.chatId === selectedChat._id) {
          setMessages(prev => [...prev, data.message]);
          markAsRead(selectedChat._id);
        }
      };

      const handleTyping = (data) => {
        console.log('User typing:', data);
      };

      socket.on('new_message', handleNewMessage);
      socket.on('typing', handleTyping);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('typing', handleTyping);
        socket.emit('leave_chat', selectedChat._id);
      };
    }
  }, [socket, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('/chat');
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Fetch chats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`/chat/messages/${chatId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    await fetchChatMessages(chat._id);
    await markAsRead(chat._id);
  };

  const markAsRead = async (chatId) => {
    try {
      await axios.post(`/chat/${chatId}/read`);
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Typing indicator handling
  const handleTyping = useCallback(() => {
    if (!socket || !selectedChat) return;
    
    socket.emit('typing_start', {
      chatId: selectedChat._id,
      userId: user._id
    });

    // Clear existing timeout
    if (typingTimeoutRef.current[selectedChat._id]) {
      clearTimeout(typingTimeoutRef.current[selectedChat._id]);
    }

    // Set new timeout
    typingTimeoutRef.current[selectedChat._id] = setTimeout(() => {
      socket.emit('typing_stop', {
        chatId: selectedChat._id,
        userId: user._id
      });
    }, 2000);
  }, [socket, selectedChat, user._id]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !attachmentType || !selectedChat || sending) return;

    setSending(true);
    const formData = new FormData();

    if (attachmentType) {
      const file = fileInputRef.current.files[0];
      if (!file) return;
      
      formData.append('file', file);
      formData.append('messageType', attachmentType);
    } else {
      formData.append('text', newMessage.trim());
      formData.append('messageType', 'text');
    }

    try {
      const response = await axios.post(
        `/chat/${selectedChat._id}/message`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }}
      );

      if (response.data.success) {
        const newMsg = response.data.message;
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        setAttachmentType(null);
        
        if (socket && isConnected) {
          socket.emit('send_message', {
            chatId: selectedChat._id,
            message: newMsg
          });
          
          // Stop typing indicator
          socket.emit('typing_stop', {
            chatId: selectedChat._id,
            userId: user._id
          });
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      if (!attachmentType) setNewMessage(newMessage);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendImageMessage = async (file) => {
    if (!selectedChat || !file) return;

    setSending(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('messageType', 'image');

    try {
      const response = await axios.post(`/chat/${selectedChat._id}/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newMsg = response.data.message;
        setMessages(prev => [...prev, newMsg]);
        
        if (socket && isConnected) {
          socket.emit('send_message', {
            chatId: selectedChat._id,
            message: newMsg
          });
        }
      }
    } catch (error) {
      console.error('Send image error:', error);
    } finally {
      setSending(false);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/users/search?query=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Search users error:', error);
    }
  };

  const createChat = async (userId) => {
    try {
      const response = await axios.get(`/chat/${userId}`);
      if (response.data.success) {
        const newChat = response.data.chat;
        setChats(prev => {
          const existingIndex = prev.findIndex(c => c._id === newChat._id);
          if (existingIndex >= 0) {
            return prev;
          }
          return [newChat, ...prev];
        });
        selectChat(newChat);
        setShowSearch(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-1/3 border-r bg-white">
          <div className="p-4 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-3 mb-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r bg-white">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{user?.username}</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => createChat(result._id)}
                      className="w-full flex items-center p-3 hover:bg-gray-50"
                    >
                      <Avatar src={result.avatar} alt={result.username} size="sm" />
                      <div className="ml-3 text-left">
                        <p className="font-semibold text-sm">{result.username}</p>
                        <p className="text-xs text-gray-500">{result.fullName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto">
          {chats.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-500 text-sm mb-4">
                Send private photos and messages to a friend or group
              </p>
              <Button
                onClick={() => setShowSearch(true)}
                size="sm"
              >
                Send Message
              </Button>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = chat.participants?.find(p => p._id !== user?._id);
              const lastMessage = chat.messages?.[chat.messages.length - 1];
              
              return (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-gray-100 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar src={otherUser?.avatar} alt={otherUser?.username} size="sm" />
                    {otherUser?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{otherUser?.fullName}</p>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage?.messageType === 'image' ? 'Sent a photo' : 
                         lastMessage?.text || 'Start a conversation'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar 
                    src={selectedChat.participants?.find(p => p._id !== user?._id)?.avatar} 
                    alt={selectedChat.participants?.find(p => p._id !== user?._id)?.username}
                    size="sm"
                  />
                  <div className="ml-3">
                    <p className="font-medium">
                      {selectedChat.participants?.find(p => p._id !== user?._id)?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{selectedChat.participants?.find(p => p._id !== user?._id)?.username}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <Avatar 
                    src={selectedChat.participants?.find(p => p._id !== user?._id)?.avatar}
                    alt={selectedChat.participants?.find(p => p._id !== user?._id)?.username}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                  <h3 className="font-medium text-lg mb-2">
                    {selectedChat.participants?.find(p => p._id !== user?._id)?.fullName}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    @{selectedChat.participants?.find(p => p._id !== user?._id)?.username}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Say hello to start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender._id === user?._id;
                  const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
                  
                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                        showAvatar ? 'mt-4' : 'mt-1'
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <Avatar 
                          src={message.sender.avatar}
                          alt={message.sender.username}
                          size="xs"
                          className="mr-2 mt-1"
                        />
                      )}
                      {!isOwn && !showAvatar && <div className="w-6 mr-2"></div>}
                      
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md border'
                        }`}
                      >
                        {message.messageType === 'image' ? (
                          <img
                            src={message.image?.url}
                            alt="Shared"
                            className="rounded-lg max-w-full"
                          />
                        ) : (
                          <p className="text-sm break-words">{message.text}</p>
                        )}
                        
                        {showAvatar && (
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    disabled={sending}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
                
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </button>

                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  loading={sending}
                  size="sm"
                >
                  Send
                </Button>
              </div>
            </form>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  sendImageMessage(file);
                }
              }}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 border-2 border-gray-200 rounded-full mx-auto flex items-center justify-center mb-6">
                <Send className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-light mb-2">Your Messages</h3>
              <p className="text-gray-400 mb-6">
                Send private photos and messages to a friend or group
              </p>
              <Button
                onClick={() => setShowSearch(true)}
                variant="primary"
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;