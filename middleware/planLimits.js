const DailyUsage = require('../models/dailyUsageModel');
const Account = require('../models/accountModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Plan limits configuration
const PLAN_LIMITS = {
  basic: {
    maxAccountsPerOperation: 30, // Maximum 30 accounts used per bulk operation
    maxAccounts: Infinity, // No limit on total accounts
    dailyLimits: {
      like: 1,
      comment: 1,
      follow: 1,
      join: 1  // Room joins per day
    }
  },
  premium: {
    maxAccountsPerOperation: Infinity, // Unlimited accounts used per bulk operation
    maxAccounts: Infinity, // No limit on total accounts
    dailyLimits: {
      like: Infinity,
      comment: Infinity,
      follow: Infinity,
      join: Infinity  // Room joins per day
    }
  }
};

// Middleware to check daily limits
const checkDailyLimit = (actionType) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user;
    const userPlan = user.Plan || 'basic';
    
    // Get today's usage
    const dailyUsage = await DailyUsage.getTodayUsage(user._id);
      // Check if user can perform this action
    if (!dailyUsage.canPerformAction(actionType, userPlan)) {
      // Check if the userPlan exists in PLAN_LIMITS, default to basic if not
      const planConfig = PLAN_LIMITS[userPlan] || PLAN_LIMITS['basic'];
      const limits = planConfig.dailyLimits;
      return next(new AppError(
        `Daily limit reached. ${userPlan} plan allows ${limits[actionType]} ${actionType}${limits[actionType] === 1 ? '' : 's'} bulk per day.`,
        429
      ));
    }
    
    // Store usage in request for later increment
    req.dailyUsage = dailyUsage;
    req.actionType = actionType;
    
    next();
  });
};

// Middleware to check account limits for operations
const checkAccountLimit = catchAsync(async (req, res, next) => {
  // Note: This middleware is no longer needed as account limits per operation
  // are now applied in each service function at runtime. It is retained for 
  // backwards compatibility but simply passes through.
  next();
});

// Function to increment usage after successful action
const incrementDailyUsage = async (dailyUsage, actionType) => {
  if (dailyUsage && actionType) {
    await dailyUsage.incrementUsage(actionType);
  }
};

// Get current usage for a user
const getCurrentUsage = catchAsync(async (req, res, next) => {
  const user = req.user;
  const userPlan = user.Plan || 'basic';
  
  const dailyUsage = await DailyUsage.getTodayUsage(user._id);
  const accountCount = await Account.countDocuments();
  
  // Check if the userPlan exists in PLAN_LIMITS, default to basic if not
  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS['basic'];
    res.json({
    status: 'success',
    data: {
      plan: userPlan,      dailyUsage: {
        likes: {
          used: dailyUsage.likesUsed,
          limit: limits.dailyLimits.like,
          remaining: limits.dailyLimits.like === Infinity ? 'unlimited' : limits.dailyLimits.like - dailyUsage.likesUsed
        },
        comments: {
          used: dailyUsage.commentsUsed,
          limit: limits.dailyLimits.comment,
          remaining: limits.dailyLimits.comment === Infinity ? 'unlimited' : limits.dailyLimits.comment - dailyUsage.commentsUsed
        },
        follows: {
          used: dailyUsage.followsUsed,
          limit: limits.dailyLimits.follow,
          remaining: limits.dailyLimits.follow === Infinity ? 'unlimited' : limits.dailyLimits.follow - dailyUsage.followsUsed
        },
        roomJoins: {
          used: dailyUsage.joinRoomsUsed || 0,
          limit: limits.dailyLimits.join,
          remaining: limits.dailyLimits.join === Infinity ? 'unlimited' : limits.dailyLimits.join - (dailyUsage.joinRoomsUsed || 0)
        }
      },accounts: {
        total: accountCount,
        perOperation: {
          limit: limits.maxAccountsPerOperation,
          description: limits.maxAccountsPerOperation === Infinity ? 'unlimited' : `maximum ${limits.maxAccountsPerOperation} accounts per operation`
        }
      },
      lastActivity: dailyUsage.lastActionTime || dailyUsage.createdAt
    }
  });
});

module.exports = {
  checkDailyLimit,
  checkAccountLimit,
  incrementDailyUsage,
  getCurrentUsage,
  PLAN_LIMITS
};
