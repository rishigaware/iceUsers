const express = require('express');
const imageController = require('../controller/imageController');

const router = express.Router();

// Image management routes
router.get('/get/:carouselId', imageController.getImages);
router.post('/upload', imageController.upload.single('image'), imageController.uploadImage);
router.delete('/delete/:imageId', imageController.deleteImage);
router.get('/stats/:carouselId', imageController.getImageStats);

module.exports = router;

