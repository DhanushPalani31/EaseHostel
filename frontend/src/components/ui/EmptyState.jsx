import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * EmptyState – consistent empty/zero-data UI with optional CTA.
 */
const EmptyState = memo(({
  emoji  = '📦',
  title  = 'Nothing here yet',
  description,
  action,         // { label, onClick } or JSX
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
  >
    <div className="text-5xl mb-4 select-none">{emoji}</div>
    <h3 className="text-base font-semibold text-stone-700 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-stone-400 max-w-xs leading-relaxed">{description}</p>
    )}
    {action && (
      <div className="mt-5">
        {typeof action === 'object' && action.label ? (
          <button onClick={action.onClick} className="btn-primary btn-sm">
            {action.label}
          </button>
        ) : action}
      </div>
    )}
  </motion.div>
));

EmptyState.displayName = 'EmptyState';
export default EmptyState;
