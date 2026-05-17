import asyncHandler from '../utils/asyncHandler.js';
import authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, 201, 'Account created successfully', result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, 200, 'Login successful', result);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  sendSuccess(res, 200, 'Profile fetched', { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, hostelBlock, roomNumber, phoneNumber } = req.body;
  const updateData = { name, hostelBlock, roomNumber, phoneNumber };

  if (req.file) {
    updateData.profileImage = req.file.path;
  }

  const { default: User } = await import('../models/User.js');
  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true, runValidators: true
  }).select('-password -refreshToken');

  sendSuccess(res, 200, 'Profile updated', { user });
});
