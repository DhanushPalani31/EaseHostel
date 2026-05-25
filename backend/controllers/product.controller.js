import asyncHandler from '../utils/asyncHandler.js';
import productService from '../services/product.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';

export const getProducts = asyncHandler(async (req, res) => {
  const { products, pagination } = await productService.getProducts(req.query);
  sendPaginated(res, 200, 'Products fetched', products, pagination);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, 200, 'Product fetched', { product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.file);
  sendSuccess(res, 201, 'Product created', { product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.file);
  sendSuccess(res, 200, 'Product updated', { product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, 200, 'Product deleted', {});
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await productService.addReview(
    req.params.id,
    req.user._id.toString(),
    req.user.name,
    { rating: Number(rating), comment }
  );
  sendSuccess(res, 200, 'Review submitted', { product });
});

export const getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await productService.getTrending();
  sendSuccess(res, 200, 'Trending products', { products });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await productService.getLowStock(Number(req.query.threshold) || 10);
  sendSuccess(res, 200, 'Low stock products', { products });
});
