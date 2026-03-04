// controllers/uploadController.js
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload avatar
// @route   POST /api/user/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gita-wisdom/avatars',
      width: 200,
      height: 200,
      crop: 'fill'
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    // Update user with avatar URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      user
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Clean up temp file if exists
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};