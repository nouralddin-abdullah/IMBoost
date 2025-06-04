const Account = require('../models/accountModel');
const { sendLike } = require('../utils/imvu.util');
const { logActivity } = require('../controllers/statisticController');

async function autoLikeAllAccounts(postId) {
  const accounts = await Account.find();
  const results = [];

  for (const account of accounts) {
    try {
      const result = await sendLike(postId, account.osCsid, account.xImvuSauce);
      results.push({ email: account.email, status: 'liked' });
    } catch (error) {
      results.push({ email: account.email, status: 'failed', reason: error.message });
    }
  }

  // Log activity
  await logActivity('like', user, postId, results);

  return results;
}

module.exports = {
  autoLikeAllAccounts,
};
