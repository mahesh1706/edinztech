const mongoose = require('mongoose');

const FeedbackRegistrySchema = new mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        index: true // Critical for performant lookups
    },
    inspireId: {
        type: String,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    email: String,
    mobile: String,
    institution: String,
    courseName: String,
    courseId: String,
    startDate: Date,
    endDate: Date,
    duration: String,
    feedbackFlag: Number, // Mapped from 'flag'
    place: String,
    state: String,
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        default: 'feedback'
    }
});

module.exports = mongoose.model('FeedbackRegistry', FeedbackRegistrySchema);
