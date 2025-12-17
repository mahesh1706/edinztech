const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseId: {
        type: String, // Keeping as String to avoid type coercion issues with CSV data
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    duration: {
        type: String
    },
    timing: {
        startDate: String, // CSV format "05/11/2022"
        endDate: String,
        startTime: String,
        endTime: String
    },
    image: {
        type: String
    },
    price: {
        type: String
    },
    link: {
        type: String // Payment link or similar
    },
    status: {
        type: String // e.g., "Past Events", "Upcoming"
    },
    deleteFlag: {
        type: String,
        default: '0'
    },
    audit: {
        createdAt: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('Course', courseSchema);
