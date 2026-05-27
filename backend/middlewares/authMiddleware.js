import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * protect – verifies Bearer JWT and attaches req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authorized – no token provided');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password -refreshToken');
  if (!user || !user.isActive) {
    const error = new Error('Not authorized – user not found or deactivated');
    error.statusCode = 401;
    return next(error);
  }

  req.user = user;
  next();
});


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(`Access denied – role '${req.user.role}' is not permitted`);
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
