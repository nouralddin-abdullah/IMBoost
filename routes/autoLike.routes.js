const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoLike.Controller');
const authController = require('../controllers/authController');
const { checkDailyLimit } = require('../middleware/planLimits');

// Apply authentication to all routes
router.use(authController.protect);

// Apply daily limit check for likes
router.post('/', checkDailyLimit('like'), controller.likePost);

module.exports = router;
