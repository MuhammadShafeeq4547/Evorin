import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Play } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { ExploreSkeleton } from '../UI/Skeleton';
import { ExploreSkeleton } from '../UI/Skeleton';

const PLACEHOLDER = '/placeholder-image.jpg';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef();
  const { socket } = useSocket();

  const LIMIT = 21;

  useEffect(() => {
    loadPage(1);
  }, []);

  // Socket updates: update likes/comments counts in real-time
  useEffect(() => {
    if (!socket) return;

    const onPostLiked = (data) => {
      const { postId, likesCount } = data;
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount } : p));
    };

    const onCommentAdded = (data) => {
      const { postId, commentsCount } = data;
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount } : p));
    };

    socket.on('post_liked', onPostLiked);
    socket.on('comment_added', onCommentAdded);

    return () => {
      socket.off('post_liked', onPostLiked);
      socket.off('comment_added', onCommentAdded);
    };
  }, [socket]);

  const loadPage = useCallback(async (pageNum = 1) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      if (pageNum === 1) setLoading(true);

      const res = await axios.get(`/posts/explore?page=${pageNum}&limit=${LIMIT}`);
      if (res.data.success) {
        const fetched = res.data.posts;
        if (pageNum === 1) setPosts(fetched);
        else setPosts(prev => [...prev, ...fetched]);

        setHasMore(Boolean(res.data.pagination?.hasMore));
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Explore load error', err);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadPage(page + 1);
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasMore, loadPage]);

  // Progressive image component: blur -> decode -> remove blur
  const ProgressiveImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    const [err, setErr] = useState(false);

    return (
      <div className="w-full h-full bg-gray-100 relative overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-700 ${loaded ? 'scale-100 blur-0' : 'scale-105 blur-sm'}`}
          onLoad={() => setLoaded(true)}
          onError={(e) => { setErr(true); e.target.src = PLACEHOLDER; }}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-60 animate-pulse" />
          </div>
        )}
      </div>
    );
  };

  const getGridItemClass = (index) => {
    const patterns = [
      'col-span-1 row-span-1',
      'col-span-2 row-span-2',
      'col-span-1 row-span-2',
      'col-span-2 row-span-1'
    ];
    if ((index + 1) % 7 === 0) return patterns[1];
    if ((index + 1) % 5 === 0) return patterns[2];
    if ((index + 1) % 9 === 0) return patterns[3];
    return patterns[0];
  };

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 py-6">
      <h2 className="text-2xl font-semibold mb-4">Explore</h2>

      {loading && posts.length === 0 ? (
        <ExploreSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-2 md:gap-4 auto-rows-fr">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                layout
                key={post._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className={`${getGridItemClass(index)} rounded-md overflow-hidden bg-gray-50`}
              >
                <Link to={`/p/${post._id}`} className="block relative group w-full h-full">
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
                    <ProgressiveImage src={post.images?.[0]?.url || PLACEHOLDER} alt={post.caption || 'Explore post'} />
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-35 transition-opacity flex items-center justify-center">
                    <div className="flex items-center text-white space-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center">
                        <Heart className="w-6 h-6 mr-2" />
                        <span className="font-semibold">{post.likesCount ?? post.likes?.length ?? 0}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-6 h-6 mr-2" />
                        <span className="font-semibold">{post.commentsCount ?? post.comments?.length ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {post.images?.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3zM3 7.5h18v12A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5v-12z"/>
                      </svg>
                    </div>
                  )}

                  {post.images?.[0]?.url?.includes('video') && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 rounded p-1">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Observer element for infinite scroll */}
      <div ref={observerRef} className="h-8 flex items-center justify-center mt-6">
        {isFetching && (
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-b-2 border-gray-700 animate-spin" />
            <span className="text-sm text-gray-600">Loading more</span>
          </div>
        )}
        {!hasMore && !isFetching && (
          <div className="text-sm text-gray-500">You have reached the end</div>
        )}
      </div>
    </div>
  );
};

export { ExplorePage };