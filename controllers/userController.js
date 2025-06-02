const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const sharp = require("sharp");
const appError = require("../utils/appError");
const Course = require("../models/courseModel");
const storage = multer.memoryStorage({});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const uploadImage = multer({ storage, fileFilter });
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.username = req.user.username;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { user } = req;

  // Select fields to exclude sensitive information
  const selectFields =
    "-passwordResetToken -passwordResetTokenExpires -passwordChangedAt";

  // Build the query
  let query = User.findOne({ username }).select(selectFields);

  const targetUser = await query;

  if (!targetUser) {
    return next(new AppError("There's no document with this username", 404));
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
  const filteredBody = filterObj(req.body, "username", "email");

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

  const user = await User.findOne({ username: username });

  if (user) return next(new AppError("username taken", 400));

  res.status(200).json({
    status: "success",
    message: "username available",
  });
});
