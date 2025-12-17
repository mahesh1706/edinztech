const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const User = require('../models/User'); // Ensure User model is loaded

// @desc    Publish certificates for a program
// @route   POST /api/admin/programs/:id/publish-certificates
// @access  Private/Admin
const axios = require('axios'); // Add axios

// @desc    Publish certificates for a program (Trigger Service)
// @route   POST /api/admin/programs/:id/publish-certificates
// @access  Private/Admin
const publishCertificates = asyncHandler(async (req, res) => {
    const programId = req.params.id;
    const CERT_SERVICE_URL = process.env.CERT_SERVICE_URL || 'http://localhost:5002/api/generate';
    const CALLBACK_URL = process.env.CALLBACK_BASE_URL
        ? `${process.env.CALLBACK_BASE_URL}/api/webhooks/certificate-status`
        : `http://localhost:5000/api/webhooks/certificate-status`;

    // 1. Verify Program
    const program = await Program.findById(programId);
    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    // 2. Find Active/Completed Enrollments
    const enrollments = await Enrollment.find({
        program: programId,
        status: { $in: ['active', 'completed'] }
    }).populate('user', 'name email registerNumber year institutionName');

    if (enrollments.length === 0) {
        res.status(400);
        throw new Error('No enrolled students found for this program');
    }

    let triggeredCount = 0;

    // 3. Trigger Service for Each
    for (const enrollment of enrollments) {
        const user = enrollment.user;
        if (!user) continue;

        // Check availability (Idempotency)
        const exists = await Certificate.findOne({
            user: user._id,
            program: programId
        });

        if (!exists || exists.status === 'failed') {
            // Create pending record
            const certificateId = `CERT-${program.code || 'PROG'}-${user._id.toString().slice(-4)}-${Date.now().toString().slice(-4)}`;

            let certDoc;
            if (!exists) {
                certDoc = await Certificate.create({
                    user: user._id,
                    program: programId,
                    certificateId: certificateId,
                    status: 'pending'
                });
            } else {
                certDoc = exists;
                certDoc.status = 'pending';
                certDoc.error = undefined; // Clear previous error
                await certDoc.save();
            }

            // Call Microservice
            try {
                await axios.post(CERT_SERVICE_URL, {
                    studentData: {
                        name: user.name,
                        email: user.email,
                        id: user._id,
                        registerNumber: user.registerNumber || '',
                        year: user.year || '',
                        institutionName: user.institutionName || ''
                    },
                    courseData: {
                        title: program.title,
                        id: program._id
                    },
                    certificateId: certDoc.certificateId,
                    callbackUrl: CALLBACK_URL,
                    templateId: program.certificateTemplate || 'default'
                });
                triggeredCount++;
            } catch (err) {
                console.error(`Failed to trigger cert service for ${user.email}:`, err.message);
                certDoc.status = 'failed';
                certDoc.error = `Trigger Failed: ${err.message}`;
                await certDoc.save();
            }
        }
    }

    res.json({
        success: true,
        message: `Certificate generation triggered. Requests sent: ${triggeredCount}`,
        totalEnrollments: enrollments.length,
        triggered: triggeredCount
    });
});

// @desc    Get my certificates
// @route   GET /api/certificates/me
// @access  Private
const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({ user: req.user._id })
        .populate('program', 'title type');
    res.json(certificates);
});

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:code
// @access  Public
const verifyCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findOne({ certificateId: req.params.code })
        .populate('user', 'name')
        .populate('program', 'title startDate endDate certificateTemplate certificateConfig');

    if (certificate) {
        res.json({
            valid: true,
            certificate
        });
    } else {
        res.status(404);
        throw new Error('Certificate not found');
    }
});

// @desc    Issue certificate (Single)
// @route   POST /api/certificates/issue
// @access  Private (Admin)
const issueCertificate = asyncHandler(async (req, res) => {
    // Placeholder or implement single issue logic
    res.status(501).json({ message: 'Not implemented yet' });
});

// @desc    Publish Offer Letters for a program
// @route   POST /api/admin/programs/:id/publish-offer-letters
// @access  Private/Admin
const publishOfferLetters = asyncHandler(async (req, res) => {
    const programId = req.params.id;
    const CERT_SERVICE_URL = process.env.CERT_SERVICE_URL || 'http://localhost:5002/api/generate';
    const CALLBACK_URL = process.env.CALLBACK_BASE_URL
        ? `${process.env.CALLBACK_BASE_URL}/api/webhooks/certificate-status`
        : `http://localhost:5000/api/webhooks/certificate-status`;

    // 1. Verify Program
    const program = await Program.findById(programId);
    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    // 2. Find Active/Completed Enrollments
    const enrollments = await Enrollment.find({
        program: programId,
        status: { $in: ['active', 'completed'] }
    }).populate('user', 'name email registerNumber year institutionName department pincode city state');

    if (enrollments.length === 0) {
        res.status(400);
        throw new Error('No enrolled students found for this program');
    }

    let triggeredCount = 0;

    // 3. Trigger Service for Each
    for (const enrollment of enrollments) {
        const user = enrollment.user;
        if (!user) continue;

        // Check availability (Idempotency) - Check if Offer Letter already exists? 
        // We can reuse Certificate model but maybe distinguish by certificateId prefix or added metadata
        // For now, let's treat it as a special "Certificate" type to reuse the DB schema.
        const exists = await Certificate.findOne({
            user: user._id,
            program: programId,
            certificateId: { $regex: /^OFFER-/ } // Check for existing offer letter
        });

        if (!exists || exists.status === 'failed') {
            // Create pending record
            const certificateId = `OFFER-${program.code || 'PROG'}-${user._id.toString().slice(-4)}-${Date.now().toString().slice(-4)}`;

            let certDoc;
            if (!exists) {
                certDoc = await Certificate.create({
                    user: user._id,
                    program: programId,
                    certificateId: certificateId,
                    status: 'pending',
                    metadata: { type: 'offer-letter' } // Mark as offer letter
                });
            } else {
                certDoc = exists;
                certDoc.status = 'pending';
                certDoc.error = undefined;
                await certDoc.save();
            }

            // Call Microservice
            try {
                await axios.post(CERT_SERVICE_URL, {
                    type: 'offer-letter', // Specify type
                    studentData: {
                        name: user.name,
                        email: user.email,
                        id: user._id,
                        registerNumber: user.registerNumber || '',
                        year: user.year || '',
                        institutionName: user.institutionName || '',
                        department: user.department || '',
                        pincode: user.pincode || '',
                        city: user.city || '',
                        state: user.state || ''
                    },
                    courseData: {
                        title: program.title,
                        id: program._id,
                        startDate: program.startDate,
                        endDate: program.endDate
                    },
                    certificateId: certDoc.certificateId,
                    callbackUrl: CALLBACK_URL,
                    templateId: 'offer-letter',
                    templateUrl: program.offerLetterTemplate // Pass the actual template path (e.g., uploads/template-....docx)
                });
                triggeredCount++;
            } catch (err) {
                console.error(`Failed to trigger offer letter service for ${user.email}:`, err.message);
                certDoc.status = 'failed';
                certDoc.error = `Trigger Failed: ${err.message}`;
                await certDoc.save();
            }
        }
    }

    res.json({
        success: true,
        message: `Offer Letter generation triggered. Requests sent: ${triggeredCount}`,
        totalEnrollments: enrollments.length,
        triggered: triggeredCount
    });
});

module.exports = {
    publishCertificates,
    publishOfferLetters,
    getMyCertificates,
    verifyCertificate,
    issueCertificate
};
