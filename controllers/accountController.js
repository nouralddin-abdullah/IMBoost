const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Account = require('../models/accountModel');
const { getRandomImageBase64, uploadImage, updateProfileImage } = require('../utils/imvu.util');

async function loginAndUpdate(accountId) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found');

  const response = await axios.post('https://api.imvu.com/login', {
    username: account.email,
    password: account.password,
    gdpr_cookie_acceptance: false
  }, { withCredentials: true });

  const sauce = response.data?.denormalized?.[response.data.id]?.data?.sauce;
  const osCsid = response.headers['set-cookie']?.find(cookie => cookie.startsWith('osCsid='))?.split(';')[0].split('=')[1];

  account.xImvuSauce = sauce;
  account.osCsid = osCsid;
  await account.save();

  return account;
}

async function addAccount(req, res) {
  try {
    const newAccount = new Account(req.body);
    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateAccount(req, res) {
  try {
    const updated = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteAccount(req, res) {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function refreshLogin(req, res) {
  try {
    const updatedAccount = await loginAndUpdate(req.params.id);
    res.json(updatedAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function refreshAllAccounts(req, res) {
  try {
    const accounts = await Account.find();
    const results = [];

    for (const account of accounts) {
      try {
        // Step 1: Login to get xImvuSauce and osCsid
        const loginResponse = await axios.post('https://api.imvu.com/login', {
          username: account.email,
          password: account.password,
          gdpr_cookie_acceptance: false
        }, { withCredentials: true });

        const sauce = loginResponse.data?.denormalized?.[loginResponse.data.id]?.data?.sauce;
        const osCsid = loginResponse.headers['set-cookie']?.find(cookie => cookie.startsWith('osCsid='))?.split(';')[0]?.split('=')[1];

        account.xImvuSauce = sauce;
        account.osCsid = osCsid;

        // Step 2: Get CID using the account's username
        if (account.username) {
          const userInfoResponse = await axios.get(`https://api.imvu.com/user?username=${account.username}`);

          const userItems = userInfoResponse.data?.denormalized?.[`https://api.imvu.com/user?username=${account.username}`]?.data?.items;

          if (userItems && userItems.length > 0) {
            const userProfileKey = userItems[0];
            const cid = userInfoResponse.data?.denormalized?.[userProfileKey]?.data?.legacy_cid;
            if (cid) account.cid = cid;
          }
        }

        await account.save();

        results.push({ email: account.email, status: 'updated' });

      } catch (error) {
        results.push({ email: account.email, status: 'failed', reason: error.message });
      }
    }

    res.json({ message: 'Accounts refreshed', results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function changeAccountImages(req, res) {
  try {
    const accounts = await Account.find({ hasImage: false });
    const results = [];

    for (const account of accounts) {
      try {
        // Skip accounts without required authentication data or CID
        if (!account.xImvuSauce || !account.osCsid || !account.cid) {
          results.push({ 
            email: account.email, 
            status: 'skipped', 
            reason: 'Missing authentication data or CID' 
          });
          continue;
        }

        console.log(`Processing account: ${account.email}`);
        console.log(`CID: ${account.cid}, Has sauce: ${!!account.xImvuSauce}, Has osCsid: ${!!account.osCsid}`);

        // Step 1: Get a random image base64
        const imageBase64 = getRandomImageBase64();
        console.log(`Got image base64, length: ${imageBase64.length}`);

        // Step 2: Upload the image to IMVU
        let uploadResponse;
        try {
          console.log(`Attempting to upload image for ${account.email}`);
          uploadResponse = await uploadImage(imageBase64, account.osCsid, account.xImvuSauce);
          console.log(`Upload successful for ${account.email}:`, uploadResponse);
        } catch (uploadError) {
          console.log(`Upload failed for ${account.email}:`, uploadError.response?.status, uploadError.response?.statusText, uploadError.response?.data);
          results.push({ 
            email: account.email, 
            status: 'failed', 
            step: 'upload',
            reason: `Upload failed: ${uploadError.response?.status} ${uploadError.response?.statusText}`,
            details: uploadError.response?.data
          });
          continue;
        }
        
        // Extract the photo URL from the upload response
        const photoUrl = uploadResponse.id;
        console.log(`Photo URL for ${account.email}: ${photoUrl}`);

        // Step 3: Update the profile image
        try {
          console.log(`Attempting to update profile image for ${account.email}`);
          await updateProfileImage(account.cid, photoUrl, account.osCsid, account.xImvuSauce);
          console.log(`Profile update successful for ${account.email}`);
        } catch (profileError) {
          console.log(`Profile update failed for ${account.email}:`, profileError.response?.status, profileError.response?.statusText, profileError.response?.data);
          results.push({ 
            email: account.email, 
            status: 'failed', 
            step: 'profile_update',
            reason: `Profile update failed: ${profileError.response?.status} ${profileError.response?.statusText}`,
            details: profileError.response?.data
          });
          continue;
        }

        // Step 4: Update the account to mark it as having an image
        account.hasImage = true;
        await account.save();

        results.push({ 
          email: account.email, 
          status: 'success', 
          photoUrl: photoUrl 
        });

      } catch (error) {
        console.log(`General error for ${account.email}:`, error);
        results.push({ 
          email: account.email, 
          status: 'failed', 
          reason: error.response?.statusText || error.message,
          details: error.response?.data || error.stack
        });
      }
    }

    res.json({ 
      message: 'Image change process completed', 
      results,
      totalProcessed: accounts.length,
      successful: results.filter(r => r.status === 'success').length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  addAccount,
  updateAccount,
  deleteAccount,
  refreshLogin,
  refreshAllAccounts,
  changeAccountImages
};
