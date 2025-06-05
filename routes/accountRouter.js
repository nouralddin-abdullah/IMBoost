const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const authController = require("../controllers/authController");
const { checkAccountLimit } = require("../middleware/planLimits");

router.use(authController.protect);
router.use(authController.restrictTo("admin"));

// Check account limit before adding new account
router.post("/", checkAccountLimit, accountController.addAccount);
router.delete("/:id", accountController.deleteAccount);
router.put("/:id", accountController.updateAccount);
router.post("/refresh/:id", accountController.refreshLogin);
router.post("/refresh-all", accountController.refreshAllAccounts);
router.post("/change-images", accountController.changeAccountImages);

module.exports = router;
