const mongoose = require('mongoose');

const programSchema = mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, unique: true }, // Auto-generated ideal
    description: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['Course', 'Internship', 'Workshop']
    },
    mode: {
        type: String,
        required: true,
        enum: ['Online', 'Offline', 'Hybrid']
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },

    // Payment
    paymentMode: { type: String, enum: ['Paid', 'Free', 'Invite Only'], default: 'Paid' },
    fee: { type: Number, default: 0 },
    registrationLink: { type: String },

    // Templates (File Paths)
    image: { type: String }, // Implementation uses 'image' generally
    offerLetterTemplate: { type: String },
    certificateTemplate: { type: String },

    // Communication
    whatsappGroupLink: { type: String },
    whatsappMessage: { type: String },
    emailSubject: { type: String },
    emailBody: { type: String },

    isArchived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Program = mongoose.model('Program', programSchema);
module.exports = Program;
