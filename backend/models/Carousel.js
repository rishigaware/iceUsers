const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    imagePath: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['top', 'middle', 'bottom', 'topCard', 'bottomCard', 'homeBanner', 'squareBanner'],
        required: true,
    },
    adminId: {
        type: String,
        default: 'superadmin',
        index: true,
    },
}, { timestamps: true });

carouselSchema.index({ type: 1, adminId: 1 });

module.exports = mongoose.model('Carousel', carouselSchema);
