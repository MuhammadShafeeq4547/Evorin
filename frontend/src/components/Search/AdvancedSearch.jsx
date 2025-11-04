// src/components/Search/AdvancedSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Hash, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Avatar from '../UI/Avatar';
import { useDebounce } from '../../hooks/useDebounce';

const AdvancedSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({
    users: [],
    posts: [],
    reels: [],
    hashtags: [],
    locations: []
  });
  const [suggestions, setSuggestions] = useState({
    users: [],
    hashtags: [],
    locations: []
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    inputRef.current?.focus();
    loadRecentSearches();
    loadTrendingHashtags();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      search(debouncedQuery);
      getSuggestions(debouncedQuery);
    } else {
      setResults({ users: [], posts: [], reels: [], hashtags: [], locations: [] });
      setSuggestions({ users: [], hashtags: [], locations: [] });
    }
  }, [debouncedQuery]);

  const loadRecentSearches = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent);
    } catch (error) {
      console.error('Load recent searches error:', error);
    }
  };

  const loadTrendingHashtags = async () => {
    try {
      const response = await axios.get('/search/trending/hashtags?limit=10');
      if (response.data.success) {
        setTrendingHashtags(response.data.hashtags);
      }
    } catch (error) {
      console.error('Load trending hashtags error:', error);
    }
  };

  const search = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await axios.get('/search', {
        params: {
          query: searchQuery,
          type: activeTab === 'all' ? undefined : activeTab
        }
      });

      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (searchQuery) => {
    try {
      const response = await axios.get('/search/suggestions', {
        params: { query: searchQuery }
      });

      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Get suggestions error:', error);
    }
  };

  const saveRecentSearch = (item) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const filtered = recent.filter(r => r.id !== item.id);
      const updated = [item, ...filtered].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Save recent search error:', error);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const handleSelectUser = (user) => {
    saveRecentSearch({
      id: user._id,
      type: 'user',
      username: user.username,
      avatar: user.avatar
    });
    navigate(`/profile/${user.username}`);
    onClose?.();
  };

  const handleSelectHashtag = (hashtag) => {
    saveRecentSearch({
      id: hashtag,
      type: 'hashtag',
      hashtag
    });
    navigate(`/explore/tags/${hashtag}`);
    onClose?.();
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'users', label: 'Users' },
    { id: 'posts', label: 'Posts' },
    { id: 'reels', label: 'Reels' },
    { id: 'hashtags', label: 'Tags' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search users, posts, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : query.length < 2 ? (
            <div>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent</h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.type === 'user') {
                            navigate(`/profile/${item.username}`);
                          } else if (item.type === 'hashtag') {
                            navigate(`/explore/tags/${item.hashtag}`);
                          }
                          onClose?.();
                        }}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        {item.type === 'user' ? (
                          <>
                            <Avatar src={item.avatar} alt={item.username} size="sm" />
                            <span className="text-gray-900 dark:text-white">{item.username}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-gray-900 dark:text-white">#{item.hashtag}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Hashtags */}
              {trendingHashtags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trending</h3>
                  </div>
                  <div className="space-y-2">
                    {trendingHashtags.map((tag) => (
                      <button
                        key={tag.hashtag}
                        onClick={() => handleSelectHashtag(tag.hashtag)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                            <Hash className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">
                              #{tag.hashtag}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {tag.totalCount.toLocaleString()} posts
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Users</h3>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Avatar src={user.avatar} alt={user.username} size="sm" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white flex items-center">
                            {user.username}
                            {user.isVerified && (
                              <svg className="w-4 h-4 ml-1 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.fullName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {(activeTab === 'all' || activeTab === 'hashtags') && results.hashtags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Hashtags</h3>
                  <div className="space-y-2">
                    {results.hashtags.map((tag) => (
                      <button
                        key={tag.hashtag}
                        onClick={() => handleSelectHashtag(tag.hashtag)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            #{tag.hashtag}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {tag.totalCount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Grid */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Posts</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {results.posts.map((post) => (
                      <Link
                        key={post._id}
                        to={`/p/${post._id}`}
                        onClick={onClose}
                        className="aspect-square"
                      >
                        <img
                          src={post.images?.[0]?.url}
                          alt=""
                          className="w-full h-full object-cover rounded"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {Object.values(results).every(arr => arr.length === 0) && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedSearch;