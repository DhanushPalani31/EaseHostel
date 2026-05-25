import asyncHandler from '../utils/asyncHandler.js';
import orderService from '../services/order.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user._id, req.body);
  sendSuccess(res, 201, 'Order placed successfully', { order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { orders, pagination } = await orderService.getAllOrders(req.query);
  sendPaginated(res, 200, 'Orders fetched', orders, pagination);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);
  sendSuccess(res, 200, 'Orders fetched', { orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const io = req.app.get('io');
  const order = await orderService.updateStatus(req.params.id, status, note, io);
  sendSuccess(res, 200, 'Order status updated', { order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Order cancelled', { order });
});
