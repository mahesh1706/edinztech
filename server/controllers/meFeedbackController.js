const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const FeedbackTemplate = require('../models/FeedbackTemplate');

// @desc    Get My Visible Feedbacks
// @route   GET /api/me/feedbacks
// @access  Private
const getMyFeedbacks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({
        user: userId,
        status: 'active',
        validUntil: { $gte: new Date() }
    }).select('program');

    const programIds = enrollments.map(e => e.program);

    if (programIds.length === 0) {
        return res.json([]);
    }

    const feedbacks = await FeedbackTemplate.find({
        programId: { $in: programIds },
        status: 'Published'
    })
        .populate('programId', 'title')
        .sort({ createdAt: -1 });

    res.json(feedbacks);
});

// @desc    Get Specific Feedback (Strict Enrollment Check)
// @route   GET /api/me/feedbacks/:id
// @access  Private
const getMyFeedback = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const feedbackId = req.params.id;

    const feedback = await FeedbackTemplate.findById(feedbackId);
    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    if (feedback.status !== 'Published') {
        res.status(403);
        throw new Error('Feedback is not published');
    }

    const enrollment = await Enrollment.findOne({
        user: userId,
        program: feedback.programId,
        status: 'active',
        validUntil: { $gte: new Date() }
    });

    if (!enrollment) {
        res.status(403);
        throw new Error('You are not enrolled in this program or your enrollment has expired.');
    }

    res.json(feedback);
});

module.exports = { getMyFeedbacks, getMyFeedback };
