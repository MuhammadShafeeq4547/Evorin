const mongoose = require('mongoose');
const { Schema } = mongoose;

const highlightSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  coverUrl: { type: String },
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Highlight', highlightSchema);
