const express = require('express');
const router = express.Router();
const {
    getStudentCredentials,
    inviteStudent,
    resendCredentials,
    getEnrollments,
    exportEnrollments,
    getDashboardStats,
    updateStudent
} = require('../controllers/adminController');
const { publishCertificates, publishOfferLetters } = require('../controllers/certificateController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Route: /api/admin/invite
router.post('/invite', protect, admin, inviteStudent);
router.get('/enrollments', protect, admin, getEnrollments); // Restored
router.get('/enrollments/export', protect, admin, exportEnrollments); // NEW Export Route
router.post('/credentials', protect, admin, getStudentCredentials);
router.post('/credentials/resend', protect, admin, resendCredentials);
router.get('/dashboard', protect, admin, getDashboardStats);
router.put('/students/:id', protect, admin, updateStudent);
router.post('/programs/:id/publish-certificates', protect, admin, publishCertificates); // New Route
router.post('/programs/:id/publish-offer-letters', protect, admin, publishOfferLetters);

module.exports = router;
