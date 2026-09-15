const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        default: 'user',
    },
    agentCode: {
        type: String,
        default: '',
    },
    assignedAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
    },
    assignedAdminUsername: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
