import { memo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { markRead } from '../../store/slices/notificationSlice.js';
import { timeAgo } from '../../utils/index.js';
import { useClickOutside } from '../../hooks/index.js';

/**
 * NotificationBell – dropdown bell with unread badge and quick-read list.
 */
const NotificationBell = memo(() => {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector(s => s.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false));

  const recent = items.slice(0, 6);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl
                   text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all duration-150"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white
                       text-[10px] font-bold rounded-full flex items-center justify-center px-0.5"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-modal border border-stone-200/80 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-red text-[10px]">{unreadCount} new</span>
              )}
            </div>

            {/* List */}
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
                {recent.map(n => (
                  <div
                    key={n._id}
                    onClick={() => { dispatch(markRead(n._id)); }}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-stone-50
                      ${!n.isRead ? 'bg-stone-50/80' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                      ${!n.isRead ? 'bg-brand-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${!n.isRead ? 'text-stone-900 font-medium' : 'text-stone-500'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-stone-100">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';
export default NotificationBell;
