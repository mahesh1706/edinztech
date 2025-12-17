const express = require('express');
const router = express.Router();
const { handleCertificateStatus } = require('../controllers/webhookController');

router.post('/certificate-status', handleCertificateStatus);

module.exports = router;
