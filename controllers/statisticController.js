const Statistics = require('../models/statisticModel');
const Activity = require('../models/activityModel');

// Get global statistics
async function getGlobalStatistics(req, res) {
  try {
    const stats = await Statistics.getInstance();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get recent activities with time formatting
async function getRecentActivities(req, res) {
  try {
    const { limit = 20 } = req.query;
    
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const formattedActivities = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.createdAt);
      
      return {
        _id: activity._id,
        type: activity.type,
        user: activity.user,
        targetId: activity.targetId,
        totalBots: activity.totalBots,
        successCount: activity.successCount,
        failedCount: activity.failedCount,
        timeAgo,
        createdAt: activity.createdAt,
        details: activity.details
      };
    });

    res.json({
      activities: formattedActivities,
      total: await Activity.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // difference in seconds

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2629746) return `${Math.floor(diff / 604800)} weeks ago`;
  return `${Math.floor(diff / 2629746)} months ago`;
}

// Update statistics (used internally by other services)
async function updateStatistics(type, count) {
  try {
    const stats = await Statistics.getInstance();
    
    switch (type) {
      case 'like':
        stats.totalLikes += count;
        break;
      case 'comment':
        stats.totalComments += count;
        break;
      case 'follow':
        stats.totalFollows += count;
        break;
    }
    
    await stats.save();
    return stats;
  } catch (error) {
    throw new Error(`Failed to update statistics: ${error.message}`);
  }
}

// Log activity (used internally by other services)
async function logActivity(type, user, targetId, results, details = {}) {
  try {
    const successCount = results.filter(r => r.status === 'liked' || r.status === 'commented' || r.status === 'followed' || r.status === 'joined').length;
    const failedCount = results.length - successCount;
    
    const activity = new Activity({
      type,
      user,
      targetId,
      totalBots: results.length,
      successCount,
      failedCount,
      details
    });
    
    await activity.save();
    
    // Update global statistics
    await updateStatistics(type, successCount);
    
    return activity;
  } catch (error) {
    throw new Error(`Failed to log activity: ${error.message}`);
  }
}

// Reset statistics (admin function)
async function resetStatistics(req, res) {
  try {
    const stats = await Statistics.getInstance();
    stats.totalLikes = 0;
    stats.totalComments = 0;
    stats.totalFollows = 0;
    await stats.save();
    
    res.json({ message: 'Statistics reset successfully', stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get statistics by date range
async function getStatisticsByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const activities = await Activity.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
    
    const stats = {
      totalLikes: activities.filter(a => a.type === 'like').reduce((sum, a) => sum + a.successCount, 0),
      totalComments: activities.filter(a => a.type === 'comment').reduce((sum, a) => sum + a.successCount, 0),
      totalFollows: activities.filter(a => a.type === 'follow').reduce((sum, a) => sum + a.successCount, 0),
      totalJoins: activities.filter(a => a.type === 'join_room').reduce((sum, a) => sum + a.successCount, 0),
      totalActivities: activities.length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getGlobalStatistics,
  getRecentActivities,
  resetStatistics,
  getStatisticsByDateRange,
  updateStatistics,
  logActivity
};