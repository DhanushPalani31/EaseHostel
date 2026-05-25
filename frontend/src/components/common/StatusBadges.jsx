import { memo } from 'react';
import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';

const CONFIG = {
  Pending:    { cls: 'badge-amber',  icon: Clock,       label: 'Pending' },
  Processing: { cls: 'badge-blue',   icon: Loader,      label: 'Processing' },
  Delivered:  { cls: 'badge-green',  icon: CheckCircle, label: 'Delivered' },
  Cancelled:  { cls: 'badge-red',    icon: XCircle,     label: 'Cancelled' },
};

const PAY_CONFIG = {
  Pending:  { cls: 'badge-amber', label: 'Pending' },
  Paid:     { cls: 'badge-green', label: 'Paid' },
  Failed:   { cls: 'badge-red',   label: 'Failed' },
  Refunded: { cls: 'badge-blue',  label: 'Refunded' },
};

/**
 * OrderStatusBadge – renders a colour-coded pill for order or payment status.
 */
export const OrderStatusBadge = memo(({ status, showIcon = false }) => {
  const cfg = CONFIG[status] || { cls: 'badge-stone', icon: Clock, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`}>
      {showIcon && <Icon size={10} />}
      {cfg.label}
    </span>
  );
});

export const PaymentStatusBadge = memo(({ status }) => {
  const cfg = PAY_CONFIG[status] || { cls: 'badge-stone', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
});

OrderStatusBadge.displayName  = 'OrderStatusBadge';
PaymentStatusBadge.displayName = 'PaymentStatusBadge';
