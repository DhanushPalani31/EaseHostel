import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Package, CreditCard, Megaphone, Info } from 'lucide-react';
import { fetchNotifications, markRead, markAllRead } from '../../store/slices/notificationSlice.js';
import { timeAgo } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const TYPE_CONFIG = {
  order:   { icon: Package,    bg: 'bg-blue-50',   iconColor: 'text-blue-500' },
  payment: { icon: CreditCard, bg: 'bg-green-50',  iconColor: 'text-green-500' },
  promo:   { icon: Megaphone,  bg: 'bg-amber-50',  iconColor: 'text-amber-500' },
  system:  { icon: Info,       bg: 'bg-stone-50',  iconColor: 'text-stone-500' },
  delivery:{ icon: Package,    bg: 'bg-purple-50', iconColor: 'text-purple-500' }
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items: notifications, loading, unreadCount } = useSelector(s => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const handleMarkRead = (id, isRead) => {
    if (!isRead) dispatch(markRead(id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Notifications</h1>
          {unreadCount > 0 && <p className="text-stone-400 text-sm mt-0.5">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => dispatch(markAllRead())}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors font-medium">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={36} className="text-stone-300 mx-auto mb-3"/>
          <p className="text-stone-500">No notifications yet</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
          {notifications.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon   = config.icon;
            return (
              <motion.div key={n._id} variants={staggerItem}
                onClick={() => handleMarkRead(n._id, n.isRead)}
                className={`card p-4 flex items-start gap-3 cursor-pointer transition-all duration-150 hover:shadow-panel
                  ${!n.isRead ? 'border-stone-300 bg-stone-50/50' : ''}`}>
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={config.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.isRead ? 'text-stone-500' : 'text-stone-900 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
