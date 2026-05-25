import { memo } from 'react';
import { Zap, ArrowUp, Minus, ArrowDown } from 'lucide-react';

const PRIORITY_MAP = {
  urgent: { label: 'Urgent', icon: Zap,       cls: 'bg-red-100   text-red-700   border-red-200' },
  high:   { label: 'High',   icon: ArrowUp,   cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  medium: { label: 'Medium', icon: Minus,     cls: 'bg-blue-100  text-blue-700  border-blue-200' },
  low:    { label: 'Low',    icon: ArrowDown, cls: 'bg-stone-100 text-stone-600 border-stone-200' },
};

/**
 * PriorityBadge – shows priority level with icon for custom orders.
 */
const PriorityBadge = memo(({ priority, showIcon = true }) => {
  const cfg  = PRIORITY_MAP[priority] || PRIORITY_MAP.medium;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold capitalize
      ${cfg.cls}`}>
      {showIcon && <Icon size={10} />}
      {cfg.label}
    </span>
  );
});

PriorityBadge.displayName = 'PriorityBadge';
export default PriorityBadge;
