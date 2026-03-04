// routes/userRoutes.js
const express = require('express');
const router = express.Router();
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
const { protect, requireVerified } = require('../middleware/auth');
const { validate, profileValidation, passwordChangeValidation } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

// All user routes require authentication
router.use(protect);
router.use(requireVerified);
router.use(apiLimiter);

// ─────────────────────────────────────────────
//  Profile Management
// ─────────────────────────────────────────────
router.put('/profile', validate(profileValidation), updateProfile);
router.put('/change-password', validate(passwordChangeValidation), changePassword);
router.delete('/account', deleteAccount);

// ─────────────────────────────────────────────
//  Progress & Stats
// ─────────────────────────────────────────────
router.get('/stats', getStats);
router.post('/next-shlok', nextShlok);

// ─────────────────────────────────────────────
//  Favorites
// ─────────────────────────────────────────────
router.post('/favorite', toggleFavorite);
router.get('/favorites', getFavorites);

// ─────────────────────────────────────────────
//  Bookmarks
// ─────────────────────────────────────────────
router.post('/bookmark', toggleBookmark);
router.get('/bookmarks', getBookmarks);

// ─────────────────────────────────────────────
//  History
// ─────────────────────────────────────────────
router.get('/history', getHistory);

// ─────────────────────────────────────────────
//  Mood Journal
// ─────────────────────────────────────────────
router.post('/mood', logMood);
router.get('/moods', getMoods);

module.exports = router;

// routes/userRoutes.js - Add this line
const upload = require('../utils/upload');
const { uploadAvatar } = require('../controllers/uploadController');

// Add this route (after other routes)
router.post('/avatar', upload.single('avatar'), uploadAvatar);