// ─── Order Status ──────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING:    'Pending',
  PROCESSING: 'Processing',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled'
};

// ─── Payment Status ────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING:  'Pending',
  PAID:     'Paid',
  FAILED:   'Failed',
  REFUNDED: 'Refunded'
};

// ─── Payment Gateways ──────────────────────────────────────────────
export const PAYMENT_GATEWAY = {
  RAZORPAY: 'Razorpay',
  COD:      'Cash on Delivery'
};

// ─── User Roles ────────────────────────────────────────────────────
export const ROLES = {
  STUDENT: 'student',
  ADMIN:   'admin'
};

// ─── Product Categories ────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'Snacks',
  'Stationery',
  'Toiletries',
  'Drinks',
  'Instant Foods',
  'Daily Essentials',
  'Personal Care'
];

// ─── Notification Types ────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  ORDER:    'order',
  PAYMENT:  'payment',
  PROMO:    'promo',
  SYSTEM:   'system',
  DELIVERY: 'delivery'
};

// ─── Delivery Slots ────────────────────────────────────────────────
export const DELIVERY_SLOTS = [
  '8:00 AM – 10:00 AM',
  '12:00 PM – 2:00 PM',
  '4:00 PM – 6:00 PM',
  '7:00 PM – 9:00 PM'
];

// ─── Pagination Defaults ───────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT:     50
};
