import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

/**
 * AuthService – encapsulates all auth business logic.
 * Controllers stay thin; all heavy lifting lives here.
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(payload) {
    const { name, email, password, role, hostelBlock, roomNumber, phoneNumber } = payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name, email, password,
      role: role === 'admin' ? 'student' : (role || 'student'), // Prevent self-promoting to admin
      hostelBlock, roomNumber, phoneNumber
    });

    return this._generateTokens(user);
  }

  /**
   * Login an existing user
   */
  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated. Contact support.');
      error.statusCode = 403;
      throw error;
    }

    return this._generateTokens(user);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId)
      .populate('wishlist', 'productName price image category')
      .lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Internal: generate access + refresh tokens and attach to response shape
   */
  _generateTokens(user) {
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const safeUser = {
      _id:         user._id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      hostelBlock: user.hostelBlock,
      roomNumber:  user.roomNumber,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage
    };

    return { user: safeUser, accessToken, refreshToken };
  }
}

export default new AuthService();
