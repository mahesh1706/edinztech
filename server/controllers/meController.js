const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const Certificate = require('../models/Certificate');

// @desc    Get user's enrollments
// @route   GET /api/me/enrollments
// @access  Private
const getMyEnrollments = asyncHandler(async (req, res) => {
    // Return enrollments with program details
    const enrollments = await Enrollment.find({ user: req.user._id })
        .populate('program', 'title type mode startDate endDate image')
        .sort('-enrolledAt');

    res.json(enrollments);
});

// @desc    Get dashboard overview stats
// @route   GET /api/me/dashboard-overview
// @access  Private
const getDashboardOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Total Enrolled
    const totalEnrolled = await Enrollment.countDocuments({ user: userId });

    // 2. Completed Programs
    const completedPrograms = await Enrollment.countDocuments({ user: userId, status: 'completed' });

    // 3. Active
    const activePrograms = await Enrollment.countDocuments({ user: userId, status: 'active' });

    // 4. Certificates
    const certificates = await Certificate.countDocuments({ user: userId });

    // 5. Recent Enrollments
    const recentEnrollments = await Enrollment.find({ user: userId })
        .sort('-enrolledAt')
        .limit(3)
        .populate('program', 'title type');

    res.json({
        totalEnrolled,
        completedPrograms,
        activePrograms,
        certificates,
        recentEnrollments
    });
});

// @desc    Get program progress & access status
// @route   GET /api/me/program/:programId/progress
// @access  Private
const getProgramProgress = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, program: programId });

    if (!enrollment) {
        res.status(403);
        throw new Error('Not enrolled in this program');
    }

    // Check validity
    // If validUntil exists and is past, valid = false
    const now = new Date();
    let isExpired = false;
    if (enrollment.validUntil && new Date(enrollment.validUntil) < now) {
        isExpired = true;
    }

    const program = await Program.findById(programId).select('-offerLetterTemplate -certificateTemplate');

    // Check certificate
    const certificate = await Certificate.findOne({ user: userId, program: programId });

    res.json({
        enrollment,
        isExpired,
        program,
        hasCertificate: !!certificate,
        certificate: certificate || null
    });
});

module.exports = {
    getMyEnrollments,
    getDashboardOverview,
    getProgramProgress
};
