const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.post('/', accountController.addAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);
router.post('/refresh/:id', accountController.refreshLogin); 
router.post('/refresh-all', accountController.refreshAllAccounts);
module.exports = router;
