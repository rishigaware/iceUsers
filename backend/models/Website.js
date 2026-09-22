const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    website: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },

    minimumCoins: {
        type: Number,
        default: 0,
    },
    adminId: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Website', websiteSchema);
