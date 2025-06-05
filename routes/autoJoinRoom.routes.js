const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoJoinRoom.controller');
const authController = require('../controllers/authController');
const { checkDailyLimit } = require('../middleware/planLimits');

router.use(authController.protect);

// Apply daily limit check for room joins
router.post('/', checkDailyLimit('join'), controller.joinRoomWithAccounts);

module.exports = router;
