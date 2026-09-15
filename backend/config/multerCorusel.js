const multer = require('multer');
const { cloudinary, CloudinaryStorage } = require('./cloudinaryConfig');

// Cloudinary storage for carousel/banner images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'the247panel/carousel',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  },
});

// Initialize Multer with the Cloudinary storage configuration
const uploadCarousel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = uploadCarousel;
