import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

// Mock socket implementation for development (kept as fallback)
const createMockSocket = (token) => {
  let connected = false;
  let eventHandlers = {};
  
  const mockSocket = {
    connected: false,
    id: `mock_${Math.random().toString(36).substr(2, 9)}`,
    
    emit: (event, data) => {
      console.log(`Mock Socket Emit: ${event}`, data);
      // Simulate server responses
      setTimeout(() => {
        if (event === 'join_chat' && eventHandlers['chat_joined']) {
          eventHandlers['chat_joined']({ chatId: data });
        }
      }, 100);
    },
    
    on: (event, handler) => {
      eventHandlers[event] = handler;
    },
    
    off: (event, handler) => {
      if (eventHandlers[event] === handler) {
        delete eventHandlers[event];
      }
    },
    
    removeAllListeners: () => {
      eventHandlers = {};
    },
    
    close: () => {
      connected = false;
      mockSocket.connected = false;
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('client disconnect');
      }
    },
    
    connect: () => {
      connected = true;
      mockSocket.connected = true;
      setTimeout(() => {
        if (eventHandlers['connect']) {
          eventHandlers['connect']();
        }
      }, 500);
    }
  };
  
  // Auto connect after creation
  setTimeout(() => mockSocket.connect(), 100);
  
  return mockSocket;
};

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up existing connection
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setIsConnected(false);
      setOnlineUsers([]);
      return;
    }

    console.log('Attempting to connect socket for user:', user.username);

    // Create real socket connection
    let newSocket = null;
    try {
      newSocket = io(SOCKET_URL, {
        auth: { token: localStorage.getItem('accessToken') || undefined },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    } catch (err) {
      console.warn('Socket.io client failed to initialize, falling back to mock socket:', err.message || err);
      newSocket = createMockSocket(localStorage.getItem('accessToken'));
    }

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Socket ID:', newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
      setConnectionError(null);
      setReconnectAttempts(0);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message || error);
      setIsConnected(false);
      setConnectionError(error.message || 'Connection failed');
      setReconnectAttempts(prev => prev + 1);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io client disconnect' || reason === 'io server disconnect') {
        setConnectionError(null);
      } else {
        setConnectionError(`Disconnected: ${reason}`);
      }
    });

    newSocket.on('user_online', (users) => {
      console.log('Online users received:', users);
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    newSocket.on('new_message', (data) => {
      console.log('New message received:', data);
      // This will be handled by individual components
    });

    newSocket.on('notification', (data) => {
      console.log('New notification received:', data);
      // This will be handled by notification components
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message || 'Socket error occurred');
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    };
  }, [user, isAuthenticated]);

  // Helper functions for socket operations
  const joinChat = (chatId) => {
    if (socket && socket.connected && chatId) {
      console.log('Joining chat:', chatId);
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket && socket.connected && chatId) {
      console.log('Leaving chat:', chatId);
      socket.emit('leave_chat', chatId);
    }
  };

  const sendMessage = (chatId, message) => {
    if (socket && socket.connected && chatId && message) {
      console.log('Sending message to chat:', chatId);
      socket.emit('send_message', { chatId, message });
    }
  };

  const sendNotification = (recipientId, notification) => {
    if (socket && socket.connected && recipientId && notification) {
      console.log('Sending notification to:', recipientId);
      socket.emit('send_notification', { recipientId, notification });
    }
  };

  const startTyping = (chatId) => {
    if (socket && socket.connected && chatId) {
      socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket && socket.connected && chatId) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const value = {
    socket,
    onlineUsers,
    isConnected,
    connectionError,
    reconnectAttempts,
    joinChat,
    leaveChat,
    sendMessage,
    sendNotification,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};