import { memo } from 'react';

/**
 * Badge – semantic status/label pill.
 */
const Badge = memo(({ children, variant = 'stone', dot = false, className = '' }) => {
  const variants = {
    green:  'badge-green',
    red:    'badge-red',
    amber:  'badge-amber',
    blue:   'badge-blue',
    stone:  'badge-stone',
    purple: 'badge bg-purple-100 text-purple-700',
  };

  return (
    <span className={`badge ${variants[variant] || variants.stone} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          variant === 'green' ? 'bg-green-500' :
          variant === 'red'   ? 'bg-red-500'   :
          variant === 'amber' ? 'bg-amber-500' :
          variant === 'blue'  ? 'bg-blue-500'  : 'bg-stone-400'
        }`} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
export default Badge;
