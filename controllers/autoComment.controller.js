const { autoCommentAllAccounts } = require('../services/autoComment.service');

async function commentPost(req, res) {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    const results = await autoCommentAllAccounts(postId, req.user);
    res.json({ message: 'Auto comment completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  commentPost,
};
