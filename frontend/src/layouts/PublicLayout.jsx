import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PublicLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Minimal nav for auth pages */}
      {!isLanding && (
        <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
          <div className="page-container h-14 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <span className="font-semibold text-stone-900 tracking-tight">HostelEase</span>
            </Link>
          </div>
        </nav>
      )}
      <main className={!isLanding ? 'pt-14' : ''}>
        <Outlet />
      </main>
    </div>
  );
}
