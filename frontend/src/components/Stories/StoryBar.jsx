import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StoryAvatar from './StoryAvatar';
import StoryUploadModal from './StoryUploadModal';
import StoryViewer from './StoryViewer';
import SeenByModal from './SeenByModal';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { StorySkeleton } from '../UI/Skeleton';
import { StorySkeleton } from '../UI/Skeleton';

const StoryBar = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [seenByOpen, setSeenByOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const { user } = useAuth();
  const { socket } = useSocket();

  const fetch = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axios.get('/stories');
      } catch (err) {
        // If unauthorized or no auth available, try public endpoint
        if (err.response && err.response.status === 401) {
          res = await axios.get('/stories/public');
        } else throw err;
      }
      if (res && res.data && res.data.success) setStories(res.data.stories);
    } catch (err) {
      console.error('Fetch stories failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onAdded = (data) => {
      if (data.story) setStories(prev => [data.story, ...prev]);
      else if (data.storyId) fetch();
    };
    const onViewed = (data) => {
      // optimistic update: mark viewer on story
      setStories(prev => prev.map(s => s._id === data.storyId ? { ...s, viewers: [...(s.viewers||[]), { _id: data.viewerId }] } : s));
    };

    socket.on('story_added', onAdded);
    socket.on('new_story_available', onAdded);
    socket.on('story_viewed', onViewed);

    return () => {
      socket.off('story_added', onAdded);
      socket.off('new_story_available', onAdded);
      socket.off('story_viewed', onViewed);
    };
  }, [socket]);

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleSeenBy = (storyId) => {
    setSelectedStoryId(storyId);
    setSeenByOpen(true);
  };

  const onUploaded = (story) => {
    setStories(prev => [story, ...prev]);
  };

  if (loading) {
    return <StorySkeleton />;
  }

  if (loading) {
    return <StorySkeleton />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        {/* Upload tile */}
        <div className="flex flex-col items-center min-w-[64px] cursor-pointer" onClick={() => setUploadOpen(true)}>
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-xs text-gray-600 mt-1">Your Story</span>
        </div>

        {stories.map((s, i) => (
          <div key={s._id} onClick={() => openViewer(i)}>
            <StoryAvatar user={s.user} seen={(s.viewers || []).some(v => v._id === user?._id)} />
          </div>
        ))}
      </div>

      <StoryUploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} onUploaded={onUploaded} />

      <StoryViewer
        stories={stories}
        startIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onSeenBy={handleSeenBy}
      />

      <SeenByModal isOpen={seenByOpen} onClose={() => setSeenByOpen(false)} storyId={selectedStoryId} />
    </div>
  );
};

export default StoryBar;
