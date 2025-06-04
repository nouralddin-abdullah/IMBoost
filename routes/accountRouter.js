const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const authController = require("../controllers/authController");
router.use(authController.restrictTo("admin"));

router.post("/", accountController.addAccount);
router.delete("/:id", accountController.deleteAccount);
router.put("/:id", accountController.updateAccount);
router.post("/refresh/:id", accountController.refreshLogin);
router.post("/refresh-all", accountController.refreshAllAccounts);
router.post("/change-images", accountController.changeAccountImages);

module.exports = router;
