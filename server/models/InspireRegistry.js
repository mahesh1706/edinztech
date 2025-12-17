const mongoose = require('mongoose');

const inspireRegistrySchema = new mongoose.Schema({
    inspireId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    institution: {
        type: String
    },
    legacyId: {
        type: String
    },
    rawMetadata: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InspireRegistry', inspireRegistrySchema);
