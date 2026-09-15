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
}, { timestamps: true });

module.exports = mongoose.model('Carousel', carouselSchema);
