const multer = require('multer');
const path = require('path');
const { cloudinary, CloudinaryStorage } = require('./cloudinaryConfig');

// Cloudinary storage for website logo files
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'the247panel/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  },
});

// Create multer instance for single file upload (logo)
const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    // Broad match for any image type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Error: Images Only!'));
    }
  },
}).single('logo'); // Ensure the field name in the form is 'logo'

module.exports = uploadLogo;
