import styles from './Input.module.css';

export default function Input({
  label,
  error,
  icon: Icon,
  hint,
  className = '',
  ...props
}) {
  return (
    <div className={[styles.group, className].join(' ')}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {Icon && <Icon size={16} className={styles.icon} />}
        <input
          className={[styles.input, Icon ? styles.hasIcon : '', error ? styles.hasError : ''].filter(Boolean).join(' ')}
          {...props}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
