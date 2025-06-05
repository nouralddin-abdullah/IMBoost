const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

const appError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Select fields to exclude sensitive information
  const selectFields =
    "-passwordResetToken -passwordResetTokenExpires -passwordChangedAt";

  // Build the query
  let query = User.findById(id).select(selectFields);

  const targetUser = await query;

  if (!targetUser) {
    return next(new AppError("There's no user with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: targetUser,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent password updates here
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // Filter out unwanted fields
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email");

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.isUsernameGood = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ email: username });

  if (user) return next(new AppError("Email already taken", 400));

  res.status(200).json({
    status: "success",
    message: "Email available",
  });
});

// Upgrade user plan to premium
exports.upgradeToPremium = catchAsync(async (req, res, next) => {
  // In a real app, this would include payment processing
  const user = req.user;
  
  // Update user plan to premium
  user.Plan = 'premium';
  await user.save({ validateBeforeSave: true });
  
  res.status(200).json({
    status: 'success',
    message: 'Your plan has been upgraded to Premium successfully',
    data: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        Plan: user.Plan
      }
    }
  });
});

// Admin function to manage user plans
exports.updateUserPlan = catchAsync(async (req, res, next) => {
  const { userId, plan } = req.body;
  
  if (!userId || !plan) {
    return next(new AppError('User ID and plan are required', 400));
  }
  
  if (!['basic', 'premium'].includes(plan)) {
    return next(new AppError('Invalid plan type. Must be "basic" or "premium"', 400));
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  user.Plan = plan;
  await user.save({ validateBeforeSave: true });
  
  res.status(200).json({
    status: 'success',
    message: `User plan updated to ${plan}`,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        Plan: user.Plan
      }
    }
  });
});
