const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoLike.Controller');

router.post('/', controller.likePost);

module.exports = router;
