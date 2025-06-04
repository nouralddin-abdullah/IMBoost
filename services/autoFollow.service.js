const axios = require('axios');
const Account = require('../models/accountModel');
const { logActivity } = require('../controllers/statisticController');

async function autoFollow(usernameToFollow, user = null) {
  if (!usernameToFollow) throw new Error('Username to follow is required');

  // Step 1: Get legacy CID of the target user
  const userInfoRes = await axios.get(`https://api.imvu.com/user?username=${usernameToFollow}`);
  const userItems = userInfoRes.data?.denormalized?.[`https://api.imvu.com/user?username=${usernameToFollow}`]?.data?.items;

  if (!userItems || userItems.length === 0) {
    throw new Error('User not found or invalid response structure');
  }

  const profileKey = userItems[0];
  const legacyCid = userInfoRes.data?.denormalized?.[profileKey]?.data?.legacy_cid;

  if (!legacyCid) throw new Error('Legacy CID not found');

  // Step 2: Loop through bot accounts
  const accounts = await Account.find();
  const results = [];

  for (const account of accounts) {
    try {
      if (!account.cid || !account.xImvuSauce || !account.osCsid) {
        results.push({ email: account.email, status: 'skipped', reason: 'Missing cid or auth headers' });
        continue;
      }

      const url = `https://api.imvu.com/profile/profile-user-${account.cid}/subscriptions?limit=50`;
      const body = {
        id: `https://api.imvu.com/profile/profile-user-${legacyCid}`
      };

      await axios.post(url, body, {
        headers: {
          'x-imvu-sauce': account.xImvuSauce,
          'Cookie': `osCsid=${account.osCsid}`,
          'Content-Type': 'application/json'
        }
      });

      results.push({ email: account.email, status: 'followed' });

    } catch (error) {
      results.push({ email: account.email, status: 'failed', reason: error.message });
    }
  }

  // Log activity with user info (email or 'system' if no user)
  const userIdentifier = user ? user.email : 'system';
  await logActivity('follow', userIdentifier, usernameToFollow, results);

  return results;
}

module.exports = autoFollow;
