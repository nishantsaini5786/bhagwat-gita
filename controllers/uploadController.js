// controllers/uploadController.js
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Upload avatar (direct to cloudinary - no temp files)
// @route   POST /api/user/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file'
      });
    }

    // Log file details for debugging
    console.log('📸 Avatar upload started:');
    console.log('   - Filename:', req.file.originalname);
    console.log('   - Size:', (req.file.size / 1024).toFixed(2), 'KB');
    console.log('   - Type:', req.file.mimetype);

    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed.'
      });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed (JPEG, PNG, GIF, etc.)'
      });
    }

    // Convert buffer to base64 for cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to cloudinary directly from memory
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'gita-wisdom/avatars',
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'face', // Focus on face if detected
      quality: 'auto:good',
      format: 'jpg'
    });

    console.log('✅ Cloudinary upload successful:');
    console.log('   - URL:', result.secure_url);
    console.log('   - Public ID:', result.public_id);

    // Update user with avatar URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User profile updated with new avatar');

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        phone: user.phone,
        city: user.city,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.http_code === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please try another image.'
      });
    }
    
    if (error.http_code === 401) {
      console.error('❌ Cloudinary authentication failed. Check your API keys.');
      return res.status(500).json({
        success: false,
        message: 'Image upload service configuration error.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar. Please try again.'
    });
  }
};

// @desc    Delete avatar
// @route   DELETE /api/user/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get public_id from avatar URL (if it's from cloudinary)
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        // Extract public_id from URL
        const urlParts = user.avatar.split('/');
        const publicIdWithVersion = urlParts[urlParts.length - 1];
        const publicId = publicIdWithVersion.split('.')[0];
        const fullPublicId = `gita-wisdom/avatars/${publicId}`;
        
        // Delete from cloudinary
        await cloudinary.uploader.destroy(fullPublicId);
        console.log('✅ Avatar deleted from Cloudinary');
      } catch (cloudinaryErr) {
        console.error('⚠️ Could not delete from Cloudinary:', cloudinaryErr.message);
        // Continue anyway - we'll remove from DB
      }
    }

    // Remove avatar from user document
    user.avatar = null;
    await user.save();

    console.log('✅ Avatar removed from user profile');

    res.status(200).json({
      success: true,
      message: 'Avatar removed successfully'
    });

  } catch (error) {
    console.error('❌ Avatar delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove avatar'
    });
  }
};

// @desc    Get avatar upload history/info
// @route   GET /api/user/avatar/info
// @access  Private
exports.getAvatarInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('avatar');

    res.status(200).json({
      success: true,
      hasAvatar: !!user.avatar,
      avatarUrl: user.avatar || null
    });

  } catch (error) {
    console.error('❌ Avatar info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get avatar info'
    });
  }
};