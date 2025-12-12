const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: {
        type: Number, // Index of the correct option (0-3) or string value? Prompt said "A"|"B"... let's use Index or Value. UI sends Strings.
        required: true
    }
});

const quizSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    passingScore: { type: Number, default: 60 },
    questions: [questionSchema],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    startTime: { type: Date },
    endTime: { type: Date }
}, {
    timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
