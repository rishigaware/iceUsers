const mongoose = require('mongoose');

const idRequestSchema = new mongoose.Schema({
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
        default: 'Pending',
    },
    createdAt: {
        type: String,
    },
    processedAt: {
        type: String,
        default: null,
    },
    processedBy: {
        type: String,
        default: null,
    },
    adminNotes: {
        type: String,
        default: null,
    },
    adminId: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('IdRequest', idRequestSchema);
