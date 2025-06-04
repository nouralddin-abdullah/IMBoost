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

router.patch(
  "/updateMyPassword",

  authController.updatePassword
);
router.post("/logout", authController.logout);

module.exports = router;
