import styles from './Loader.module.css';

export default function Loader({ fullscreen = false, message = 'Loading…', size = 'md' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  const px = sizes[size] || 32;

  const inner = (
    <div className={styles.wrapper} style={{ gap: message ? 16 : 0 }}>
      <svg width={px} height={px} viewBox="0 0 32 32" className={styles.spinner}>
        <circle cx="16" cy="16" r="12" fill="none" stroke="var(--border-subtle)" strokeWidth="2.5" />
        <circle
          cx="16" cy="16" r="12" fill="none"
          stroke="var(--accent-primary)" strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="28 60"
        />
      </svg>
      {message && <p className={styles.msg}>{message}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>HostelEase</span>
        </div>
        {inner}
      </div>
    );
  }

  return inner;
}
