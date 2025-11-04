import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Post from '../Post/Post';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import Button from '../UI/Button';
import Avatar from '../UI/Avatar';
import { Plus, Camera, Users, Compass } from 'lucide-react';
import StoryBar from '../Stories/StoryBar';

const SuggestedUsers = ({ users, onFollow }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Suggestions for you</h3>
        <Link to="/suggested" className="text-blue-600 text-sm hover:text-blue-700">
          See All
        </Link>
      </div>
      <div className="space-y-3">
        {users.slice(0, 5).map((user) => (
          <div key={user._id} className="flex items-center justify-between">
            <Link to={`/profile/${user.username}`} className="flex items-center">
              <Avatar src={user.avatar} alt={user.username} size="sm" />
              <div className="ml-3">
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-gray-500">
                  {user.mutualFollowers > 0 
                    ? `${user.mutualFollowers} mutual followers`
                    : 'Suggested for you'
                  }
                </p>
              </div>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFollow(user._id)}
              className="text-xs"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyFeed = () => (
  <div className="text-center py-16">
    <div className="mb-6">
      <div className="w-24 h-24 border-2 border-gray-200 rounded-full mx-auto flex items-center justify-center mb-4">
        <Camera className="w-12 h-12 text-gray-300" />
      </div>
    </div>
    <h3 className="text-2xl font-light mb-4">Welcome to Instagram</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto">
      When you follow people, you'll see the photos and videos they post here.
    </p>
    <div className="space-y-4">
      <Link
        to="/explore" 
        className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Compass className="w-5 h-5 mr-2" />
        Find People to Follow
      </Link>
      <div className="block">
        <Link
          to="/create"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Share your first photo
        </Link>
      </div>
    </div>
  </div>
);

const LoadingFeed = () => (
  <div className="space-y-6 max-w-lg mx-auto">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="p-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="space-y-1 flex-1">
            <div className="h-3 bg-gray-300 rounded w-24"></div>
            <div className="h-2 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
        <div className="aspect-square bg-gray-300"></div>
        <div className="p-4 space-y-2">
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-2 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
);

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const observerRef = useRef();

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await axios.get(`/posts/feed?page=${pageNum}&limit=10`);
      
      if (response.data.success) {
        const newPosts = response.data.posts.map(post => ({
          ...post,
          isLiked: post.likes?.some(like => like.user === user?._id),
          isSaved: user?.saved?.includes(post._id)
        }));

        if (reset || pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(response.data.pagination?.hasMore || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user]);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const response = await axios.get('/users/suggested?limit=5');
      if (response.data.success) {
        setSuggestedUsers(response.data.users);
      }
    } catch (error) {
      console.error('Fetch suggested users error:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, true);
    fetchSuggestedUsers();
  }, [fetchPosts, fetchSuggestedUsers]);

  // Socket real-time updates
  useEffect(() => {
    if (!socket) return;

    const onNewPost = (data) => {
      // prepend new post if it's from people the user follows
      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
      }
    };

    const onPostLiked = (data) => {
      setPosts(prev => prev.map(p => p._id === data.postId ? { ...p, likesCount: data.likesCount } : p));
    };

    const onCommentAdded = (data) => {
      setPosts(prev => prev.map(p => p._id === data.postId ? { ...p, commentsCount: data.commentsCount } : p));
    };

    socket.on('new_post', onNewPost);
    socket.on('post_liked', onPostLiked);
    socket.on('comment_added', onCommentAdded);

    return () => {
      socket.off('new_post', onNewPost);
      socket.off('post_liked', onPostLiked);
      socket.off('comment_added', onCommentAdded);
    };
  }, [socket]);

  const handleFollowUser = async (userId) => {
    try {
      const response = await axios.post(`/users/follow/${userId}`);
      if (response.data.success) {
        setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
        // Refresh posts to potentially show new content
        fetchPosts(1, true);
      }
    } catch (error) {
      console.error('Follow user error:', error);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return;
    const el = observerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
    }, { rootMargin: '300px' });

    obs.observe(el);
    return () => obs.disconnect();
  }, [page, hasMore]);

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const refreshFeed = () => {
    setError(null);
    fetchPosts(1, true);
  };

  if (loading) {
    return <LoadingFeed />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="mb-4">
          <div className="w-16 h-16 border-2 border-red-200 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={refreshFeed} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <StoryBar />

      {/* Suggested Users */}
      <SuggestedUsers users={suggestedUsers} onFollow={handleFollowUser} />

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <>
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div key={post._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Post post={post} onUpdate={handlePostUpdate} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Infinite scroll observer anchor */}
          <div ref={observerRef} className="h-8" />

          {/* Load More Button (fallback) */}
          {hasMore && (
            <div className="text-center py-8">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                loading={loadingMore}
                variant="outline"
                className="px-8"
              >
                {loadingMore ? 'Loading more posts...' : 'Load More'}
              </Button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">You're all caught up!</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for new posts</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;