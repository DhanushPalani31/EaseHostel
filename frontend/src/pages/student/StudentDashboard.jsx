import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Heart, ArrowRight, Package, TrendingUp } from 'lucide-react';
import { fetchMyOrders } from '../../store/slices/orderSlice.js';
import { fetchTrending } from '../../store/slices/productSlice.js';
import { useAuth } from '../../hooks/index.js';
import { formatCurrency, formatDate, getOrderStatusColor, getCartCount } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';
import ProductCard from '../../components/common/ProductCard.jsx';

const QUICK_LINKS = [
  { to: '/products',  icon: Package,     label: 'Browse Shop',      desc: 'Find what you need' },
  { to: '/orders',    icon: Clock,       label: 'My Orders',        desc: 'Track your purchases' },
  { to: '/wishlist',  icon: Heart,       label: 'Wishlist',         desc: 'Saved items' },
  { to: '/cart',      icon: ShoppingBag, label: 'Cart',             desc: 'Ready to checkout' },
];

export default function StudentDashboard() {
  const dispatch  = useDispatch();
  const { user }  = useAuth();
  const { myOrders, loading: ordersLoading } = useSelector(s => s.orders);
  const { trending } = useSelector(s => s.products);
  const cart      = useSelector(s => s.cart.cart);

  useEffect(() => {
    dispatch(fetchMyOrders());
    dispatch(fetchTrending());
  }, [dispatch]);

  const recentOrders  = myOrders.slice(0, 3);
  const totalSpent    = myOrders.reduce((a, o) => a + o.totalAmount, 0);
  const cartCount     = getCartCount(cart);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-stone-500 text-sm mb-0.5">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{user?.name}</h1>
          {user?.hostelBlock && (
            <p className="text-stone-400 text-sm mt-0.5">Block {user.hostelBlock} · Room {user.roomNumber}</p>
          )}
        </div>
        <Link to="/products" className="btn-primary btn-sm hidden sm:flex">
          Shop now <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders',  value: myOrders.length,         sub: 'all time' },
          { label: 'Total Spent',   value: formatCurrency(totalSpent), sub: 'all orders' },
          { label: 'Cart Items',    value: cartCount,               sub: 'pending checkout' },
          { label: 'This Month',    value: myOrders.filter(o => {
              const d = new Date(o.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length,              sub: 'orders placed' }
        ].map(s => (
          <motion.div key={s.label} variants={staggerItem} className="card p-4">
            <p className="text-xs text-stone-400 font-medium mb-1">{s.label}</p>
            <p className="text-xl font-bold text-stone-900 tracking-tight">{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick links ─────────────────────────────────── */}
      <div>
        <h2 className="section-title mb-4">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to}
              className="card-hover p-4 flex flex-col gap-3 group cursor-pointer">
              <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center
                              group-hover:bg-stone-900 transition-colors duration-200">
                <Icon size={17} className="text-stone-600 group-hover:text-white transition-colors duration-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">{label}</p>
                <p className="text-xs text-stone-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent orders</h2>
          <Link to="/orders" className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="card p-8 text-center">
            <ShoppingBag size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No orders yet</p>
            <Link to="/products" className="btn-outline btn-sm mt-4 inline-flex">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-stone-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">#{order.invoiceId}</p>
                    <p className="text-xs text-stone-400">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`badge ${getOrderStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                  <span className="text-sm font-semibold text-stone-900">{formatCurrency(order.totalAmount)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Trending Products ───────────────────────────── */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-500" />
              <h2 className="section-title">Trending now</h2>
            </div>
            <Link to="/products?sort=popular" className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1">
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
