const express = require('express');
const router = express.Router();
const {
    getStudentCredentials,
    inviteStudent,
    resendCredentials,
    getEnrollments
} = require('../controllers/adminController');
const { publishCertificates } = require('../controllers/certificateController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Route: /api/admin/invite
router.post('/invite', protect, admin, inviteStudent);
router.get('/enrollments', protect, admin, getEnrollments); // Restored
router.post('/credentials', protect, admin, getStudentCredentials);
router.post('/credentials/resend', protect, admin, resendCredentials);
router.post('/programs/:id/publish-certificates', protect, admin, publishCertificates); // New Route

module.exports = router;
