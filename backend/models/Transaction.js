const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String, // Keeping as String to match existing format, or could be Date
        required: true,
    },
    acceptedAt: {
        type: String,
        default: 'Not updated',
    },
    status: {
        type: String,
        default: 'Pending',
    },
    amount: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: String, // Username of the user
        required: true,
    },
    imagePath: {
        type: String,
        default: 'No path',
    },
    // Additional fields for withdrawal/ID creation
    coinsNeeded: Number,
    coinsToReceive: Number, // For deposit requests - number of coins user will receive

    withdrawalMethod: String,
    withdrawalDetails: mongoose.Schema.Types.Mixed,
    websiteName: String,
    websiteUrl: String,
    username: String,
    idDocumentId: String,
    transactionType: String,
    idRequestId: String,
    convertedCoins: Number,

    accountType: String,
    currency: String,
    adminId: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
