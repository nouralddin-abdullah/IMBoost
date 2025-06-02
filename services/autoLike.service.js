const Account = require('../models/accountModel');
const { sendLike } = require('../utils/imvu.util');

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

  return results;
}

module.exports = {
  autoLikeAllAccounts,
};
