import jwt from 'jsonwebtoken';

/**
 * Generate short-lived access token (7 days default)
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate long-lived refresh token (30 days default)
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

/**
 * Verify any JWT token
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
