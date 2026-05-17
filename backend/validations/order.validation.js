import { body } from 'express-validator';
import { PAYMENT_GATEWAY, DELIVERY_SLOTS } from '../constants/index.js';

export const orderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product')
    .notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod')
    .isIn(Object.values(PAYMENT_GATEWAY))
    .withMessage('Invalid payment method'),
  body('deliveryNotes')
    .optional()
    .isLength({ max: 300 }).withMessage('Delivery notes too long')
];

export const couponValidation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ max: 20 }).withMessage('Invalid coupon code'),
  body('orderAmount')
    .isFloat({ min: 0 }).withMessage('Order amount must be a positive number')
];

export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 }).withMessage('Comment too long')
];
