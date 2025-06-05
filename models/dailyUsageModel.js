const mongoose = require('mongoose');

const dailyUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: function() {
      // Set to start of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  likesUsed: {
    type: Number,
    default: 0
  },
  commentsUsed: {
    type: Number,
    default: 0
  },
  followsUsed: {
    type: Number,
    default: 0
  },
  joinRoomsUsed: {
    type: Number,
    default: 0
  },
  // Track when the last usage was recorded
  lastActionTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one record per user per day
dailyUsageSchema.index({ user: 1, date: 1 }, { unique: true });

// Static method to get or create today's usage for a user
dailyUsageSchema.statics.getTodayUsage = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let usage = await this.findOne({ user: userId, date: today });
  
  if (!usage) {
    usage = await this.create({ user: userId, date: today });
  }
  
  return usage;
};

// Method to check if user can perform action
dailyUsageSchema.methods.canPerformAction = function(actionType, userPlan) {
  const limits = {
    basic: {
      like: 1,
      comment: 1,
      follow: 1,
      join: 1
    },
    premium: {
      like: Infinity,
      comment: Infinity,
      follow: Infinity,
      join: Infinity
    }
  };
  
  const planLimits = limits[userPlan] || limits.basic;
    switch(actionType) {
    case 'like':
      return this.likesUsed < planLimits.like;
    case 'comment':
      return this.commentsUsed < planLimits.comment;
    case 'follow':
      return this.followsUsed < planLimits.follow;
    case 'join':
      return this.joinRoomsUsed < planLimits.join;
    default:
      return false;
  }
};

// Method to increment usage
dailyUsageSchema.methods.incrementUsage = async function(actionType) {
  switch(actionType) {
    case 'like':
      this.likesUsed += 1;
      break;
    case 'comment':
      this.commentsUsed += 1;
      break;
    case 'follow':
      this.followsUsed += 1;
      break;
    case 'join':
      this.joinRoomsUsed += 1;
      break;
  }
  
  // Update last action time
  this.lastActionTime = Date.now();
  
  await this.save();
  return this;
};

module.exports = mongoose.model('DailyUsage', dailyUsageSchema);
