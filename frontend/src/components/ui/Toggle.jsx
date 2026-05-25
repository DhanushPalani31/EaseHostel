import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Toggle – animated on/off switch component.
 */
const Toggle = memo(({ checked, onChange, label, disabled = false, size = 'md' }) => {
  const sizes = {
    sm: { track: 'w-8 h-4',   thumb: 'w-3 h-3',   translate: 'translate-x-4', start: 'translate-x-0.5' },
    md: { track: 'w-10 h-5',  thumb: 'w-4 h-4',   translate: 'translate-x-5', start: 'translate-x-0.5' },
    lg: { track: 'w-12 h-6',  thumb: 'w-5 h-5',   translate: 'translate-x-6', start: 'translate-x-0.5' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`relative ${s.track} rounded-full transition-colors duration-200 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-brand-400/60
          ${checked ? 'bg-stone-900' : 'bg-stone-200'}`}
      >
        <motion.div
          className={`absolute top-0.5 ${s.thumb} bg-white rounded-full shadow-xs`}
          animate={{ x: checked ? parseInt(s.translate.replace('translate-x-', '')) * 4 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-stone-700 select-none">{label}</span>
      )}
    </label>
  );
});

Toggle.displayName = 'Toggle';
export default Toggle;
