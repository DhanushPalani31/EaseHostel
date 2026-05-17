export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export const formatDateShort = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));

export const getStatusColor = (status) => {
  const map = {
    Pending: 'var(--status-pending)',
    Processing: 'var(--status-processing)',
    Delivered: 'var(--status-delivered)',
    Cancelled: 'var(--status-cancelled)',
  };
  return map[status] || 'var(--text-secondary)';
};

export const getStatusBg = (status) => {
  const map = {
    Pending: 'rgba(245,166,35,0.12)',
    Processing: 'rgba(79,158,255,0.12)',
    Delivered: 'rgba(74,222,128,0.12)',
    Cancelled: 'rgba(248,113,113,0.12)',
  };
  return map[status] || 'var(--bg-elevated)';
};

export const CATEGORIES = ['All', 'Snacks', 'Stationery', 'Toiletries', 'Beverages', 'Other'];
export const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

export const getCategoryEmoji = (category) => {
  const map = {
    Snacks: '🍿',
    Stationery: '✏️',
    Toiletries: '🧴',
    Beverages: '☕',
    Other: '📦',
    All: '🛍️',
  };
  return map[category] || '📦';
};

export const truncate = (str, n = 60) => (str?.length > n ? str.slice(0, n) + '…' : str);

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
