import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const ProgressBar = ({ progress }) => (
  <div className="absolute top-4 left-4 right-4 flex space-x-2">
    {progress.map((p, i) => (
      <div key={i} className="flex-1 h-1 bg-white bg-opacity-40 rounded overflow-hidden">
        <motion.div className="h-full bg-white rounded" initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ ease: 'linear', duration: 0.2 }} />
      </div>
    ))}
  </div>
);

const StoryViewer = ({ stories = [], startIndex = 0, isOpen = false, onClose, onViewed, onSeenBy }) => {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(stories.map(() => 0));
  const timerRef = useRef(null);
  const pausedRef = useRef(false);
  const pointerRef = useRef({ startX: 0, startY: 0, moved: false });
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    setProgress(stories.map(() => 0));
  }, [stories]);

  useEffect(() => {
    setIndex(startIndex || 0);
  }, [startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    if (!stories || stories.length === 0) return;
    startProgress();
    // preload next story
    preloadNext(index);
    return () => stopProgress();
  }, [index, stories, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // when index changes, mark viewed
    const s = stories[index];
    if (s) {
      // call API to mark viewed
      axios.post(`/stories/view/${s._id}`).catch(e => console.error('Mark view failed', e));
      if (onViewed) onViewed(s);
    }
  }, [index, isOpen]);

  const startProgress = useCallback(() => {
    stopProgress();
    const duration = stories[index]?.mediaType === 'video' ? 9000 : 5000;
    const startTime = Date.now();
    pausedRef.current = false;

    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(prev => prev.map((v, i) => i === index ? pct : v));
      if (pct >= 100) {
        clearInterval(timerRef.current);
        goNext();
      }
    }, 60);
  }, [index, stories]);

  const stopProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const goNext = () => {
    if (index < stories.length - 1) setIndex(index + 1);
    else onClose();
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
    else { /* nothing */ }
  };
  const current = stories[index];

  const onPointerDown = (e) => {
    pausedRef.current = true;
    pointerRef.current.moved = false;
    pointerRef.current.startX = e.touches ? e.touches[0].clientX : e.clientX;
    pointerRef.current.startY = e.touches ? e.touches[0].clientY : e.clientY;
  };

  const onPointerMove = (e) => {
    if (!pointerRef.current.startX) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - pointerRef.current.startX;
    if (Math.abs(dx) > 10) pointerRef.current.moved = true;
  };

  const onPointerUp = (e) => {
    pausedRef.current = false;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const dx = endX - pointerRef.current.startX;
    const threshold = 80;
    if (pointerRef.current.moved) {
      if (dx > threshold) goPrev();
      else if (dx < -threshold) goNext();
    } else {
      // tap: toggle pause
      pausedRef.current = !pausedRef.current;
    }
    pointerRef.current.startX = 0;
    pointerRef.current.startY = 0;
    pointerRef.current.moved = false;
  };

  const preloadNext = (idx) => {
    const next = stories[idx + 1];
    if (!next) return;
    if (next.mediaType === 'video') {
      const v = document.createElement('video');
      v.preload = 'auto';
      v.src = next.mediaUrl;
    } else {
      const img = new Image();
      img.src = next.mediaUrl;
    }
  };

  // keyboard navigation - always register/unregister while component mounted
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ') {
        // toggle pause
        pausedRef.current = !pausedRef.current;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, index]);

  if (!isOpen || !stories || stories.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onMouseEnter={() => (pausedRef.current = true)} onMouseLeave={() => (pausedRef.current = false)}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative max-w-3xl w-full max-h-full m-4 touch-pan-y">
        <ProgressBar progress={progress} />
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 absolute top-2 left-2 right-2 z-20">
            <div className="flex items-center space-x-3 text-white">
              <img src={current.user.avatar} alt={current.user.username} className="w-8 h-8 rounded-full object-cover" />
              <div className="text-sm font-medium">{current.user.username}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-white text-sm opacity-80">{new Date(current.createdAt).toLocaleString()}</div>
              {user && current.user && user._id === current.user._id && (
                <button onClick={() => onSeenBy && onSeenBy(current._id)} className="text-xs text-white bg-black bg-opacity-30 px-2 py-1 rounded">Seen by</button>
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center h-[70vh] bg-black" onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp} onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp}>
            <AnimatePresence initial={false} exitBeforeEnter>
              <motion.div key={current._id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.35 }} className="w-full flex items-center justify-center">
                {current.mediaType === 'video' ? (
                  <video src={current.mediaUrl} controls autoPlay className="max-h-full max-w-full object-contain" />
                ) : (
                  <img src={current.mediaUrl} alt="story" className="max-h-full max-w-full object-contain" />
                )}
              </motion.div>
            </AnimatePresence>

            <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3" />
            <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
