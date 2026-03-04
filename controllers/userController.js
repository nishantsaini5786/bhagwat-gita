// controllers/userController.js (Complete - enhanced)
const User = require('../models/User');

// ─────────────────────────────────────────────
//  Update profile
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, phone, city, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -verificationToken -resetPasswordToken');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user
    });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// ─────────────────────────────────────────────
//  Next shlok - update progress
// ─────────────────────────────────────────────
exports.nextShlok = async (req, res) => {
  try {
    const { chapter, verse } = req.body;

    const user = await User.findById(req.user._id);

    // Update progress
    user.progress.totalRead += 1;
    user.progress.currentIndex += 1;

    // Add to history (avoid duplicates)
    const alreadyRead = user.progress.readHistory.some(
      h => h.chapter === chapter && h.verse === verse
    );

    if (!alreadyRead && chapter && verse) {
      user.progress.readHistory.push({ chapter, verse });

      // Track chapter
      if (!user.progress.chaptersExplored.includes(chapter)) {
        user.progress.chaptersExplored.push(chapter);
      }
    }

    // Update streak
    user.updateStreak();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated!',
      totalRead: user.progress.totalRead,
      currentIndex: user.progress.currentIndex,
      streak: user.streak.current,
      chaptersExplored: user.progress.chaptersExplored.length
    });

  } catch (err) {
    console.error('Next shlok error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
};

// ─────────────────────────────────────────────
//  Toggle favorite
// ─────────────────────────────────────────────
exports.toggleFavorite = async (req, res) => {
  try {
    const { chapter, verse } = req.body;

    if (!chapter || !verse) {
      return res.status(400).json({
        success: false,
        message: 'Chapter and verse are required'
      });
    }

    const user = await User.findById(req.user._id);

    const existingIndex = user.progress.favorites.findIndex(
      f => f.chapter === chapter && f.verse === verse
    );

    let action;
    if (existingIndex > -1) {
      user.progress.favorites.splice(existingIndex, 1);
      action = 'removed';
    } else {
      user.progress.favorites.push({ chapter, verse });
      action = 'added';
    }

    await user.save();

    res.status(200).json({
      success: true,
      action,
      message: action === 'added' ? 'Added to favorites! ❤️' : 'Removed from favorites',
      totalFavorites: user.progress.favorites.length
    });

  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorites'
    });
  }
};

// ─────────────────────────────────────────────
//  Get favorites
// ─────────────────────────────────────────────
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress.favorites');

    res.status(200).json({
      success: true,
      favorites: user.progress.favorites.reverse()
    });

  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites'
    });
  }
};

// ─────────────────────────────────────────────
//  Toggle bookmark
// ─────────────────────────────────────────────
exports.toggleBookmark = async (req, res) => {
  try {
    const { chapter, verse } = req.body;

    if (!chapter || !verse) {
      return res.status(400).json({
        success: false,
        message: 'Chapter and verse are required'
      });
    }

    const user = await User.findById(req.user._id);

    const existingIndex = user.progress.bookmarks.findIndex(
      b => b.chapter === chapter && b.verse === verse
    );

    let action;
    if (existingIndex > -1) {
      user.progress.bookmarks.splice(existingIndex, 1);
      action = 'removed';
    } else {
      user.progress.bookmarks.push({ chapter, verse });
      action = 'added';
    }

    await user.save();

    res.status(200).json({
      success: true,
      action,
      message: action === 'added' ? 'Bookmarked! 🔖' : 'Bookmark removed',
      totalBookmarks: user.progress.bookmarks.length
    });

  } catch (err) {
    console.error('Toggle bookmark error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update bookmarks'
    });
  }
};

// ─────────────────────────────────────────────
//  Get bookmarks
// ─────────────────────────────────────────────
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress.bookmarks');

    res.status(200).json({
      success: true,
      bookmarks: user.progress.bookmarks.reverse()
    });

  } catch (err) {
    console.error('Get bookmarks error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmarks'
    });
  }
};

// ─────────────────────────────────────────────
//  Get history
// ─────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const user = await User.findById(req.user._id)
      .select('progress.readHistory');

    const history = user.progress.readHistory
      .reverse()
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      history
    });

  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get history'
    });
  }
};

// ─────────────────────────────────────────────
//  Log mood
// ─────────────────────────────────────────────
exports.logMood = async (req, res) => {
  try {
    const { mood, shlokRef } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required'
      });
    }

    const user = await User.findById(req.user._id);

    user.moods.push({
      mood,
      shlokRef: shlokRef || ''
    });

    // Keep only last 90 entries
    if (user.moods.length > 90) {
      user.moods = user.moods.slice(-90);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mood logged successfully!',
      totalMoods: user.moods.length
    });

  } catch (err) {
    console.error('Log mood error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to log mood'
    });
  }
};

// ─────────────────────────────────────────────
//  Get moods
// ─────────────────────────────────────────────
exports.getMoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const user = await User.findById(req.user._id)
      .select('moods');

    const moods = user.moods
      .reverse()
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      moods
    });

  } catch (err) {
    console.error('Get moods error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get moods'
    });
  }
};

// ─────────────────────────────────────────────
//  Get all stats
// ─────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress streak moods createdAt');

    const daysJoined = Math.floor(
      (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    const stats = {
      totalRead: user.progress.totalRead,
      totalFavorites: user.progress.favorites.length,
      totalBookmarks: user.progress.bookmarks.length,
      chaptersExplored: user.progress.chaptersExplored.length,
      currentStreak: user.streak.current,
      longestStreak: user.streak.longest,
      totalMoods: user.moods.length,
      daysJoined: daysJoined || 1,
      lastRead: user.streak.lastRead,
      readDates: user.streak.readDates.slice(-31), // Last 31 days
      recentHistory: user.progress.readHistory.slice(-10).reverse(),
      recentMoods: user.moods.slice(-5).reverse()
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
};

// ─────────────────────────────────────────────
//  Change password
// ─────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Google accounts cannot change password here.'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// ─────────────────────────────────────────────
//  Delete account
// ─────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    // Clear cookies
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Destroy session
    req.session.destroy(() => {});

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully. We are sad to see you go 🙏'
    });

  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};