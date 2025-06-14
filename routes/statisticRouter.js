const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticController');
const authController = require('../controllers/authController');


// Get global statistics
router.get('/', statisticsController.getGlobalStatistics);

// Get recent activities
router.get('/activities', statisticsController.getRecentActivities);

// Get statistics by date range
router.get('/date-range', statisticsController.getStatisticsByDateRange);

// Reset statistics (admin function)
router.post('/reset', authController.restrictTo('admin'), statisticsController.resetStatistics);

module.exports = router;