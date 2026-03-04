// controllers/authController.js - COMPLETE FIXED VERSION
// Email verification DISABLED for testing - users auto-verified

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies
} = require('../utils/tokenHelper');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../utils/emailService');

// ─────────────────────────────────────────────
//  Register new user (AUTO-VERIFIED)
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, age, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.'
      });
    }

    // Create user - AUTO VERIFIED (no email verification needed)
    const user = await User.create({
      name,
      email,
      password,
      age: age || undefined,
      phone: phone || undefined,
      isVerified: true, // ✅ AUTO-VERIFIED! No email needed
      verificationToken: undefined,
      verificationTokenExpire: undefined
    });

    // Optional: Send welcome email (but don't wait for it)
    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: `Account created successfully! You can now login.`,
      needsVerification: false // ✅ No verification needed
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// ─────────────────────────────────────────────
//  Login (NO VERIFICATION REQUIRED)
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if Google-only account
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Please login with Google.'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ AUTO-VERIFY if somehow not verified (backward compatibility)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      console.log(`✅ Auto-verified user during login: ${user.email}`);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Remove sensitive data
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    delete userData.verificationToken;

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! 🙏`,
      accessToken,
      user: userData
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// ─────────────────────────────────────────────
//  Logout
// ─────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    // Clear refresh token in DB
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    // Clear cookies
    clearTokenCookies(res);

    // Destroy session
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully. 🙏'
    });

  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Logout failed.'
    });
  }
};

// ─────────────────────────────────────────────
//  Get current user
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -verificationToken -resetPasswordToken -refreshToken');

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// ─────────────────────────────────────────────
//  Verify email (KEPT FOR COMPATIBILITY - but auto-verifies)
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      // Instead of error, just redirect to login (verification not needed)
      return res.redirect(`${process.env.FRONTEND_URL}/login.html?verified=auto`);
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Send welcome email (optional)
    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
    }

    // Auto-login
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard.html?verified=true`);

  } catch (err) {
    console.error('Verify email error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login.html`);
  }
};

// ─────────────────────────────────────────────
//  Forgot password
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email exists, a reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await sendPasswordResetEmail(user, resetToken);
      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email!'
      });
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again.'
      });
    }

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─────────────────────────────────────────────
//  Reset password
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired.'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Auto-login
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      accessToken
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    });
  }
};

// ─────────────────────────────────────────────
//  Refresh token
// ─────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });

  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// ─────────────────────────────────────────────
//  Google OAuth callback
// ─────────────────────────────────────────────
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // Ensure user is verified (Google accounts are trusted)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard.html`);

  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login.html?error=google_failed`);
  }
};