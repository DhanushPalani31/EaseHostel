import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Hash, Phone } from 'lucide-react';
import { registerUser, clearError } from '../../store/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', roomNumber: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, error } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
  }, [user, navigate]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    dispatch(registerUser(form));
  };

  return (
    <div className={styles.page}>
      <div className={styles.orb} />

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
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join HostelEase and simplify hostel life</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input label="Full Name" type="text" icon={User} placeholder="Your Name" value={form.name} onChange={set('name')} required autoFocus />

          <Input label="Email Address" type="email" icon={Mail} placeholder="you@hostel.edu" value={form.email} onChange={set('email')} required />

          <div className={styles.passwordGroup}>
            <Input label="Password" type={showPw ? 'text' : 'password'} icon={Lock} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((p) => !p)} tabIndex={-1}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className={styles.row}>
            <Input label="Room Number" type="text" icon={Hash} placeholder="A-101" value={form.roomNumber} onChange={set('roomNumber')} />
            <Input label="Phone" type="tel" icon={Phone} placeholder="98765 43210" value={form.phone} onChange={set('phone')} />
          </div>

          {/* Role selector */}
          <div className={styles.roleSelect}>
            <p className={styles.roleLabel}>Register as</p>
            <div className={styles.roleOptions}>
              {['student', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={[styles.roleOption, form.role === r ? styles.roleActive : ''].join(' ')}
                  onClick={() => setForm((p) => ({ ...p, role: r }))}
                >
                  <span className={styles.roleEmoji}>{r === 'student' ? '🎓' : '⚙️'}</span>
                  <span className={styles.roleName}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <Button type="submit" loading={loading} fullWidth size="lg">Create Account</Button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
