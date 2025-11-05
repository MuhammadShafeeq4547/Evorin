import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Home, 
  Compass, 
  User, 
  Settings, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../UI/Avatar';
import axios from 'axios';

// Notification Dropdown Component
const NotificationDropdown = ({ onClose, onUpdateCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications?limit=10');
      if (response.data.success) {
        setNotifications(response.data.notifications);
        onUpdateCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a comment';
      case 'post_tag':
        return 'tagged you in a post';
      default:
        return notification.message || 'sent you a notification';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-20">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Notifications</h3>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification._id);
                }
                onClose();
              }}
            >
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={notification.sender?.avatar} 
                  alt={notification.sender?.username}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.sender?.username}</span>
                    {' '}{getNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {notification.post?.images?.[0] && (
                  <img
                    src={notification.post.images[0].url}
                    alt="Post"
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Header Component
const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  const handleSearch = async (query) => {
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
      console.error('Search error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowDropdown(false);
    }
  };

  const isActiveRoute = (path) => location.pathname === path;

  // If user is not authenticated, show login/signup buttons
  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Instagram
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Instagram
          </Link>
          
          {/* Mobile Search Icon */}
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="relative flex-1 max-w-xs mx-4 md:mx-8 hidden sm:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => setShowSearch(true)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {searchResults.map((result) => (
                    <Link
                      key={result._id}
                      to={`/profile/${result.username}`}
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      <Avatar 
                        src={result.avatar}
                        alt={result.username}
                        size="sm"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-sm">{result.username}</p>
                        <p className="text-xs text-gray-500">{result.fullName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Icons - Hidden on mobile (using bottom nav instead) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`hover:text-gray-600 transition-colors ${isActiveRoute('/') ? 'text-black' : 'text-gray-400'}`}
            >
              <Home className="w-6 h-6" fill={isActiveRoute('/') ? 'currentColor' : 'none'} />
            </Link>
            
            <Link 
              to="/messages" 
              className={`hover:text-gray-600 transition-colors ${isActiveRoute('/messages') ? 'text-black' : 'text-gray-400'}`}
            >
              <MessageCircle className="w-6 h-6" fill={isActiveRoute('/messages') ? 'currentColor' : 'none'} />
            </Link>
            
            <Link 
              to="/create" 
              className={`hover:text-gray-600 transition-colors ${isActiveRoute('/create') ? 'text-black' : 'text-gray-400'}`}
            >
              <Plus className="w-6 h-6" />
            </Link>
            
            <Link 
              to="/explore" 
              className={`hover:text-gray-600 transition-colors ${isActiveRoute('/explore') ? 'text-black' : 'text-gray-400'}`}
            >
              <Compass className="w-6 h-6" fill={isActiveRoute('/explore') ? 'currentColor' : 'none'} />
            </Link>
            
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="hover:text-gray-600 transition-colors relative"
              >
                <Heart className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <NotificationDropdown 
                  onClose={() => setShowNotifications(false)}
                  onUpdateCount={setUnreadCount}
                />
              )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="focus:outline-none"
              >
                <Avatar 
                  src={user?.avatar}
                  alt={user?.username}
                  size="sm"
                  className="ring-2 ring-transparent hover:ring-gray-200 transition-all"
                />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <Link
                    to={`/profile/${user?.username}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;