import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, ShoppingCart, ClipboardList,
  Bell, Heart, User, LogOut, Menu, X, Store,
  Truck, PackagePlus
} from 'lucide-react';
import { logout } from '../store/slices/authSlice.js';
import { useAuth } from '../hooks/index.js';
import { getCartCount } from '../utils/index.js';

const NAV = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',       icon: Store,            label: 'Shop' },
  { to: '/cart',           icon: ShoppingCart,     label: 'Cart' },
  { to: '/orders',         icon: ClipboardList,    label: 'Orders' },
  { to: '/custom-orders',  icon: PackagePlus,      label: 'Custom Order' },
  { to: '/parcel-request', icon: Truck,            label: 'Parcel Pickup' },
  { to: '/wishlist',       icon: Heart,            label: 'Wishlist' },
  { to: '/notifications',  icon: Bell,             label: 'Notifications' },
  { to: '/profile',        icon: User,             label: 'Profile' }
];

export default function StudentLayout() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const cart        = useSelector(s => s.cart.cart);
  const unread      = useSelector(s => s.notifications.unreadCount);
  const cartCount   = getCartCount(cart);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-72' : 'w-60'} flex flex-col h-full bg-white border-r border-stone-200/80`}>
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-stone-100">
        <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">H</span>
        </div>
        <span className="font-semibold text-stone-900 tracking-tight">HostelEase</span>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
            {user?.profileImage
              ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-stone-500">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{user?.name}</p>
            <p className="text-xs text-stone-400 truncate">
              {user?.hostelBlock ? `Block ${user.hostelBlock}, Room ${user.roomNumber}` : 'Student'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative
               ${isActive
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className="flex-shrink-0" />
                {label}
                {/* Badges */}
                {label === 'Cart' && cartCount > 0 && (
                  <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-white/20 text-white' : 'bg-brand-500 text-white'}`}>
                    {cartCount}
                  </span>
                )}
                {label === 'Notifications' && unread > 0 && (
                  <span className={`ml-auto w-2 h-2 rounded-full
                    ${isActive ? 'bg-white/60' : 'bg-red-500'}`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-stone-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                     text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden h-14 bg-white border-b border-stone-200/80 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="btn-ghost btn-sm p-1.5">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-stone-900 tracking-tight flex-1">HostelEase</span>
          <Link to="/cart" className="relative btn-ghost btn-sm p-1.5">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
