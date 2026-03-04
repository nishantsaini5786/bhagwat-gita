// utils/upload.js
const multer = require('multer');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)!'), false);
  }
};

// Multer upload instance with limits
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file at a time
  },
  fileFilter: fileFilter
});

module.exports = upload;