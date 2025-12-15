const mongoose = require('mongoose');

const quizAttemptSchema = mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionId: String, // Or index (keeping String for flexibility)
        questionType: String, // 'mcq' or 'text'
        selectedOption: Number, // For MCQ
        textAnswer: String, // For Text
        isCorrect: Boolean,
        marksAwarded: { type: Number, default: 0 }
    }],
    score: { type: Number, required: true }, // Percentage or Total Marks? Keeping Percentage for now, or maybe raw score?
    totalMaxScore: { type: Number }, // To calculate percentage accurately if weights differ
    passed: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Graded', 'Pending Review'],
        default: 'Graded'
    },
    attemptedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
