const express = require('express');
const router = express.Router();
const supportController = require('../controller/supportController');

// GET /api/support/links - fetch support links based on logged-in user or admin
router.get('/links', supportController.getSupportLinks);

// PUT /api/support/links - update support links (admin & superadmin only)
router.put('/links', supportController.updateSupportLinks);

module.exports = router;
