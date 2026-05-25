import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/misc.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/',  protect, getWishlist);
router.post('/', protect, toggleWishlist);
export default router;
