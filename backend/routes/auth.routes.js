// auth.routes.js
import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { uploadProfileImage } from '../config/cloudinary.js';

const router = express.Router();
router.post('/register', registerValidation, validate, register);
router.post('/login',    loginValidation,    validate, login);
router.get('/profile',   protect, getProfile);
router.put('/profile',   protect, uploadProfileImage.single('profileImage'), updateProfile);
export default router;
