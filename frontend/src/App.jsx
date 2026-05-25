import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth, useSocket } from './hooks/index.js';
import { fetchProfile } from './store/slices/authSlice.js';
import { fetchCart } from './store/slices/cartSlice.js';
import { fetchNotifications } from './store/slices/notificationSlice.js';

// Layouts
import PublicLayout  from './layouts/PublicLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import AdminLayout   from './layouts/AdminLayout.jsx';

// Public pages (eager loaded – small)
import LandingPage  from './pages/public/LandingPage.jsx';
import LoginPage    from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';

// Student pages (lazy loaded)
const StudentDashboard  = lazy(() => import('./pages/student/StudentDashboard.jsx'));
const ProductsPage      = lazy(() => import('./pages/student/ProductsPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/student/ProductDetailPage.jsx'));
const CartPage          = lazy(() => import('./pages/student/CartPage.jsx'));
const CheckoutPage      = lazy(() => import('./pages/student/CheckoutPage.jsx'));
const OrdersPage        = lazy(() => import('./pages/student/OrdersPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage.jsx'));
const WishlistPage      = lazy(() => import('./pages/student/WishlistPage.jsx'));
const ProfilePage       = lazy(() => import('./pages/student/ProfilePage.jsx'));
// V2 Student pages
const CustomOrderPage      = lazy(() => import('./pages/student/CustomOrderPage.jsx'));
const ExternalDeliveryPage = lazy(() => import('./pages/student/ExternalDeliveryPage.jsx'));
const DeliveryTrackingPage = lazy(() => import('./pages/student/DeliveryTrackingPage.jsx'));

// Admin pages (lazy loaded)
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts     = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminCoupons      = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminAnalytics    = lazy(() => import('./pages/admin/AdminAnalytics.jsx'));
const AdminInventory    = lazy(() => import('./pages/admin/AdminInventory.jsx'));
// V2 Admin pages
const AdminCustomRequests     = lazy(() => import('./pages/admin/AdminCustomRequests.jsx'));
const AdminDeliveryManagement = lazy(() => import('./pages/admin/AdminDeliveryManagement.jsx'));
const AdminDeliveryStaff      = lazy(() => import('./pages/admin/AdminDeliveryStaff.jsx'));
const AdminPickupQueue        = lazy(() => import('./pages/admin/AdminPickupQueue.jsx'));

// Route guards
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

// Page loader
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-stone-300 border-t-brand-500 rounded-full animate-spin" />
  </div>
);

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  // Initialize socket for real-time notifications
  useSocket();

  // Bootstrap user session on app load
  useEffect(() => {
    const token = localStorage.getItem('he_token');
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        </Route>

        {/* ── Student ────────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="student"><StudentLayout /></ProtectedRoute>}>
          <Route path="/dashboard"        element={<StudentDashboard />} />
          <Route path="/products"         element={<ProductsPage />} />
          <Route path="/products/:id"     element={<ProductDetailPage />} />
          <Route path="/cart"             element={<CartPage />} />
          <Route path="/checkout"         element={<CheckoutPage />} />
          <Route path="/orders"           element={<OrdersPage />} />
          <Route path="/notifications"    element={<NotificationsPage />} />
          <Route path="/wishlist"         element={<WishlistPage />} />
          <Route path="/profile"          element={<ProfilePage />} />
          {/* V2 Student routes */}
          <Route path="/custom-orders"    element={<CustomOrderPage />} />
          <Route path="/parcel-request"   element={<ExternalDeliveryPage />} />
          <Route path="/parcel-tracking/:id" element={<DeliveryTrackingPage />} />
        </Route>

        {/* ── Admin ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin"            element={<AdminDashboard />} />
          <Route path="/admin/products"   element={<AdminProducts />} />
          <Route path="/admin/orders"     element={<AdminOrders />} />
          <Route path="/admin/users"      element={<AdminUsers />} />
          <Route path="/admin/coupons"    element={<AdminCoupons />} />
          <Route path="/admin/analytics"  element={<AdminAnalytics />} />
          <Route path="/admin/inventory"  element={<AdminInventory />} />
          {/* V2 Admin routes */}
          <Route path="/admin/custom-requests"  element={<AdminCustomRequests />} />
          <Route path="/admin/deliveries"       element={<AdminDeliveryManagement />} />
          <Route path="/admin/delivery-staff"   element={<AdminDeliveryStaff />} />
          <Route path="/admin/pickup-queue"     element={<AdminPickupQueue />} />
        </Route>

        {/* ── Fallback ───────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
