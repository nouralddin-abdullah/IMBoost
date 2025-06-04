const express = require('express');
const router = express.Router();
const imvuController = require('../controllers/autoFollowController');
const authController = require('../controllers/authController');

// Apply authentication to all routes
router.use(authController.protect);

router.post('/', imvuController.autoFollowUser);

module.exports = router;