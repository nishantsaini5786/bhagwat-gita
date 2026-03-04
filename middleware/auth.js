// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────
//  Protect routes - JWT Authentication
// ─────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Then check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  Require email verification
// ─────────────────────────────────────────────
exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email first',
      needsVerification: true
    });
  }
  next();
};

// ─────────────────────────────────────────────
//  Optional authentication (doesn't fail if no token)
// ─────────────────────────────────────────────
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -refreshToken');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid but continue as unauthenticated
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};