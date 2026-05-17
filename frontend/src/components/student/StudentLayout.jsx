import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, LogOut, Menu, X, Bell } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { getInitials } from '../../utils/helpers';
import styles from './StudentLayout.module.css';

const NAV = [
  { to: '/student', label: 'Shop', icon: Home, end: true },
  { to: '/student/orders', label: 'My Orders', icon: ShoppingBag },
];

export default function StudentLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Top Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          {/* Brand */}
          <NavLink to="/student" className={styles.brand}>
            <span className={styles.brandIcon}>⬡</span>
            <span className={styles.brandText}>HostelEase</span>
          </NavLink>

          {/* Desktop nav links */}
          <nav className={styles.desktopNav}>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navActive : ''].join(' ')
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className={styles.actions}>
            <button className={styles.iconBtn} title="Notifications">
              <Bell size={17} />
            </button>
            <div className={styles.userChip}>
              <div className={styles.avatar}>{getInitials(user?.name)}</div>
              <div className={styles.userMeta}>
                <p className={styles.userName}>{user?.name}</p>
                {user?.roomNumber && (
                  <p className={styles.userRoom}>Room {user.roomNumber}</p>
                )}
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen((p) => !p)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className={styles.mobileMenu}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [styles.mobileNavLink, isActive ? styles.mobileNavActive : ''].join(' ')
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
              <button className={styles.mobileLogout} onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
