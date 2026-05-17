import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { generateInvoiceHTML } from '../utils/invoiceGenerator.js';

/**
 * GET /api/orders/:id/invoice
 * Returns an HTML invoice for download/print
 */
export const downloadInvoice = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    return next(err);
  }

  // Students can only download their own invoices
  if (req.user.role === 'student' && order.user.toString() !== req.user._id.toString()) {
    const err = new Error('Not authorized to access this invoice');
    err.statusCode = 403;
    return next(err);
  }

  const user = await User.findById(order.user).lean();
  const html = generateInvoiceHTML(order.toObject(), user);

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `inline; filename="invoice-${order.invoiceId}.html"`);
  res.send(html);
});
