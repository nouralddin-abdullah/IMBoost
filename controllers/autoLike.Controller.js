const { autoLikeAllAccounts } = require('../services/autoLike.service');
const { incrementDailyUsage } = require('../middleware/planLimits');

async function likePost(req, res) {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    const results = await autoLikeAllAccounts(postId, req.user);
    
    // Increment daily usage counter
    if (req.dailyUsage) {
      await incrementDailyUsage(req.dailyUsage, 'like');
    }
    
    res.json({ message: 'Auto like completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  likePost,
};
