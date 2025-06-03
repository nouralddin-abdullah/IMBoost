const express = require('express');
const router = express.Router();
const imvuController = require('../controllers/autoFollowController');

router.post('/', imvuController.autoFollowUser);

module.exports = router;