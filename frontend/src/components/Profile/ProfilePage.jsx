import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Settings, 
  Grid, 
  Bookmark, 
  Tag, 
  Heart, 
  MessageCircle, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import ProgressiveImage from '../UI/ProgressiveImage';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { ProfileSkeleton } from '../UI/Skeleton';
import { ProfileSkeleton } from '../UI/Skeleton';

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);
  const fetchProfile = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/profile/${username}?page=${pageNum}&limit=21`);
      if (response.data.success) {
        const userData = response.data.user;
        setProfile(userData);
        // If first page, replace posts; otherwise append
        if (pageNum === 1) setUserPosts(response.data.posts || []);
        else setUserPosts(prev => [...prev, ...(response.data.posts || [])]);

        setFollowersCount(userData.followers?.length || 0);
        setFollowingCount(userData.following?.length || 0);
        setIsFollowing(userData.followers?.some(follower => follower._id === user?._id) || false);

        setPage(response.data.pagination?.page || pageNum);
        setHasMore(Boolean(response.data.pagination?.hasMore));
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  }, [username, user]);

  const fetchSavedPosts = async () => {
    if (profile?._id !== user?._id) return; // Only show saved posts for own profile
    
    try {
      const response = await axios.get('/posts/saved');
      if (response.data.success) {
        setSavedPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Fetch saved posts error:', error);
    }
  };

  // Infinite scroll observer for profile posts
  useEffect(() => {
    if (!hasMore) return;
    const el = observerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // load next page
          fetchProfile(page + 1);
        }
      });
    }, { rootMargin: '300px' });

    obs.observe(el);
    return () => obs.disconnect();
  }, [page, hasMore, fetchProfile]);

  // Socket real-time updates for profile page
  useEffect(() => {
    if (!socket) return;

    const onNewPost = (data) => {
      const { post } = data;
      if (post && profile && post.user === profile._id) {
        setUserPosts(prev => [post, ...prev]);
      }
    };

    const onPostLiked = (data) => {
      setUserPosts(prev => prev.map(p => p._id === data.postId ? { ...p, likesCount: data.likesCount } : p));
    };

    const onCommentAdded = (data) => {
      setUserPosts(prev => prev.map(p => p._id === data.postId ? { ...p, commentsCount: data.commentsCount } : p));
    };

    socket.on('new_post', onNewPost);
    socket.on('post_liked', onPostLiked);
    socket.on('comment_added', onCommentAdded);

    return () => {
      socket.off('new_post', onNewPost);
      socket.off('post_liked', onPostLiked);
      socket.off('comment_added', onCommentAdded);
    };
  }, [socket, profile]);

  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`/users/followers/${profile._id}`);
      if (response.data.success) {
        setFollowers(response.data.followers);
        setShowFollowers(true);
      }
    } catch (error) {
      console.error('Fetch followers error:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axios.get(`/users/following/${profile._id}`);
      if (response.data.success) {
        setFollowing(response.data.following);
        setShowFollowing(true);
      }
    } catch (error) {
      console.error('Fetch following error:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await axios.post(`/users/follow/${profile._id}`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        setFollowersCount(prev => response.data.isFollowing ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'saved' && savedPosts.length === 0) {
      fetchSavedPosts();
    }
  };

  const renderPostGrid = (posts) => {
    if (posts.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-2 border-gray-300 rounded-full mx-auto flex items-center justify-center mb-4">
            {activeTab === 'posts' ? (
              <Grid className="w-8 h-8 text-gray-300" />
            ) : activeTab === 'saved' ? (
              <Bookmark className="w-8 h-8 text-gray-300" />
            ) : (
              <Tag className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <p className="text-gray-500 font-light text-xl mb-2">
            {activeTab === 'posts' ? 'No Posts Yet' : 
             activeTab === 'saved' ? 'No Saved Posts' : 'No Tagged Posts'}
          </p>
          <p className="text-gray-400 text-sm">
            {activeTab === 'posts' && profile?._id === user?._id && 
              "When you share photos and videos, they'll appear on your profile."
            }
            {activeTab === 'saved' && 
              "Save posts you'd like to see again."
            }
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        <AnimatePresence>
              {posts.map((post) => (
            <motion.div key={post._id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative group cursor-pointer">
              <Link to={`/p/${post._id}`} className="aspect-square block overflow-hidden rounded-sm">
                <ProgressiveImage src={post.images?.[0]?.url} alt={post.caption || 'Post'} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="flex items-center text-white space-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center">
                      <Heart className="w-6 h-6 mr-2 fill-current" />
                <span className="font-semibold">{(post.likesCount ?? post.likes?.length) || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-6 h-6 mr-2 fill-current" />
                <span className="font-semibold">{(post.commentsCount ?? post.comments?.length) || 0}</span>
                    </div>
                  </div>
                </div>
                {post.images?.length > 1 && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3zM3 7.5h18v12A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5v-12z"/>
                    </svg>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const UserModal = ({ title, users, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto max-h-80">
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {title.toLowerCase()} to show
              </div>
            ) : (
              <div className="divide-y">
                {users.map((userItem) => (
                  <Link
                    key={userItem._id}
                    to={`/profile/${userItem.username}`}
                    className="flex items-center p-4 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    <Avatar src={userItem.avatar} alt={userItem.username} size="sm" />
                    <div className="ml-3 flex-1">
                      <p className="font-semibold text-sm">{userItem.username}</p>
                      <p className="text-gray-500 text-sm">{userItem.fullName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-light mb-4">User not found</h2>
        <p className="text-gray-500">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwnProfile = profile._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-12 space-y-6 md:space-y-0">
        <div className="md:mr-12 mx-auto md:mx-0">
          <Avatar src={profile.avatar} alt={profile.username} size="xxl" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl font-light mr-6">{profile.username}</h1>
            
            <div className="flex items-center justify-center md:justify-start space-x-4">
              {isOwnProfile ? (
                <>
                  <Link to="/settings/profile">
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? 'outline' : 'primary'}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Link to={`/messages/${profile._id}`}>
                    <Button variant="outline" size="sm">
                      <MessageIcon className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start space-x-8 mb-6 text-center md:text-left">
            <div>
              <span className="font-semibold block">{userPosts.length}</span>
              <span className="text-gray-600 text-sm">posts</span>
            </div>
            <button onClick={fetchFollowers} className="hover:text-gray-600">
              <span className="font-semibold block">{followersCount}</span>
              <span className="text-gray-600 text-sm">followers</span>
            </button>
            <button onClick={fetchFollowing} className="hover:text-gray-600">
              <span className="font-semibold block">{followingCount}</span>
              <span className="text-gray-600 text-sm">following</span>
            </button>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="font-semibold mb-2">{profile.fullName}</h2>
            {profile.bio && (
              <p className="text-gray-700 whitespace-pre-line mb-2">{profile.bio}</p>
            )}
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-sm"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-gray-300">
        <nav className="flex justify-center space-x-16">
          <button
            onClick={() => handleTabChange('posts')}
            className={`flex items-center py-3 text-sm font-medium border-t ${
              activeTab === 'posts' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-3 h-3 mr-1" />
            POSTS
          </button>
          
          {isOwnProfile && (
            <button
              onClick={() => handleTabChange('saved')}
              className={`flex items-center py-3 text-sm font-medium border-t ${
                activeTab === 'saved' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bookmark className="w-3 h-3 mr-1" />
              SAVED
            </button>
          )}
          
          <button
            onClick={() => handleTabChange('tagged')}
            className={`flex items-center py-3 text-sm font-medium border-t ${
              activeTab === 'tagged' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tag className="w-3 h-3 mr-1" />
            TAGGED
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'posts' && renderPostGrid(userPosts)}
        {activeTab === 'saved' && renderPostGrid(savedPosts)}
        {activeTab === 'tagged' && renderPostGrid(taggedPosts)}
      </div>

      {/* sentinel for infinite scroll observer */}
      {hasMore && <div ref={observerRef} className="h-1" />}

      {/* Modals */}
      <UserModal
        title="Followers"
        users={followers}
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
      />
      
      <UserModal
        title="Following"
        users={following}
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
      />
    </div>
  );
};

export default ProfilePage;