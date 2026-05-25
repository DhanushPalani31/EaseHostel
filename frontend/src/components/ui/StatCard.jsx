import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard – KPI metric card for dashboards.
 * Shows icon, value, label, optional trend indicator and sub-text.
 */
const StatCard = memo(({
  label,
  value,
  sub,
  icon: Icon,
  iconBg   = 'bg-stone-100',
  trend,          // { value: '+12%', direction: 'up' | 'down' }
  className = ''
}) => (
  <motion.div
    whileHover={{ y: -1 }}
    transition={{ duration: 0.15 }}
    className={`card p-5 ${className}`}
  >
    <div className="flex items-start justify-between mb-4">
      {Icon && (
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className="text-stone-600" />
        </div>
      )}
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
          ${trend.direction === 'up'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-600'
          }`}>
          {trend.direction === 'up'
            ? <ArrowUpRight size={12} />
            : <ArrowDownRight size={12} />
          }
          {trend.value}
        </div>
      )}
    </div>

    <p className="text-2xl font-bold text-stone-900 tracking-tighter leading-none mb-1">
      {value}
    </p>
    <p className="text-sm font-medium text-stone-600">{label}</p>
    {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
  </motion.div>
));

StatCard.displayName = 'StatCard';
export default StatCard;
