import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/misc.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/',              protect, getCart);
router.post('/',             protect, addToCart);
router.put('/:productId',    protect, updateCartItem);
router.delete('/clear',      protect, clearCart);
router.delete('/:productId', protect, removeCartItem);
export default router;
