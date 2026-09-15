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
    adminUrl: {
        type: String,
        default: '',
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
    coinAmount: {
        type: Number,
        required: true,
    },
    convertedCoins: {
        type: Number,
        required: true,
    },
    coinRate: {
        type: Number,
        required: true,
    },
    minimumCoins: {
        type: Number,
        required: true,
    },
    refundable: {
        type: Boolean,
        default: false,
    },
    accountType: {
        type: String,
        default: 'admin',
    },
    currency: {
        type: String,
        default: 'INR',
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
