const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const ImageCarousel = require('../models/ImageCarousel');
const { cloudinary, CloudinaryStorage } = require('../config/cloudinaryConfig');

// Cloudinary storage for image carousel uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'the247panel/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all images for a specific carousel
const getImages = async (req, res) => {
  try {
    const { carouselId } = req.params;

    const images = await ImageCarousel.find({ carouselId }).sort({ createdAt: -1 });

    if (images.length === 0) {
      return res.status(200).json([]);
    }

    const formattedImages = images.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Upload a new image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const { type, carouselId } = req.body;

    if (!type || !carouselId) {
      return res.status(400).json({ message: 'Type and carouselId are required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newImage = new ImageCarousel({
      imagePath,
      type,
      carouselId,
      originalName: req.file.originalname,
      size: req.file.size
    });

    await newImage.save();

    res.status(201).json({
      message: 'Image uploaded successfully.',
      image: { id: newImage._id, ...newImage.toObject() }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { carouselId, type } = req.body;

    if (!carouselId || !type) {
      return res.status(400).json({ message: 'CarouselId and type are required.' });
    }

    const image = await ImageCarousel.findById(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Cloudinary cleanup
    if (image.imagePath) {
      const urlParts = image.imagePath.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1) {
        const afterUpload = urlParts.slice(uploadIndex + 1);
        const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
        const publicIdWithExt = filtered.join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.warn('Cloudinary delete warning:', cloudErr.message);
        }
      }
    }

    await ImageCarousel.findByIdAndDelete(imageId);

    res.status(200).json({
      message: 'Image deleted successfully.',
      deletedImageId: imageId
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get image statistics
const getImageStats = async (req, res) => {
  try {
    const { carouselId } = req.params;

    const count = await ImageCarousel.countDocuments({ carouselId });

    const stats = {
      totalImages: count,
      carouselId: carouselId,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching image stats:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = {
  upload,
  getImages,
  uploadImage,
  deleteImage,
  getImageStats
};
