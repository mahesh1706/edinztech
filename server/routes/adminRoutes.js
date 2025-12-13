const express = require('express');
const router = express.Router();
const { inviteStudent, getEnrollments, getStudentCredentials } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Route: /api/admin/invite
router.post('/invite', protect, admin, inviteStudent);
router.get('/enrollments', protect, admin, getEnrollments);
router.post('/credentials', protect, admin, getStudentCredentials);

module.exports = router;
