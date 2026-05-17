import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, LogOut,
  Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { getInitials } from '../../utils/helpers';
import styles from './AdminLayout.module.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = () => (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⬡</span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              className={styles.logoText}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              HostelEase
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className={styles.roleBadge}>
          <span className={styles.roleLabel}>Admin Panel</span>
        </div>
      )}

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navActive : ''].join(' ')
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} className={styles.navIcon} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className={styles.navLabel}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {!collapsed && <ChevronRight size={14} className={styles.navChevron} />}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={styles.userSection}>
        <div className={styles.avatar}>{getInitials(user?.name)}</div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className={styles.userInfo}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userRole}>Administrator</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );

  return (
    <div className={styles.layout}>
      {/* Desktop sidebar */}
      <div className={styles.desktopSidebar}>
        <SidebarContent />
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((p) => !p)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileSidebar}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className={styles.main}>
        {/* Mobile topbar */}
        <header className={styles.mobileTopbar}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span className={styles.mobileTitle}>HostelEase</span>
          <button className={styles.notifBtn}>
            <Bell size={18} />
          </button>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
