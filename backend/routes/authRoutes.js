// authRoutes.js
const express = require('express');
const { loginController } = require('../controller/authController');
const router = express.Router();

// POST route for login
router.post('/login', loginController);

module.exports = router;
