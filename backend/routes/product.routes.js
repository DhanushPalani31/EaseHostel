import express from 'express';
import {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, addReview, getTrendingProducts, getLowStockProducts
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadProductImage } from '../config/cloudinary.js';
import { productValidation } from '../validations/auth.validation.js';
import { validate } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/',          getProducts);
router.get('/trending',  getTrendingProducts);
router.get('/low-stock', protect, authorize('admin'), getLowStockProducts);
router.get('/:id',       getProductById);

router.post('/',
  protect, authorize('admin'),
  uploadProductImage.single('image'),
  productValidation, validate,
  createProduct
);
router.put('/:id',
  protect, authorize('admin'),
  uploadProductImage.single('image'),
  updateProduct
);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/review', protect, authorize('student'), addReview);

export default router;
