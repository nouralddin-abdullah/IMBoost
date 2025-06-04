const { autoLikeAllAccounts } = require('../services/autoLike.service');

async function likePost(req, res) {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    const results = await autoLikeAllAccounts(postId, req.user);
    res.json({ message: 'Auto like completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  likePost,
};
