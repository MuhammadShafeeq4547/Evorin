import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Flag,
  Link as LinkIcon,
  UserX
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../UI/Avatar';
import axios from 'axios';
import ProgressiveImage from '../UI/ProgressiveImage';
import { useSocket } from '../../contexts/SocketContext';
import EditPostModal from './EditPostModal';
import PostOptionsModal from './PostOptionsModal';
import EditPostModal from './EditPostModal';
import DeletePostModal from './DeletePostModal';

const Post = ({ post, onUpdate, onDelete }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [showMore, setShowMore] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (post.likes) {
      setIsLiked(post.likes.some(like => like.user === user?._id));
      setLikesCount(post.likesCount ?? post.likes.length);
    }
    if (post.saved) {
      setIsSaved(post.saved.includes(user?._id));
    }
  }, [post, user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onLiked = (data) => {
      if (data.postId === post._id) {
        setLikesCount(data.likesCount);
        setIsLiked(data.userId === user?._id ? data.isLiked : isLiked);
      }
    };

    const onComment = (data) => {
      if (data.postId === post._id) {
        setCommentsCount(data.commentsCount);
        // Optionally prepend comment if payload contains it
      }
    };

    socket.on('post_liked', onLiked);
    socket.on('comment_added', onComment);

    return () => {
      socket.off('post_liked', onLiked);
      socket.off('comment_added', onComment);
    };
  }, [socket, post._id, user, isLiked]);

  const handleLike = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/save`);
      if (response.data.success) {
        setIsSaved(response.data.isSaved);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const fetchComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/comments/${post._id}`);
      if (response.data.success) {
        setComments(response.data.comments);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(`/comments/${post._id}`, { 
        text: comment.trim() 
      });
      if (response.data.success) {
        setComments(prev => [response.data.comment, ...prev]);
        setComment('');
        setCommentsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await axios.post(`/comments/like/${commentId}`);
      setComments(prev => prev.map(c => 
        c._id === commentId 
          ? { 
              ...c, 
              likes: c.isLiked 
                ? c.likes.filter(like => like.user !== user._id)
                : [...(c.likes || []), { user: user._id }],
              isLiked: !c.isLiked
            }
          : c
      ));
    } catch (error) {
      console.error('Comment like error:', error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postTime.toLocaleDateString();
  };

  if (!post || !post.user) {
    return null;
  }

  const handlePostUpdate = (updatedPost) => {
    if (onUpdate) {
      onUpdate(updatedPost);
    }
  };

  const handlePostDelete = (postId) => {
    if (onDelete) {
      onDelete(postId);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg mb-6 max-w-lg mx-auto shadow-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user.username}`} className="flex items-center">
          <Avatar 
            src={post.user.avatar}
            alt={post.user.username}
            size="sm"
          />
          <div className="ml-3">
            <p className="font-semibold text-sm">{post.user.username}</p>
            {post.location && (
              <p className="text-xs text-gray-500">{post.location}</p>
            )}
          </div>
        </Link>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              {post.user._id === user?._id ? (
                <>
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit post
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete post
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + `/p/${post._id}`);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 mr-3" />
                    Copy link
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserX className="w-4 h-4 mr-3" />
                    Unfollow
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Flag className="w-4 h-4 mr-3" />
                    Report
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Images */}
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {post.images && post.images.length > 0 ? (
            <ProgressiveImage src={post.images[currentImageIndex]?.url} alt={post.caption || 'Post image'} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        
        {post.images?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Image indicators */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {post.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-blue-500' : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`transition-colors hover:text-gray-600 ${
                isLiked ? 'text-red-500' : 'text-gray-700'
              }`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart 
                className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} 
              />
            </button>
            <button
              onClick={fetchComments}
              disabled={loading}
              className="text-gray-700 hover:text-gray-600 transition-colors"
              aria-label="View comments"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button 
              className="text-gray-700 hover:text-gray-600 transition-colors"
              aria-label="Share post"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`transition-colors hover:text-gray-600 ${
              isSaved ? 'text-black' : 'text-gray-700'
            }`}
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <p className="font-semibold text-sm mb-2">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-sm mr-2">{post.user.username}</span>
            <span className="text-sm">
              {showMore || post.caption.length <= 100 
                ? post.caption 
                : `${post.caption.slice(0, 100)}...`}
              {post.caption.length > 100 && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-gray-500 ml-1 hover:text-gray-700"
                >
                  {showMore ? 'less' : 'more'}
                </button>
              )}
            </span>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm mr-2 hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* View comments */}
        {commentsCount > 0 && !showComments && (
          <button
            onClick={fetchComments}
            disabled={loading}
            className="text-sm text-gray-500 mb-2 hover:text-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : `View all ${commentsCount} comments`}
          </button>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((commentItem) => (
                <div key={commentItem._id} className="flex items-start space-x-2 group">
                  <Avatar 
                    src={commentItem.user?.avatar}
                    alt={commentItem.user?.username}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm break-words">
                      <Link 
                        to={`/profile/${commentItem.user?.username}`}
                        className="font-semibold mr-2 hover:underline"
                      >
                        {commentItem.user?.username}
                      </Link>
                      {commentItem.text}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(commentItem.createdAt)}
                      </span>
                      {commentItem.likes?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {commentItem.likes.length} {commentItem.likes.length === 1 ? 'like' : 'likes'}
                        </span>
                      )}
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        Reply
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCommentLike(commentItem._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart 
                      className={`w-3 h-3 ${
                        commentItem.isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Time */}
        <p className="text-xs text-gray-500 mb-3">
          {formatTime(post.createdAt)}
        </p>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex items-center space-x-2 pt-2 border-t border-gray-200">
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="text-blue-500 font-semibold text-sm disabled:opacity-50 hover:text-blue-700 transition-colors disabled:cursor-not-allowed"
          >
            Post
          </button>
        </form>
      </div>
    </div>

    {/* Edit Modal */}
    <EditPostModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      post={post}
      onUpdate={handlePostUpdate}
    />

    {/* Delete Modal */}
    <DeletePostModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      post={post}
      onDelete={handlePostDelete}
    />
  </>
  );
};

export default Post;