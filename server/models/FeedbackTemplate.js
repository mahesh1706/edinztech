const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['rating', 'single-select', 'multi-select', 'text'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    options: [String], // For select types
    required: {
        type: Boolean,
        default: true
    },
    meta: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
});

const feedbackTemplateSchema = new mongoose.Schema({
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: [questionSchema],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    startAt: {
        type: Date
    },
    endAt: {
        type: Date
    },
    publishedAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FeedbackTemplate', feedbackTemplateSchema);
