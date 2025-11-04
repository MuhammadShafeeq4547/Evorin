// src/components/Reels/ReelsViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../UI/Avatar';

const ReelsViewer = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { reelId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    if (reels.length > 0 && videoRef.current) {
      playVideo();
    }
  }, [currentIndex, reels]);

  // Socket updates
  useEffect(() => {
    if (!socket) return;

    const onReelLiked = (data) => {
      if (reels[currentIndex]?._id === data.reelId) {
        setReels(prev => {
          const updated = [...prev];
          updated[currentIndex].likesCount = data.likesCount;
          return updated;
        });
      }
    };

    socket.on('reel_liked', onReelLiked);
    return () => socket.off('reel_liked', onReelLiked);
  }, [socket, currentIndex, reels]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reels/feed');
      
      if (response.data.success) {
        setReels(response.data.reels);
        
        // If specific reel ID, find its index
        if (reelId) {
          const index = response.data.reels.findIndex(r => r._id === reelId);
          if (index >= 0) setCurrentIndex(index);
        }
      }
    } catch (error) {
      console.error('Fetch reels error:', error);
    } finally {
      setLoading(false);
    }
  };

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error('Play error:', err));
      setIsPlaying(true);
      
      // Track view
      trackView();
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const trackView = async () => {
    if (!reels[currentIndex]) return;
    
    try {
      await axios.post(`/reels/${reels[currentIndex]._id}/view`, {
        duration: videoRef.current?.currentTime || 0
      });
    } catch (error) {
      console.error('Track view error:', error);
    }
  };

  const handleLike = async () => {
    if (!reels[currentIndex]) return;
    
    try {
      const response = await axios.post(`/reels/${reels[currentIndex]._id}/like`);
      
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setReels(prev => {
          const updated = [...prev];
          updated[currentIndex].likesCount = response.data.likesCount;
          return updated;
        });
      }
    } catch (error) {
      console.error('Like reel error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !reels[currentIndex]) return;

    try {
      const response = await axios.post(`/comments/${reels[currentIndex]._id}`, {
        text: comment.trim()
      });

      if (response.data.success) {
        setComments(prev => [response.data.comment, ...prev]);
        setComment('');
      }
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowComments(false);
    } else {
      // Load more reels
      // fetchMoreReels();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowComments(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') goToPrev();
      else if (e.key === 'ArrowDown') goToNext();
      else if (e.key === ' ') togglePlay();
      else if (e.key === 'Escape') navigate('/');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isPlaying]);

  // Touch gestures
  const handleTouchStart = (e) => {
    const startY = e.touches[0].clientY;
    
    const handleTouchMove = (e) => {
      const deltaY = e.touches[0].clientY - startY;
      
      if (Math.abs(deltaY) > 50) {
        if (deltaY < 0) goToNext();
        else goToPrev();
        
        window.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', () => {
      window.removeEventListener('touchmove', handleTouchMove);
    }, { once: true });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No reels available</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white text-black rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black"
      onTouchStart={handleTouchStart}
    >
      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.video
            key={currentReel._id}
            ref={videoRef}
            src={currentReel.video.url}
            className="w-full h-full object-contain"
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Play/Pause overlay */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mute button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* User info and actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
          <div className="flex items-end justify-between">
            {/* Left side - user info */}
            <div className="flex-1 pr-4">
              <div className="flex items-center mb-3">
                <Avatar 
                  src={currentReel.user.avatar}
                  alt={currentReel.user.username}
                  size="sm"
                  className="ring-2 ring-white"
                />
                <span className="ml-3 text-white font-semibold">
                  {currentReel.user.username}
                </span>
                {currentReel.user._id !== user._id && (
                  <button className="ml-3 px-4 py-1 border border-white text-white rounded-lg text-sm">
                    Follow
                  </button>
                )}
              </div>

              {currentReel.caption && (
                <p className="text-white text-sm mb-2 line-clamp-2">
                  {currentReel.caption}
                </p>
              )}

              {currentReel.audio && (
                <div className="flex items-center text-white text-xs">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <span>{currentReel.audio.name} • {currentReel.audio.artist}</span>
                </div>
              )}
            </div>

            {/* Right side - actions */}
            <div className="flex flex-col items-center space-y-6">
              {/* Like */}
              <motion.button
                onClick={handleLike}
                className="flex flex-col items-center"
                whileTap={{ scale: 0.9 }}
              >
                <Heart
                  className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
                <span className="text-white text-xs mt-1">
                  {currentReel.likesCount || 0}
                </span>
              </motion.button>

              {/* Comment */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex flex-col items-center"
              >
                <MessageCircle className="w-7 h-7 text-white" />
                <span className="text-white text-xs mt-1">
                  {currentReel.commentsCount || 0}
                </span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center">
                <Send className="w-7 h-7 text-white" />
                <span className="text-white text-xs mt-1">Share</span>
              </button>

              {/* More */}
              <button className="flex flex-col items-center">
                <MoreHorizontal className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 flex space-x-1 p-2">
          {reels.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-0.5 bg-white bg-opacity-30 rounded overflow-hidden"
            >
              {index === currentIndex && (
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: videoRef.current?.duration || 15, ease: 'linear' }}
                />
              )}
              {index < currentIndex && (
                <div className="h-full bg-white" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comments sidebar */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Comments</h3>
                <button onClick={() => setShowComments(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((commentItem) => (
                      <div key={commentItem._id} className="flex items-start space-x-3">
                        <Avatar
                          src={commentItem.user?.avatar}
                          alt={commentItem.user?.username}
                          size="xs"
                        />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold mr-2">
                              {commentItem.user?.username}
                            </span>
                            {commentItem.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleComment} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelsViewer;