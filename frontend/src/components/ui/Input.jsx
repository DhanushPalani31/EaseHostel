import { memo, forwardRef } from 'react';

/**
 * Input – accessible, styled text input with leading icon & error state.
 */
const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  iconRight,
  helperText,
  className = '',
  required,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        )}

        <input
          ref={ref}
          className={`input ${Icon ? 'pl-9' : ''} ${iconRight ? 'pr-9' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />

        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            {iconRight}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-stone-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
