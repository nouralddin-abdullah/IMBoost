const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  totalLikes: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  totalFollows: { type: Number, default: 0 }
}, { timestamps: true });

// Singleton pattern
statisticsSchema.statics.getInstance = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = new this();
    await stats.save();
  }
  return stats;
};

module.exports = mongoose.model('Statistics', statisticsSchema);