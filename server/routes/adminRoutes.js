const express = require('express');
const router = express.Router();
const { inviteStudent } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Route: /api/admin/invite
router.post('/invite', protect, admin, inviteStudent);

module.exports = router;
