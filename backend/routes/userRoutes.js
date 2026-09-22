const express = require('express');
const userController = require('../controller/userController'); // Ensure the path is correct
const router = express.Router();
const upload = require('../config/multerConfig'); // Import multer configuration


// User routes
// router.get('/', userController.getAllUsers); // Fetch all users
router.post('/signup', userController.addUser);   // Add a new user (Signup)
router.post('/update-accountdetails', userController.updateAccountDetails);   // Add a new user (Signup)
router.post('/update-profile', userController.updateProfileController);   // Add a new user (Signup)
router.post('/create-transaction', upload.single('image'), userController.createTransaction);
router.post('/create-transaction-id', userController.createTransactionById);
router.post('/create-withdrawal-transaction', upload.none(), userController.createWithdrawalTransactionBy);
router.post('/create-wallet-withdrawal', userController.createWalletWithdrawal);
router.post('/create-new-deposit-transaction', userController.createNewDepositTransaction);
router.post('/create-id', userController.createId); // Add a new website record
router.post('/create-id-request', userController.createIdRequest); // Create ID request with coin conversion
router.post('/close-id', userController.closeId); // Close an ID
router.post('/request-close-id', userController.closeId); // Request to close an ID (same as close-id)
router.get('/id-transactions', userController.getIdTransactions); // Get transactions for specific ID
router.post('/request-password-change', userController.requestPasswordChange); // Request password change

router.post('/get-user', userController.getUserByUsername); // Add a new website record
router.post('/change-id-password', userController.changeIdPassword); // Add a new website record

router.get('/get-accountdetails-deposit', userController.getAccountDetailsDeposit); // Add a new website record
router.get('/get-accountdetails', userController.getAccountDetails); // Add a new website record
router.get('/deposit-transaction', userController.getDepositTransactions);
// id routes
router.get('/get-all-ids', userController.getAllIds); // Add a new website record
router.get('/get-id-requests', userController.getUserIdRequests); // Get user's ID requests
// Route to get user balance
router.get('/get-balance/:userId', userController.getBalanceController);
router.get('/get-id-balance/:id', userController.getIdBalanceController);
router.get('/hello', userController.getHelloController);


module.exports = router;
