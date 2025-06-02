const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Makes a like request to IMVU using the provided account.
 * @param {string} postId The feed element ID.
 * @param {string} osCsid The osCsid cookie value.
 * @param {string} xImvuSauce The x-imvu-sauce header.
 */
async function sendLike(postId, osCsid, xImvuSauce) {
  const url = `https://api.imvu.com/feed_element/${postId}/liked_by_profile?limit=0`;

  const headers = {
    'x-imvu-sauce': xImvuSauce,
    'Cookie': `osCsid=${osCsid}`,
  };

  const response = await axios.post(url, null, { headers });

  return response.data;
}

function getRandomComment() {
  const filePath = path.join(__dirname, './positive_comments_500.txt');
  const comments = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}

async function sendComment(postId, osCsid, xImvuSauce) {
  const url = `https://api.imvu.com/feed_element/${postId}/comments?limit=10`;

  const comment = getRandomComment();

  const headers = {
    'x-imvu-sauce': xImvuSauce,
    'Cookie': `osCsid=${osCsid}`,
    'Content-Type': 'application/json',
  };

  const body = { comment_text: comment };

  const response = await axios.post(url, body, { headers });
  return { response: response.data, comment };
}

module.exports = {
  sendLike,
  sendComment
};
