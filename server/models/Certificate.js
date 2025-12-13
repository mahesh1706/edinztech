const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Program'
    },
    certificateCode: {
        type: String,
        required: true,
        unique: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
