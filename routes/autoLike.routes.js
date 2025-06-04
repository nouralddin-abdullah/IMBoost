const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoLike.Controller');
const authController = require('../controllers/authController');

// Apply authentication to all routes
router.use(authController.protect);

router.post('/', controller.likePost);

module.exports = router;
