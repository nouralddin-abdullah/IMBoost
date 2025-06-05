const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoComment.controller');
const authController = require('../controllers/authController');
const { checkDailyLimit } = require('../middleware/planLimits');

// Apply authentication to all routes
router.use(authController.protect);

// Apply daily limit check for comments
router.post('/', checkDailyLimit('comment'), controller.commentPost);

module.exports = router;
