const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const FeedbackTemplate = require('../models/FeedbackTemplate');

// @desc    Get Student Dashboard Data
// @route   GET /api/me/dashboard
// @access  Private (Student)
const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Get Active Enrollments
    const enrollments = await Enrollment.find({
        user: userId,
        status: 'active',
        validUntil: { $gte: new Date() }
    }).populate('program', 'title type');

    // 2. Compute Program Data
    const dashboardData = await Promise.all(enrollments.map(async (enrollment) => {
        if (!enrollment.program) return null; // Skip if program deleted

        // Fetch visible Quizzes
        const quizzes = await Quiz.find({
            program: enrollment.program._id,
            status: 'Published',
            startTime: { $lte: new Date() },
            endTime: { $gte: new Date() }
        }).select('title description duration totalMarks startTime endTime');

        // Fetch visible Feedbacks
        const feedbacks = await FeedbackTemplate.find({
            programId: enrollment.program._id,
            status: 'Published'
        }).select('title description type');

        return {
            programId: enrollment.program._id,
            title: enrollment.program.title,
            type: enrollment.programType || enrollment.program.type,
            enrollmentStatus: enrollment.status,
            validUntil: enrollment.validUntil,
            quizzes,
            feedbacks
        };
    }));

    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            id: req.user._id
        },
        programs: dashboardData.filter(p => p !== null)
    });
});

module.exports = { getDashboard };
