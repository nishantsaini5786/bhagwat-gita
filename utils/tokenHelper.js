// utils/tokenHelper.js
const jwt = require('jsonwebtoken');

// Generate access token (short-lived)
exports.generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token (long-lived)
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// Set token cookies
exports.setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

// Clear token cookies
exports.clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
};

// Send token response (legacy)
exports.sendTokenResponse = (user, statusCode, res, message) => {
  const accessToken = exports.generateAccessToken(user._id);
  const refreshToken = exports.generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  user.save();

  exports.setTokenCookies(res, accessToken, refreshToken);

  // Remove sensitive data
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    user: userData
  });
};