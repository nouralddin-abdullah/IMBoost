const express = require("express");
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();
// routes

router.post(`/signup`, authController.signup);

router.get("/checkUsername/:username", userController.isUsernameGood);
router.patch("/updateMe", authController.protect, userController.updateMe);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.post(`/login`, authController.login);
router.post("/logout", authController.protect, authController.logout);
router.route(`/forgotPassword`).post(authController.forgotPassword);
router.route(`/resetPassword/:token`).patch(authController.resetPassword);

module.exports = router;
