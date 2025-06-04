const autoFollow = require('../services/autoFollow.service');

exports.autoFollowUser = async (req, res) => {
  const { usernameToFollow } = req.body;

  try {
    const results = await autoFollow(usernameToFollow, req.user);
    res.json({ message: `Auto-follow completed for '${usernameToFollow}'`, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
