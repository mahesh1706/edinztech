const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');

// @desc    Handle Certificate Status Callback
// @route   POST /api/webhooks/certificate-status
// @access  Public (Should be protected by secret in headers ideally)
const handleCertificateStatus = asyncHandler(async (req, res) => {
    const { certificateId, status, metadata, error } = req.body;

    console.log(`[Webhook] Received status for ${certificateId}: ${status}`);

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
    }

    certificate.status = status;
    if (metadata) {
        certificate.metadata = { ...certificate.metadata, ...metadata };
        // Save fileUrl if provided
        if (metadata.fileUrl) {
            certificate.fileUrl = metadata.fileUrl;
        }
    }
    if (error) {
        certificate.error = error;
    }

    await certificate.save();

    res.json({ message: 'Status updated' });
});

module.exports = { handleCertificateStatus };
