// ─── Currency ────────────────────────────────────────────────────
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// ─── Date ─────────────────────────────────────────────────────────
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

export const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// ─── Status helpers ───────────────────────────────────────────────
export const getOrderStatusColor = (status) => {
  const map = {
    Pending:    'badge-amber',
    Processing: 'badge-blue',
    Delivered:  'badge-green',
    Cancelled:  'badge-red'
  };
  return map[status] || 'badge-stone';
};

export const getPaymentStatusColor = (status) => {
  const map = {
    Pending:  'badge-amber',
    Paid:     'badge-green',
    Failed:   'badge-red',
    Refunded: 'badge-blue'
  };
  return map[status] || 'badge-stone';
};

// ─── String helpers ───────────────────────────────────────────────
export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '…' : str;

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// ─── Cart helpers ─────────────────────────────────────────────────
export const getCartCount = (cart) =>
  cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

// ─── Number ──────────────────────────────────────────────────────
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
