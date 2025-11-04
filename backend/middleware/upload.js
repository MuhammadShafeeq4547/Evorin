// middleware/upload.js - Complete file upload handling
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    
    return {
      folder: 'instagram_clone',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo ? ['mp4', 'mov', 'avi', 'webm'] : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: isVideo ? undefined : [
        { width: 1080, height: 1080, crop: 'limit', quality: 'auto:good' }
      ]
    };
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }

  // Check file size
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  
  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Max size overall
    files: 10 // Max number of files
  }
});

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Images max 10MB, videos max 100MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }

  next();
};

module.exports = upload;
module.exports.handleUploadError = handleUploadError;