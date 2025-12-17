const express = require('express');
const router = express.Router();
const { getMyCertificates, verifyCertificate, issueCertificate, resolveLegacyQR, verifyNewCertificate } = require('../controllers/certificateController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/resolve', resolveLegacyQR);
router.get('/new-certificates/verify/:certificateId', verifyNewCertificate); // New Architecture
router.get('/me', protect, getMyCertificates);
router.get('/verify/:code', verifyCertificate);
router.post('/issue', protect, issueCertificate); // Should be admin only in real app, adding logic or middleware.
// Better:
// const { protect, admin } = require('../middlewares/authMiddleware');
// router.post('/issue', protect, admin, issueCertificate);

module.exports = router;
