import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Button – polymorphic, accessible, animated button component.
 * Wraps all btn-* utility classes with consistent Framer Motion tap feedback.
 */
const Button = memo(({
  children,
  variant  = 'primary',    // primary | accent | outline | ghost | danger
  size     = 'md',         // sm | md | lg
  loading  = false,
  disabled = false,
  fullWidth = false,
  icon,                    // leading icon element
  iconRight,               // trailing icon element
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const base      = `btn btn-${size}`;
  const variantCls = `btn-${variant}`;
  const widthCls   = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ duration: 0.1 }}
      className={`${base} ${variantCls} ${widthCls} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          {typeof children === 'string' ? `${children}…` : children}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
