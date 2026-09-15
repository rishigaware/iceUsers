const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    adminId: {
        type: String,
        default: '',
    },
}, { timestamps: true });

categorySchema.index({ name: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
