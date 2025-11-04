const mongoose = require('mongoose');
const { Schema } = mongoose;

const storySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'InstaUser', required: true, index: true },
  mediaUrl: { type: String, required: true },
  publicId: { type: String },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  viewers: [{ type: Schema.Types.ObjectId, ref: 'InstaUser' }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL index on expiresAt to auto-delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
