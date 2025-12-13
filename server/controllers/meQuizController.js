const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');

// @desc    Get My Visible Quizzes
// @route   GET /api/me/quizzes
// @access  Private
const getMyQuizzes = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Get all active program IDs for this user
    const enrollments = await Enrollment.find({
        user: userId,
        status: 'active',
        validUntil: { $gte: new Date() }
    }).select('program');

    const programIds = enrollments.map(e => e.program);

    if (programIds.length === 0) {
        return res.json([]);
    }

    // 2. Find published quizzes for these programs within time window
    const quizzes = await Quiz.find({
        program: { $in: programIds },
        status: 'Published',
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() }
    })
        .populate('program', 'title')
        .sort({ startTime: 1 });

    res.json(quizzes);
});

// @desc    Get Specific Quiz (Strict Enrollment Check)
// @route   GET /api/me/quizzes/:id
// @access  Private
const getMyQuiz = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    if (quiz.status !== 'Published') {
        res.status(403);
        throw new Error('Quiz is not published');
    }

    // Strict Access Check
    const enrollment = await Enrollment.findOne({
        user: userId,
        program: quiz.program,
        status: 'active',
        validUntil: { $gte: new Date() }
    });

    if (!enrollment) {
        res.status(403);
        throw new Error('You are not enrolled in the program for this quiz or your enrollment has expired.');
    }

    // Time Check
    const now = new Date();
    if (now < new Date(quiz.startTime) || now > new Date(quiz.endTime)) {
        res.status(403);
        throw new Error('Quiz is not currently active');
    }

    res.json(quiz);
});

module.exports = { getMyQuizzes, getMyQuiz };
