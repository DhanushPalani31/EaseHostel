import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard, Package, ClipboardList, Users, Tag,
  BarChart3, Boxes, LogOut, Menu, Truck, PackagePlus, MapPin
} from 'lucide-react';
import { logout } from '../store/slices/authSlice.js';
import { useAuth } from '../hooks/index.js';

const NAV = [
  { to: '/admin',                   icon: LayoutDashboard, label: 'Dashboard',      exact: true },
  { to: '/admin/products',          icon: Package,         label: 'Products' },
  { to: '/admin/inventory',         icon: Boxes,           label: 'Inventory' },
  { to: '/admin/orders',            icon: ClipboardList,   label: 'Orders' },
  { to: '/admin/analytics',         icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/coupons',           icon: Tag,             label: 'Coupons' },
  { to: '/admin/users',             icon: Users,           label: 'Users' },
  { to: '/admin/custom-requests',   icon: PackagePlus,     label: 'Custom Requests', divider: true },
  { to: '/admin/deliveries',        icon: Truck,           label: 'Deliveries' },
  { to: '/admin/delivery-staff',    icon: Users,           label: 'Staff' },
  { to: '/admin/pickup-queue',      icon: MapPin,          label: 'Pickup Queue' },
];

export default function AdminLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const Sidebar = () => (
    <aside className="w-56 flex flex-col h-full bg-stone-950 text-stone-400">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-stone-800/60">
        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">H</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white tracking-tight">HostelEase</p>
          <p className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, exact, divider }) => (
          <React.Fragment key={to}>
          {divider && <div className="h-px bg-stone-800/60 my-2" />}
          <NavLink key={to} to={to} end={exact} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                ? 'bg-white/10 text-white'
                : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </NavLink>
          </React.Fragment>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-stone-800/60 space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-white">{user?.name}</p>
          <p className="text-xs text-stone-500">Administrator</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                     text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden h-14 bg-white border-b border-stone-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-stone-100">
            <Menu size={20} className="text-stone-600" />
          </button>
          <span className="font-semibold text-stone-900">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
