const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['like', 'comment', 'follow', 'join_room'] 
  },
  user: { type: String, required: true }, // User who initiated the activity
  targetId: { type: String, required: true }, // Post ID, Username, or Room ID
  totalBots: { type: Number, required: true },
  successCount: { type: Number, required: true },
  failedCount: { type: Number, required: true },
  details: { type: mongoose.Schema.Types.Mixed } // Additional data like comments, errors, etc.
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);