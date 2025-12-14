const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

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

// @desc    Submit Quiz Attempt
// @route   POST /api/me/quizzes/:id/submit
// @access  Private
const submitQuizAttempt = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const quizId = req.params.id;
    const { answers } = req.body; // { questionIndex: selectedOptionIndex }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    // Access & Time Check (Reuse logic or abstract it? simplified here)
    if (new Date() > new Date(quiz.endTime)) {
        res.status(400);
        throw new Error('Quiz deadline has passed');
    }

    // Verify Enrollment
    const enrollment = await Enrollment.findOne({
        user: userId,
        program: quiz.program,
        status: 'active'
    });
    if (!enrollment) {
        res.status(403);
        throw new Error('Not authorized to attempt this quiz');
    }

    // Calculate Score
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Process answers (Assuming answers is an object like { 0: 1, 1: 3 } or array)
    // Let's assume frontend sends { questionIdOrIndex: optionIndex }
    // Or simplified array matching index.
    // For simplicity, let's look at how Quiz model stores questions.
    // Quiz.questions is an array.

    Object.keys(answers).forEach((qIndex) => {
        const selectedOpt = answers[qIndex]; // This is the index of option selected
        const question = quiz.questions[qIndex];

        if (question && parseInt(selectedOpt) === question.correctOption) {
            correctCount++;
        }
    });

    const scorePercentage = (correctCount / totalQuestions) * 100;
    const passed = scorePercentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
        quiz: quizId,
        user: userId,
        answers: Object.entries(answers).map(([k, v]) => ({ questionId: k, selectedOption: v })),
        score: scorePercentage,
        totalQuestions,
        passed,
        attemptedAt: Date.now()
    });

    res.json({
        success: true,
        score: scorePercentage,
        passed,
        attemptId: attempt._id,
        summary: `You got ${correctCount} out of ${totalQuestions} correct.`
    });
});

module.exports = { getMyQuizzes, getMyQuiz, submitQuizAttempt };
