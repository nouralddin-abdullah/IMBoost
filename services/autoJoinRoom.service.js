const Account = require('../models/accountModel');
const { joinRoom } = require('../utils/imvu.util');
const { logActivity } = require('../controllers/statisticController');

async function autoJoinRoom(roomId, numberOfAccounts, user = null) {
  if (!roomId) throw new Error('Room ID is required');
  if (!numberOfAccounts || numberOfAccounts <= 0) throw new Error('Number of accounts must be greater than 0');

  // Get accounts that have authentication data
  const accounts = await Account.find({
    xImvuSauce: { $exists: true, $ne: null },
    osCsid: { $exists: true, $ne: null }
  }).limit(numberOfAccounts);

  if (accounts.length === 0) {
    throw new Error('No accounts with valid authentication found');
  }

  const results = [];

  for (const account of accounts) {
    try {
      await joinRoom(roomId, account.osCsid, account.xImvuSauce);
      results.push({ email: account.email, status: 'joined' });
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
  await logActivity('join', userIdentifier, roomId, results);

  return results;
}

module.exports = {
  autoJoinRoom,
};
