const express = require('express');
const router = express.Router();
const imvuController = require('../controllers/autoFollowController');
const authController = require('../controllers/authController');
const { checkDailyLimit } = require('../middleware/planLimits');

// Apply authentication to all routes
router.use(authController.protect);

// Apply daily limit check for follows
router.post('/', checkDailyLimit('follow'), imvuController.autoFollowUser);

module.exports = router;