const Account = require('../models/accountModel');
const { sendComment } = require('../utils/imvu.util');

async function autoCommentAllAccounts(postId) {
  const accounts = await Account.find();
  const results = [];

  for (const account of accounts) {
    try {
      const { response, comment } = await sendComment(postId, account.osCsid, account.xImvuSauce);
      results.push({ email: account.email, status: 'commented', comment });
    } catch (error) {
      results.push({
        email: account.email,
        status: 'failed',
        reason: error.response?.statusText || error.message,
      });
    }
  }

  return results;
}

module.exports = {
  autoCommentAllAccounts,
};
