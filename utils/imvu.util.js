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

/**
 * Gets a random base64 image from the output_base64.txt file
 */
function getRandomImageBase64() {
  const filePath = path.join(__dirname, '../output_base64.txt');
  const images = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Uploads an image to IMVU and returns the photo URL
 * @param {string} imageBase64 The base64 encoded image
 * @param {string} osCsid The osCsid cookie value
 * @param {string} xImvuSauce The x-imvu-sauce header
 */
async function uploadImage(imageBase64, osCsid, xImvuSauce) {
  const url = 'https://api.imvu.com/photo';

  const headers = {
    'x-imvu-sauce': xImvuSauce,
    'Cookie': `osCsid=${osCsid}`,
    'Content-Type': 'application/json',
  };

  const body = { image_base64: imageBase64 };

  console.log(`Upload URL: ${url}`);
  console.log(`Upload headers:`, headers);
  console.log(`Upload body length: ${JSON.stringify(body).length}`);

  const response = await axios.post(url, body, { headers });
  return response.data;
}

/**
 * Updates the profile image for a user
 * @param {string} cid The customer ID
 * @param {string} photoUrl The photo URL from upload response
 * @param {string} osCsid The osCsid cookie value
 * @param {string} xImvuSauce The x-imvu-sauce header
 */
async function updateProfileImage(cid, photoUrl, osCsid, xImvuSauce) {
  const url = `https://api.imvu.com/user/user-${cid}`;

  const headers = {
    'x-imvu-sauce': xImvuSauce,
    'Cookie': `osCsid=${osCsid}`,
    'Content-Type': 'application/json',
  };

  const body = { thumbnail_url: photoUrl };

  console.log(`Profile update URL: ${url}`);
  console.log(`Profile update headers:`, headers);
  console.log(`Profile update body:`, body);

  const response = await axios.post(url, body, { headers });
  return response.data;
}

module.exports = {
  sendLike,
  sendComment,
  getRandomImageBase64,
  uploadImage,
  updateProfileImage
};
