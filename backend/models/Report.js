const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'InstaUser', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'InstaUser' },
  targetPost: { type: mongoose.Schema.Types.ObjectId, ref: 'InstaPost' },
  reason: { type: String, trim: true },
  details: { type: String },
  status: { type: String, enum: ['open', 'reviewed', 'dismissed', 'actioned'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('InstaReport', reportSchema);