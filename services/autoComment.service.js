const Account = require('../models/accountModel');
const { sendComment } = require('../utils/imvu.util');
const { logActivity } = require('../controllers/statisticController');
const { PLAN_LIMITS } = require('../middleware/planLimits');

async function autoCommentAllAccounts(postId, user = null) {
  // Determine the account limit based on user's plan
  let accountLimit = Infinity;
  if (user) {
    const userPlan = user.Plan || 'basic';
    accountLimit = PLAN_LIMITS[userPlan].maxAccountsPerOperation;
  }
  
  // Find accounts with limit
  const accounts = await Account.find().limit(accountLimit);
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
  
  // Log activity with user info (email or 'system' if no user)
  const userIdentifier = user ? user.email : 'system';
  await logActivity('comment', userIdentifier, postId, results);

  return results;
}

module.exports = {
  autoCommentAllAccounts,
};
