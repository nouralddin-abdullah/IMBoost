const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoComment.controller');

router.post('/', controller.commentPost);

module.exports = router;
