const express = require('express');
const adminController = require('../controller/adminController');
const hybridAdminController = require('../controller/hybridAdminController'); // Hybrid controller
const uploadLogo = require('../config/multerLogoUpload'); // Import multer configuration
const uploadCorousel = require('../config/multerCorusel'); // Import multer configuration

const router = express.Router();

// Admin routes
router.get('/', adminController.getAllAdmins); // Fetch all admins
router.get("/get-all-users", adminController.getAllUsers);//get all users
router.get('/get-all-accounts', adminController.getAllAccountsList); // Get unified accounts list overview
router.get('/get-all-ids', adminController.getAllIds);
router.get('/get-balance/:adminId', adminController.getAdminBalance);

// Sub-admin management routes (Superadmin only)
router.get('/subadmins', adminController.getAllSubAdmins);
router.get('/get-subadmins', adminController.getAllSubAdmins);
router.post('/subadmins', adminController.createSubAdmin);
router.put('/subadmins/:id', adminController.updateSubAdmin);
router.patch('/subadmins/:id/permissions', adminController.updateSubAdminPermissions);
router.delete('/subadmins/:id', adminController.deleteSubAdmin);

// User management from admin panel
router.post('/create-user', adminController.addAdminUser);
router.put('/users/:id', adminController.updateUser);

router.post('/signup', adminController.addAdmin);    // Add a new admin
router.patch('/update-transaction', adminController.updateTransaction); // Update transaction
router.patch('/update-id-status', adminController.updateIdStatus); // Update website status to Accepted

router.post('/update-accountdetails', adminController.updateAccountDetails);   // Add a new user (Signup)
router.get('/get-accountdetails', adminController.getAccountDetails); // Add a new website record
router.get('/get-accountdetails-deposit', adminController.getAccountDetailsDeposit); // Add a new website record
router.get('/admin-transaction', adminController.getAllTransactions);
router.get('/get-websites', adminController.getAllWebsites);

// POST route for adding a website
router.post("/add-website", uploadLogo, adminController.addWebsite);
// PUT route for updating a website
router.put("/update-website/:id", uploadLogo, adminController.updateWebsite);
router.post("/update-profile", adminController.updateProfileController);

router.get('/get/top-carousel', adminController.getAllTopCorousel);
router.get('/get/middle-carousel', adminController.getMiddleTopCorousel);
router.get('/get/bottom-carousel', adminController.getAllBottomCorousel);
router.get('/get/top-card-carousel', adminController.getAllTopCardCorousel);
router.get('/get/bottom-card-carousel', adminController.getAllBottomCardCorousel);
router.post("/upload/top-carousel", uploadCorousel.single('image'), adminController.addTopCorousel);
router.post("/upload/middle-carousel", uploadCorousel.single('image'), adminController.addMiddleCorousel);
router.post("/upload/bottom-carousel", uploadCorousel.single('image'), adminController.addBottomCorousel);
router.post("/upload/top-card-carousel", uploadCorousel.single('image'), adminController.addTopMiddleCorousel);
router.post("/upload/bottom-card-carousel", uploadCorousel.single('image'), adminController.addBottomMiddleCorousel);

// Accept ID Route
router.post("/accept-id", adminController.acceptId);
// Reject ID Route
router.post("/reject-id", adminController.rejectId);
// Update ID information (username, password, comment)
router.patch("/update-id", adminController.updateId);

router.patch('/accept-transaction/:txnId', adminController.acceptTransaction);
// Route to reject a transaction
router.patch('/reject-transaction/:txnId', adminController.rejectTransaction);

// Route to update user balance
router.patch('/update-user-balance/:id', adminController.updateUserBalance);

// Route to update user agent code
router.patch('/update-user-agent-code/:id', adminController.updateUserAgentCode);


router.delete('/delete-website/:id', adminController.deleteWebsite);
router.delete('/delete-one/topcarousel', adminController.deleteOneTopCarousel);
router.delete('/delete-one/middlecarousel', adminController.deleteOneMiddleCarousel);
router.delete('/delete-one/bottomcarousel', adminController.deleteOneBottomCarousel);
router.delete('/delete-one/top-card-carousel', adminController.deleteOneTopCardCarousel);
router.delete('/delete-one/bottom-card-carousel', adminController.deleteOneBottomCardCarousel);


// Route to delete a user by userId
router.delete('/delete-user/:userId', adminController.deleteUser);

// Route to change user password
router.post('/change-user-password', adminController.changeUserPassword);

// Get unique categories from websites
router.get('/get-website-categories', adminController.getWebsiteCategories);
// Get all categories for dropdown (combines both sources)
router.get('/get-all-categories', adminController.getAllCategoriesForDropdown);
// Remove a category from all websites
router.post('/remove-category', adminController.removeCategoryFromWebsites);
// Add a new category
router.post('/add-category', adminController.addCategory);

// ===== REQUEST HANDLING ROUTES =====
// Get all pending requests
router.get('/pending-requests', adminController.getAllPendingRequests);

// Deposit request handling
router.patch('/approve-deposit/:requestId', adminController.approveDepositRequest);
router.patch('/reject-deposit/:requestId', adminController.rejectDepositRequest);

// Withdrawal request handling
router.patch('/approve-withdrawal/:requestId', adminController.approveWithdrawalRequest);
router.patch('/reject-withdrawal/:requestId', adminController.rejectWithdrawalRequest);

// Close ID request handling
router.patch('/approve-close-id/:requestId', adminController.approveCloseIdRequest);
router.patch('/reject-close-id/:requestId', adminController.rejectCloseIdRequest);

// Password change request handling
router.patch('/approve-password-change/:requestId', adminController.approvePasswordChangeRequest);
router.patch('/reject-password-change/:requestId', adminController.rejectPasswordChangeRequest);

// ID creation request handling
router.get('/id-requests', adminController.getAllIdRequests);
router.patch('/update-id-request-status', hybridAdminController.updateIdRequestStatus);

// Home Banner Carousel
router.get('/home-banner', adminController.getHomeBannerImages);
router.post('/home-banner', uploadCorousel.single('image'), adminController.addHomeBannerImage);
router.delete('/home-banner/:id', adminController.deleteHomeBannerImage);

// Square Banner Carousel
router.get('/square-banner', adminController.getSquareBannerImages);
router.post('/square-banner', uploadCorousel.single('image'), adminController.addSquareBannerImage);
router.delete('/square-banner/:id', adminController.deleteSquareBannerImage);

module.exports = router;
