const mongoose = require('mongoose');

const accessLogSchema = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['VIEW_CREDENTIALS']
    },
    ipAddress: String,
    metadata: Object
}, {
    timestamps: true
});

const AccessLog = mongoose.model('AccessLog', accessLogSchema);
module.exports = AccessLog;
