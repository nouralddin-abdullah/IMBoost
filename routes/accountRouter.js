const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const authController = require("../controllers/authController");
<<<<<<< HEAD

// Apply authentication and admin restriction to all routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));
=======
>>>>>>> f09d14fbfee6cd6524ce587323c6edc4f949c754

router.post("/", accountController.addAccount);
router.delete("/:id", accountController.deleteAccount);
router.use(authController.restrictTo("admin"));
router.put("/:id", accountController.updateAccount);
router.post("/refresh/:id", accountController.refreshLogin);
router.post("/refresh-all", accountController.refreshAllAccounts);
router.post("/change-images", accountController.changeAccountImages);

module.exports = router;
