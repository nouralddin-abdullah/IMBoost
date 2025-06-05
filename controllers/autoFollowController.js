const autoFollow = require('../services/autoFollow.service');
const { incrementDailyUsage } = require('../middleware/planLimits');

exports.autoFollowUser = async (req, res) => {
  const { usernameToFollow } = req.body;

  try {
    const results = await autoFollow(usernameToFollow, req.user);
    
    // Increment daily usage counter
    if (req.dailyUsage) {
      await incrementDailyUsage(req.dailyUsage, 'follow');
    }
    
    res.json({ message: `Auto-follow completed for '${usernameToFollow}'`, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
