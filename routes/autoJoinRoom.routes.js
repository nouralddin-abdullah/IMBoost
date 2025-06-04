const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoJoinRoom.controller');

router.post('/', controller.joinRoomWithAccounts);

module.exports = router;
