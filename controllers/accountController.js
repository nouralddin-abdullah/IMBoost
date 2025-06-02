const axios = require('axios');
const Account = require('../models/accountModel');

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


module.exports = {
  addAccount,
  updateAccount,
  deleteAccount,
  refreshLogin,
  refreshAllAccounts
};
