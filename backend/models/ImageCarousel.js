const mongoose = require('mongoose');

const imageCarouselSchema = new mongoose.Schema({
    carouselId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    imagePath: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
    },
    size: {
        type: Number,
    },
}, { timestamps: true });

module.exports = mongoose.model('ImageCarousel', imageCarouselSchema);
