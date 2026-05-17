import styles from './Button.module.css';
import Loader from './Loader';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <span className={styles.loaderWrap}>
          <Loader size="sm" message="" />
        </span>
      ) : (
        <>
          {Icon && <Icon size={16} className={styles.icon} />}
          {children}
        </>
      )}
    </button>
  );
}
