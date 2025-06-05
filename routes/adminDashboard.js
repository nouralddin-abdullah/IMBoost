const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const DailyUsage = require('../models/dailyUsageModel');
const Account = require('../models/accountModel');
const catchAsync = require('../utils/catchAsync');
const { PLAN_LIMITS } = require('../middleware/planLimits');
const authController = require('../controllers/authController');

// Ensure admin authentication for all routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Get all users with their plans
router.get('/users', catchAsync(async (req, res) => {
  const users = await User.find().select('firstName lastName email Plan createdAt');
  
  res.json({
    status: 'success',
    results: users.length,
    data: { users }
  });
}));

// Get detailed usage for a specific user
router.get('/user-usage/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId).select('firstName lastName email Plan');
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyUsage = await DailyUsage.findOne({ user: userId, date: today }) || {
    likesUsed: 0,
    commentsUsed: 0,
    followsUsed: 0,
    joinRoomsUsed: 0,
    lastActionTime: null
  };
  
  const limits = PLAN_LIMITS[user.Plan] || PLAN_LIMITS.basic;
  
  res.json({
    status: 'success',
    data: {
      user,
      plan: user.Plan,
      limits,
      dailyUsage: {
        likesUsed: dailyUsage.likesUsed || 0,
        commentsUsed: dailyUsage.commentsUsed || 0,
        followsUsed: dailyUsage.followsUsed || 0,
        joinRoomsUsed: dailyUsage.joinRoomsUsed || 0,
        lastActionTime: dailyUsage.lastActionTime
      }
    }
  });
}));

// Get overall plan statistics
router.get('/plan-stats', catchAsync(async (req, res) => {
  const basicPlanCount = await User.countDocuments({ Plan: 'basic' });
  const premiumPlanCount = await User.countDocuments({ Plan: 'premium' });
  const totalUsers = await User.countDocuments();
  
  const todaysActivityCount = await DailyUsage.countDocuments({
    date: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });
  
  const totalAccounts = await Account.countDocuments();
  
  res.json({
    status: 'success',
    data: {
      userCounts: {
        total: totalUsers,
        basicPlan: basicPlanCount,
        premiumPlan: premiumPlanCount
      },
      accountsTotal: totalAccounts,
      todaysActiveUsers: todaysActivityCount
    }
  });
}));

module.exports = router;
