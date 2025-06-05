const { autoCommentAllAccounts } = require('../services/autoComment.service');
const { incrementDailyUsage } = require('../middleware/planLimits');

async function commentPost(req, res) {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    const results = await autoCommentAllAccounts(postId, req.user);
    
    // Increment daily usage counter
    if (req.dailyUsage) {
      await incrementDailyUsage(req.dailyUsage, 'comment');
    }
    
    res.json({ message: 'Auto comment completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  commentPost,
};
