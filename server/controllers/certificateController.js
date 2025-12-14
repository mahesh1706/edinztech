const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const User = require('../models/User'); // Ensure User model is loaded

// @desc    Publish certificates for a program
// @route   POST /api/admin/programs/:id/publish-certificates
// @access  Private/Admin
const publishCertificates = asyncHandler(async (req, res) => {
    const programId = req.params.id;

    // 1. Verify Program
    const program = await Program.findById(programId);
    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    // 2. Find Active/Completed Enrollments
    // Assuming certificates are issued for 'active' or 'completed' students
    // Adjust filter based on business logic. User said "enrolled", implying all enrolled.
    const enrollments = await Enrollment.find({
        program: programId,
        status: { $in: ['active', 'completed'] }
    });

    if (enrollments.length === 0) {
        res.status(400);
        throw new Error('No enrolled students found for this program');
    }

    let issuedCount = 0;

    // 3. Issue Certificates
    for (const enrollment of enrollments) {
        // Check if certificate already exists
        const exists = await Certificate.findOne({
            user: enrollment.user,
            program: programId
        });

        if (!exists) {
            // Generate Payload
            // Unique ID: PROG-USER-TIMESTAMP (simple generation)
            // Unique ID: PROG-USER-TIMESTAMP (simple generation)
            const uniqueId = `CERT-${program.code || 'PROG'}-${enrollment.user.toString().slice(-4)}-${Date.now().toString().slice(-4)}`;

            await Certificate.create({
                user: enrollment.user,
                program: programId,
                certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                issueDate: new Date()
            });
            issuedCount++;
        }
    }

    res.json({
        success: true,
        message: `Certificates published successfully. Issued ${issuedCount} new certificates.`,
        totalEnrollments: enrollments.length,
        newlyIssued: issuedCount
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

module.exports = {
    publishCertificates,
    getMyCertificates,
    verifyCertificate,
    issueCertificate
};
