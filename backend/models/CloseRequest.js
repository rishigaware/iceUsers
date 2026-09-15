const mongoose = require('mongoose');

const closeRequestSchema = new mongoose.Schema({
    originalId: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        default: 'User requested to close ID',
    },
    status: {
        type: String,
        default: 'Pending',
    },
    createdAt: {
        type: String,
    },
    websiteName: String,
    websiteUrl: String,
    username: String,
    adminId: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('CloseRequest', closeRequestSchema);
