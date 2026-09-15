const mongoose = require('mongoose');

const passwordChangeRequestSchema = new mongoose.Schema({
    originalId: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    newPassword: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        default: 'User requested password change',
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

module.exports = mongoose.model('PasswordChangeRequest', passwordChangeRequestSchema);
