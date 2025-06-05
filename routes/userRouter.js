const express = require("express");
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();
// routes

router.post(`/signup`, authController.signup);
router.post(`/login`, authController.login);
router.route(`/forgotPassword`).post(authController.forgotPassword);
router.route(`/resetPassword/:token`).patch(authController.resetPassword);
router.use(authController.protect);

router.get("/checkUsername/:username", userController.isUsernameGood);
router.patch("/updateMe", userController.updateMe);

router.get(
  "/me",
  userController.getMe,
  userController.getUser
);

// Get user's usage and limits
router.get("/usage", require('../middleware/planLimits').getCurrentUsage);

// Upgrade user plan
router.post("/upgrade-plan", userController.upgradeToPremium);

router.patch(
  "/updateMyPassword",
  authController.updatePassword
);
router.post("/logout", authController.logout);

// Admin-only routes
router.use(authController.restrictTo("admin"));
router.patch("/update-user-plan", userController.updateUserPlan);

module.exports = router;
