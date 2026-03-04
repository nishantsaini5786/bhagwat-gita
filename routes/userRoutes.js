// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const {
  updateProfile,
  nextShlok,
  toggleFavorite,
  toggleBookmark,
  logMood,
  getStats,
  changePassword,
  deleteAccount,
  getHistory,
  getFavorites,
  getBookmarks,
  getMoods
} = require('../controllers/userController');
const {
  uploadAvatar,
  deleteAvatar,
  getAvatarInfo
} = require('../controllers/uploadController');
const { protect, requireVerified } = require('../middleware/auth');
const { validate, profileValidation, passwordChangeValidation } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

// ===== ALL USER ROUTES REQUIRE AUTHENTICATION =====
router.use(protect);
router.use(requireVerified);
router.use(apiLimiter);

// ===== PROFILE MANAGEMENT =====
router.put('/profile', validate(profileValidation), updateProfile);
router.put('/change-password', validate(passwordChangeValidation), changePassword);
router.delete('/account', deleteAccount);

// ===== AVATAR MANAGEMENT =====
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.get('/avatar/info', getAvatarInfo);

// ===== PROGRESS & STATS =====
router.get('/stats', getStats);
router.post('/next-shlok', nextShlok);

// ===== FAVORITES =====
router.post('/favorite', toggleFavorite);
router.get('/favorites', getFavorites);

// ===== BOOKMARKS =====
router.post('/bookmark', toggleBookmark);
router.get('/bookmarks', getBookmarks);

// ===== HISTORY =====
router.get('/history', getHistory);

// ===== MOOD JOURNAL =====
router.post('/mood', logMood);
router.get('/moods', getMoods);

module.exports = router;