const mongoose = require('mongoose');

const supportLinkSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin',
  },
  whatsappSupport: {
    type: String,
    default: 'https://wa.me/6285857878389',
  },
  whatsappChannel: {
    type: String,
    default: 'https://whatsapp.com/channel/0029VbC6sBZId7nLnyyDaE30',
  },
  telegram: {
    type: String,
    default: 'https://t.me/Icepanelsinfo',
  },
  instagram: {
    type: String,
    default: 'https://www.instagram.com/ice_panels?igsh=MTM3ZGc3NDhsZDYzMw==',
  },
  facebook: {
    type: String,
    default: 'https://www.facebook.com',
  },
}, { timestamps: true });

// Ensure one entry per adminId
supportLinkSchema.index({ adminId: 1 }, { unique: true });

module.exports = mongoose.model('SupportLink', supportLinkSchema);
