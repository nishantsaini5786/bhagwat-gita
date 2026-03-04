// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  googleCallback
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../middleware/validate');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// ─────────────────────────────────────────────
//  Local Auth Routes
// ─────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// ─────────────────────────────────────────────
//  Email Verification
// ─────────────────────────────────────────────
router.get('/verify-email/:token', verifyEmail);

// ─────────────────────────────────────────────
//  Password Reset
// ─────────────────────────────────────────────
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, validate(resetPasswordValidation), resetPassword);

// ─────────────────────────────────────────────
//  Token Refresh
// ─────────────────────────────────────────────
router.post('/refresh-token', refreshToken);

// ─────────────────────────────────────────────
//  Google OAuth Routes
// ─────────────────────────────────────────────
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login.html?error=google_failed`,
    session: true
  }),
  googleCallback
);

module.exports = router;