const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true, // Assuming one account details per user
    },
    accountNumber: {
        type: String,
        default: "",
    },
    accountHolderName: {
        type: String,
        default: "",
    },
    ifscCode: {
        type: String,
        default: "",
    },
    bankName: {
        type: String,
        default: "",
    },
    upiId: {
        type: String,
        default: "",
    },
}, { timestamps: true });

module.exports = mongoose.model('UserAccount', userAccountSchema);
