const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    fileUrl: {
        type: String // In case we generate and upload a PDF
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    metadata: {
        type: Object
    },
    error: {
        type: String
    }
}, {
    timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
