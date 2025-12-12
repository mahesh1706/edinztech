const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');

// @desc    Get My Certificates
// @route   GET /api/me/certificates
// @access  Private
const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({ user: req.user._id }).populate('program', 'title');
    res.json(certificates);
});

// @desc    Verify Certificate
// @route   GET /api/certificate/verify/:code
// @access  Public
const verifyCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findOne({ certificateCode: req.params.code })
        .populate('user', 'name')
        .populate('program', 'title type');

    if (certificate) {
        res.json({
            valid: true,
            details: {
                studentName: certificate.user.name,
                program: certificate.program.title,
                issuedAt: certificate.issuedAt,
                code: certificate.certificateCode
            }
        });
    } else {
        res.status(404).json({ valid: false, message: 'Invalid Certificate Code' });
    }
});

const { generateCertificate } = require('../services/certificateGenerator');
const Program = require('../models/Program');
const User = require('../models/User');

// ... existing code ...

// @desc    Issue Certificate Manual
// @route   POST /api/certificates/issue
// @access  Admin
const issueCertificate = asyncHandler(async (req, res) => {
    const { userId, programId } = req.body;

    const user = await User.findById(userId);
    const program = await Program.findById(programId);

    if (!user || !program) {
        res.status(404);
        throw new Error('User or Program not found');
    }

    // Generate
    // Enrollment? ideally check if enrolled.
    // Assuming admin knows what they are doing.

    const certData = await generateCertificate(user, program);

    if (!certData) {
        res.status(500);
        throw new Error('Certificate generation failed');
    }

    // Save DB
    const certificate = await Certificate.create({
        user: userId,
        program: programId,
        certificateCode: certData.code,
        fileUrl: certData.path
    });

    res.json(certificate);
});

module.exports = { getMyCertificates, verifyCertificate, issueCertificate };
