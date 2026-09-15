const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['superadmin', 'admin'],
        default: 'admin',
    },
    agentCode: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: 'active',
    },
    permissions: {
        canCreateUsers: { type: Boolean, default: true },
        canUpdateUserBalance: { type: Boolean, default: true },
        canChangeUserPassword: { type: Boolean, default: true },
        canDeleteUsers: { type: Boolean, default: false },
        canAddWebsites: { type: Boolean, default: true },
        canEditWebsites: { type: Boolean, default: true },
        canDeleteWebsites: { type: Boolean, default: false },
        canManageCategories: { type: Boolean, default: true },
        canManageIdRequests: { type: Boolean, default: true },
        canManageTransactions: { type: Boolean, default: true },
        canEditIdCredentials: { type: Boolean, default: true },
        canManageBanners: { type: Boolean, default: false },
        canManageSupportLinks: { type: Boolean, default: false },
    },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
