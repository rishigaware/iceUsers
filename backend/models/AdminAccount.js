const mongoose = require('mongoose');

const adminAccountSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        default: "1", // Assuming fixed ID for admin account details
    },
    accountNumber: {
        type: String,
        default: "1234567890",
    },
    accountHolderName: {
        type: String,
        default: "John Doe",
    },
    ifscCode: {
        type: String,
        default: "ABCD0123456",
    },
    bankName: {
        type: String,
        default: "XYZ Bank",
    },
    upiId: {
        type: String,
        default: "sample@upi",
    },
}, { timestamps: true });

module.exports = mongoose.model('AdminAccount', adminAccountSchema);
