const mongoose = require('mongoose');

const websiteIdSchema = new mongoose.Schema({
    websiteName: {
        type: String,
        required: true,
    },
    websiteUrl: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        default: '',
    },
    imgUrl: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String, // Username of the user
        required: true,
    },
    status: {
        type: String,
        default: 'Requested',
    },
    balance: {
        type: Number,
        default: 0,
    },
    comment: {
        type: String,
    },
    createdAt: {
        type: String, // Keeping as String to match existing format
    },
    updatedAt: {
        type: String,
    },
    adminId: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('WebsiteId', websiteIdSchema);
