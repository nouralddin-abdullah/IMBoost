const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoJoinRoom.controller');
const authController = require('../controllers/authController');

// Apply authentication to all routes
router.use(authController.protect);

router.post('/', controller.joinRoomWithAccounts);

module.exports = router;
