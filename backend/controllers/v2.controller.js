import asyncHandler from '../utils/asyncHandler.js';
import customOrderService    from '../services/customOrder.service.js';
import externalDeliveryService from '../services/externalDelivery.service.js';
import deliveryStaffService  from '../services/deliveryStaff.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';

// ═══════════════════════════════════════════════════════════
// CUSTOM ORDER CONTROLLERS
// ═══════════════════════════════════════════════════════════

export const createCustomOrder = asyncHandler(async (req, res) => {
  const order = await customOrderService.create(req.user._id, req.body, req.files || []);
  sendSuccess(res, 201, 'Custom order submitted successfully', { order });
});

export const getMyCustomOrders = asyncHandler(async (req, res) => {
  const orders = await customOrderService.getByUser(req.user._id);
  sendSuccess(res, 200, 'Custom orders fetched', { orders });
});

export const getAllCustomOrders = asyncHandler(async (req, res) => {
  const { orders, pagination } = await customOrderService.getAll(req.query);
  sendPaginated(res, 200, 'All custom orders', orders, pagination);
});

export const getCustomOrderById = asyncHandler(async (req, res) => {
  const order = await customOrderService.getById(req.params.id);
  sendSuccess(res, 200, 'Custom order fetched', { order });
});

export const updateCustomOrderStatus = asyncHandler(async (req, res) => {
  const io    = req.app.get('io');
  const order = await customOrderService.updateStatus(
    req.params.id,
    req.body,
    req.user._id,
    io
  );
  sendSuccess(res, 200, 'Status updated', { order });
});

export const cancelCustomOrder = asyncHandler(async (req, res) => {
  const order = await customOrderService.cancel(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Custom order cancelled', { order });
});

export const getCustomOrderAnalytics = asyncHandler(async (req, res) => {
  const data = await customOrderService.getAnalytics();
  sendSuccess(res, 200, 'Custom order analytics', data);
});

// ═══════════════════════════════════════════════════════════
// EXTERNAL DELIVERY CONTROLLERS
// ═══════════════════════════════════════════════════════════

export const createExternalDelivery = asyncHandler(async (req, res) => {
  const screenshotFile = req.file || null;
  const delivery = await externalDeliveryService.create(req.user._id, req.body, screenshotFile);
  sendSuccess(res, 201, 'Pickup request submitted', { delivery });
});

export const getMyDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await externalDeliveryService.getByUser(req.user._id);
  sendSuccess(res, 200, 'Your deliveries', { deliveries });
});

export const getDeliveryById = asyncHandler(async (req, res) => {
  const delivery = await externalDeliveryService.getById(req.params.id);
  sendSuccess(res, 200, 'Delivery details', { delivery });
});

export const getAllDeliveries = asyncHandler(async (req, res) => {
  const { deliveries, pagination } = await externalDeliveryService.getAll(req.query);
  sendPaginated(res, 200, 'All deliveries', deliveries, pagination);
});

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const io       = req.app.get('io');
  const delivery = await externalDeliveryService.updateStatus(
    req.params.id,
    req.body,
    req.user._id,
    io
  );
  sendSuccess(res, 200, 'Delivery status updated', { delivery });
});

export const assignDeliveryStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.body;
  const io       = req.app.get('io');
  const delivery = await externalDeliveryService.assignStaff(req.params.id, staffId, io);
  sendSuccess(res, 200, 'Staff assigned', { delivery });
});

export const verifyDeliveryOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const delivery = await externalDeliveryService.verifyOTP(req.params.id, otp);
  sendSuccess(res, 200, 'Delivery confirmed!', { delivery });
});

export const cancelDelivery = asyncHandler(async (req, res) => {
  const delivery = await externalDeliveryService.cancel(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Delivery cancelled', { delivery });
});

export const getDeliveryAnalytics = asyncHandler(async (req, res) => {
  const data = await externalDeliveryService.getAnalytics();
  sendSuccess(res, 200, 'Delivery analytics', data);
});

// ═══════════════════════════════════════════════════════════
// DELIVERY STAFF CONTROLLERS
// ═══════════════════════════════════════════════════════════

export const createDeliveryStaff = asyncHandler(async (req, res) => {
  const staff = await deliveryStaffService.create(req.body, req.file);
  sendSuccess(res, 201, 'Delivery staff added', { staff });
});

export const getAllDeliveryStaff = asyncHandler(async (req, res) => {
  const staff = await deliveryStaffService.getAll({
    activeOnly: req.query.activeOnly === 'true'
  });
  sendSuccess(res, 200, 'Delivery staff list', { staff });
});

export const getDeliveryStaffById = asyncHandler(async (req, res) => {
  const staff = await deliveryStaffService.getById(req.params.id);
  sendSuccess(res, 200, 'Staff details', { staff });
});

export const updateDeliveryStaff = asyncHandler(async (req, res) => {
  const staff = await deliveryStaffService.update(req.params.id, req.body);
  sendSuccess(res, 200, 'Staff updated', { staff });
});

export const toggleStaffAvailability = asyncHandler(async (req, res) => {
  const staff = await deliveryStaffService.toggleAvailability(req.params.id);
  sendSuccess(res, 200, `Staff ${staff.isAvailable ? 'available' : 'unavailable'}`, { staff });
});

export const toggleStaffActive = asyncHandler(async (req, res) => {
  const staff = await deliveryStaffService.toggleActive(req.params.id);
  sendSuccess(res, 200, `Staff ${staff.isActive ? 'activated' : 'deactivated'}`, { staff });
});

export const getStaffDeliveries = asyncHandler(async (req, res) => {
  const { deliveries, pagination } = await deliveryStaffService.getStaffDeliveries(
    req.params.id, req.query
  );
  sendPaginated(res, 200, 'Staff deliveries', deliveries, pagination);
});

export const getStaffPerformance = asyncHandler(async (req, res) => {
  const data = await deliveryStaffService.getPerformanceMetrics();
  sendSuccess(res, 200, 'Staff performance metrics', { staff: data });
});

export const deleteDeliveryStaff = asyncHandler(async (req, res) => {
  await deliveryStaffService.delete(req.params.id);
  sendSuccess(res, 200, 'Staff removed', {});
});
