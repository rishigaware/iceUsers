const mongoose = require('mongoose');

const closedIdSchema = new mongoose.Schema({
    websiteName: String,
    websiteUrl: String,

    username: String,
    imgUrl: String,
    createdBy: String,
    coinAmount: Number,
    convertedCoins: Number,

    minimumCoins: Number,

    accountType: String,
    currency: String,
    status: {
        type: String,
        default: 'Closed',
    },
    createdAt: String,
    idRequestId: String,
    balance: {
        type: Number,
        default: 0,
    },
    originalId: {
        type: String,
        required: true,
    },
    closedAt: {
        type: String,
        default: () => new Date().toISOString(),
    },
    closedBy: String,
}, { timestamps: true });

module.exports = mongoose.model('ClosedId', closedIdSchema);
