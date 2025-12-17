const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    // Primary Key for Verification (ISS ID)
    certificateId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    qrCode: { type: String }, // Base64 QR Data URL (New Architecture)

    // Relationships
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true,
        index: true
    },

    // Decoupled Course Data
    courseName: {
        type: String,
        required: true
    },
    courseId: {
        type: String, // Optional link to Course collection (e.g. "1", "2")
        ref: 'Course'
    },

    // Timeline
    timeline: {
        startDate: Date,
        endDate: Date,
        duration: String
    },

    // Verification Status
    verification: {
        status: {
            type: String,
            enum: ['valid', 'revoked'],
            required: true
        },
        source: {
            type: String,
            enum: ['legacy', 'new'],
            default: 'legacy'
        }
    },

    // File Paths
    files: {
        legacyPath: String,
        generatedPdf: String
    },

    // Audit Trail
    audit: {
        legacyMysqlId: String,
        migratedAt: {
            type: Date,
            default: Date.now
        }
    },

    // Optional legacy metadata
    metadata: {
        type: Object
    }
}, {
    timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
