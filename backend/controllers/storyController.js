const Story = require('../models/Story');
const Highlight = require('../models/Highlight');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

let ioInstance = null;
let cleanupInterval = null;

const storyController = {
  // Upload a new story (media upload handled by multer/cloudinary middleware)
  uploadStory: async (req, res) => {
    try {
      // multer + cloudinary-storage attaches file info in req.file
      if (!req.file || !req.user) {
        return res.status(400).json({ success: false, message: 'No media uploaded or not authenticated' });
      }

  const mediaUrl = req.file.path || req.file.secure_url || req.file.url;
  const mime = req.file.mimetype || '';
  const publicId = req.file.filename || req.file.public_id || req.file.publicId;
      const mediaType = mime.startsWith('video') ? 'video' : 'image';

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

      const story = new Story({
        user: req.user._id,
        mediaUrl,
        publicId,
        mediaType,
        expiresAt
      });

      await story.save();

      // Populate minimal user info
      const populated = await Story.findById(story._id).populate('user', 'username avatar');

      // Emit socket event to followers/participants. We'll emit to the user's room and a global broadcast.
      if (ioInstance) {
        // emit to the user (so their other clients update immediately)
        ioInstance.to(req.user._id.toString()).emit('story_added', { story: populated });
        // Optionally broadcast a lightweight 'new_story' to friends — here we emit globally for now
        ioInstance.emit('new_story_available', { userId: req.user._id.toString(), storyId: story._id });
      }

      res.json({ success: true, story: populated });
    } catch (error) {
      console.error('Upload story error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get all stories for current user's feed (self + friends) — simple version: return all non-expired stories
  getStories: async (req, res) => {
    try {
      // Defensive: ensure we have a user (route is protected)
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const now = new Date();
      const stories = await Story.find({ expiresAt: { $gt: now } })
        .sort({ createdAt: -1 })
        .populate('user', 'username avatar')
        .populate('viewers', 'username avatar')
        .lean();

      res.json({ success: true, stories });
    } catch (error) {
      console.error('Get stories error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Public stories endpoint (no auth) for health checks or public feeds
  getPublicStories: async (req, res) => {
    try {
      const now = new Date();
      const stories = await Story.find({ expiresAt: { $gt: now } })
        .sort({ createdAt: -1 })
        .populate('user', 'username avatar')
        .populate('viewers', 'username avatar');

      res.json({ success: true, stories });
    } catch (error) {
      console.error('Get public stories error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get stories for a specific user
  getUserStories: async (req, res) => {
    try {
      const { userId } = req.params;
      const now = new Date();
      const stories = await Story.find({ user: userId, expiresAt: { $gt: now } })
        .sort({ createdAt: 1 })
        .populate('user', 'username avatar')
        .populate('viewers', 'username avatar');

      res.json({ success: true, stories });
    } catch (error) {
      console.error('Get user stories error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Mark story as viewed by current user
  viewStory: async (req, res) => {
    try {
      const { id } = req.params; // story id
      const story = await Story.findById(id);
      if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

      const userId = req.user._id;
      if (!story.viewers.map(String).includes(userId.toString())) {
        story.viewers.push(userId);
        await story.save();

        // Emit socket event to story owner
        if (ioInstance) {
          ioInstance.to(story.user.toString()).emit('story_viewed', { storyId: story._id, viewerId: userId });
        }
      }

      res.json({ success: true, viewers: story.viewers });
    } catch (error) {
      console.error('View story error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Highlights: create a highlight collection
  createHighlight: async (req, res) => {
    try {
      const { title } = req.body;
      const { stories: storyIds } = req.body;

      if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

      const highlight = new Highlight({
        user: req.user._id,
        title,
        stories: Array.isArray(storyIds) ? storyIds : []
      });

      await highlight.save();

      res.json({ success: true, highlight });
    } catch (error) {
      console.error('Create highlight error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getHighlights: async (req, res) => {
    try {
      const userId = req.params.userId || req.user._id;
      const highlights = await Highlight.find({ user: userId }).populate('stories');
      res.json({ success: true, highlights });
    } catch (error) {
      console.error('Get highlights error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  addStoryToHighlight: async (req, res) => {
    try {
      const { highlightId } = req.params;
      const { storyId } = req.body;

      const highlight = await Highlight.findById(highlightId);
      if (!highlight) return res.status(404).json({ success: false, message: 'Highlight not found' });
      if (highlight.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

      if (!highlight.stories.map(String).includes(storyId)) {
        highlight.stories.push(storyId);
        await highlight.save();
      }

      res.json({ success: true, highlight });
    } catch (error) {
      console.error('Add story to highlight error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  removeStoryFromHighlight: async (req, res) => {
    try {
      const { highlightId } = req.params;
      const { storyId } = req.body;

      const highlight = await Highlight.findById(highlightId);
      if (!highlight) return res.status(404).json({ success: false, message: 'Highlight not found' });
      if (highlight.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

      highlight.stories = highlight.stories.filter(s => s.toString() !== storyId);
      await highlight.save();

      res.json({ success: true, highlight });
    } catch (error) {
      console.error('Remove story from highlight error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = storyController;

// Attach socket instance setter and start cleanup job when provided
storyController.setSocketInstance = (io) => {
  ioInstance = io;

  // Start periodic cleanup job to remove expired stories and their cloud assets
  if (!cleanupInterval) {
    cleanupInterval = setInterval(async () => {
      try {
        const now = new Date();
        // Find expired stories
        const expired = await Story.find({ expiresAt: { $lte: now } });
        for (const s of expired) {
          try {
            if (s.publicId) {
              // Attempt to destroy resource on Cloudinary
              await cloudinary.uploader.destroy(s.publicId, { resource_type: 'auto' });
            }
          } catch (err) {
            console.error('Error deleting cloudinary asset for story', s._id, err);
          }
          // Remove document (TTL might also remove it; we proactively remove to free up storage)
          await Story.findByIdAndDelete(s._id);
        }
      } catch (err) {
        console.error('Story cleanup job error:', err);
      }
    }, 1000 * 60 * 60); // every hour
  }
};
