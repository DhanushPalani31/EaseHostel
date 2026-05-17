import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser, clearError } from '../../store/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, user, error } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      navigate(from || (user.role === 'admin' ? '/admin' : '/student'), { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    dispatch(loginUser(form));
  };

  return (
    <div className={styles.page}>
      <div className={styles.orb} />

      {/* Back to home */}
      <Link to="/" className={styles.backLink}>
        <span className={styles.logoIcon}>⬡</span>
        <span className={styles.logoText}>HostelEase</span>
      </Link>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your HostelEase account</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@hostel.edu"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            autoFocus
            required
          />

          <div className={styles.passwordGroup}>
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw((p) => !p)}
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <Button type="submit" loading={loading} fullWidth size="lg">
            Sign In
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        {/* Demo accounts */}
        <div className={styles.demoAccounts}>
          <p className={styles.demoLabel}>Demo Credentials</p>
          <div className={styles.demoGrid}>
            <button
              className={styles.demoBtn}
              type="button"
              onClick={() => setForm({ email: 'admin@hostel.com', password: 'admin123' })}
            >
              <span className={styles.demoRole}>Admin</span>
              <span className={styles.demoEmail}>admin@hostel.com</span>
            </button>
            <button
              className={styles.demoBtn}
              type="button"
              onClick={() => setForm({ email: 'student@hostel.com', password: 'student123' })}
            >
              <span className={styles.demoRole}>Student</span>
              <span className={styles.demoEmail}>student@hostel.com</span>
            </button>
          </div>
        </div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.switchLink}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
