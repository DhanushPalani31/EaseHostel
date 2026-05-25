import { memo } from 'react';
import { motion } from 'framer-motion';
import { Package, X, RotateCcw } from 'lucide-react';
import PriorityBadge from './PriorityBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/index.js';

const STATUS_CONFIG = {
  Pending:    { cls: 'badge-amber',  dot: 'bg-amber-400',  label: 'Pending' },
  Reviewing:  { cls: 'badge-blue',   dot: 'bg-blue-400',   label: 'Reviewing' },
  Approved:   { cls: 'badge-green',  dot: 'bg-green-400',  label: 'Approved' },
  Purchasing: { cls: 'badge-blue',   dot: 'bg-blue-500',   label: 'Purchasing' },
  Delivered:  { cls: 'badge-green',  dot: 'bg-green-500',  label: 'Delivered' },
  Rejected:   { cls: 'badge-red',    dot: 'bg-red-400',    label: 'Rejected' },
  Cancelled:  { cls: 'badge-stone',  dot: 'bg-stone-400',  label: 'Cancelled' },
};

/**
 * CustomOrderCard – compact card for custom order list views.
 */
const CustomOrderCard = memo(({ order, onCancel, onReorder }) => {
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const canCancel = ['Pending', 'Reviewing'].includes(order.status);
  const isDone    = ['Delivered', 'Rejected', 'Cancelled'].includes(order.status);

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`card overflow-hidden ${isDone ? 'opacity-80' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
            {order.referenceImages?.[0]
              ? <img src={order.referenceImages[0]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 truncate">{order.productName}</p>
                {order.brandName && (
                  <p className="text-xs text-stone-400">{order.brandName}</p>
                )}
              </div>
              {order.finalPrice && (
                <p className="text-sm font-bold text-stone-900 flex-shrink-0">
                  {formatCurrency(order.finalPrice)}
                </p>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`badge ${statusCfg.cls} text-[10px]`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              <PriorityBadge priority={order.priority} showIcon={false} />
              <span className="badge badge-stone text-[10px]">{order.category}</span>
              <span className="text-[10px] text-stone-400">Qty: {order.quantity}</span>
            </div>

            {/* Admin note */}
            {order.adminNote && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-[11px] text-blue-700 leading-snug">
                  <span className="font-semibold">Admin: </span>{order.adminNote}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2.5">
              <p className="text-[10px] text-stone-400">{formatDate(order.createdAt)}</p>
              <div className="flex items-center gap-2">
                {onReorder && order.status === 'Delivered' && (
                  <button onClick={() => onReorder(order)}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-500
                      hover:text-stone-900 transition-colors">
                    <RotateCcw size={10} /> Reorder
                  </button>
                )}
                {canCancel && onCancel && (
                  <button onClick={() => onCancel(order._id)}
                    className="flex items-center gap-1 text-[11px] font-medium text-red-500
                      hover:text-red-700 transition-colors">
                    <X size={10} /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CustomOrderCard.displayName = 'CustomOrderCard';
export default CustomOrderCard;
