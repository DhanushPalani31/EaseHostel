import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Truck, User, Phone, RefreshCw,
  CheckCircle, ArrowRight, Package, Zap
} from 'lucide-react';
import api from '../../services/api.js';
import { timeAgo, formatDateTime } from '../../utils/index.js';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const PLATFORM_EMOJI = {
  Amazon: '📦', Flipkart: '🛒', Zepto: '⚡',
  'Swiggy Instamart': '🧡', Blinkit: '💛', Myntra: '👗', Other: '🌐'
};

const STATUS_FLOW = {
  Requested:         { next: 'Accepted',          label: 'Accept',       color: 'btn-primary' },
  Accepted:          { next: 'Waiting at Gate',   label: 'Mark at Gate', color: 'btn-accent' },
  'Waiting at Gate': { next: 'Picked Up',         label: 'Mark Picked Up', color: 'btn-accent' },
  'Picked Up':       { next: 'Out for Delivery',  label: 'Start Delivery', color: 'btn-accent' },
  'Out for Delivery':{ next: 'Delivered',         label: 'Mark Delivered', color: 'btn-accent' },
};

export default function AdminPickupQueue() {
  const [queue,     setQueue]     = useState([]);
  const [staff,     setStaff]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [advancing, setAdvancing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [queueRes, staffRes] = await Promise.all([
        api.get('/external-deliveries', {
          params: { status: 'Requested', limit: 50 }
        }),
        api.get('/delivery-staff?activeOnly=true')
      ]);
      setQueue(queueRes.data.data || []);
      setStaff(staffRes.data.data.staff || []);
    } catch { toast.error('Failed to load queue'); }
    finally { setLoading(false); }
  }, []);

  // Load all active (non-delivered) deliveries for the kanban view
  const [kanban, setKanban] = useState({
    Requested: [], Accepted: [], 'Waiting at Gate': [],
    'Picked Up': [], 'Out for Delivery': []
  });

  const loadKanban = useCallback(async () => {
    try {
      const statuses = ['Requested', 'Accepted', 'Waiting at Gate', 'Picked Up', 'Out for Delivery'];
      const results  = await Promise.all(
        statuses.map(s => api.get('/external-deliveries', { params: { status: s, limit: 20 } }))
      );
      const newKanban = {};
      statuses.forEach((s, i) => {
        newKanban[s] = results[i].data.data || [];
      });
      setKanban(newKanban);
    } catch {}
  }, []);

  useEffect(() => {
    loadKanban();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadKanban, 30000);
    return () => clearInterval(interval);
  }, [loadKanban]);

  const advance = async (deliveryId, nextStatus) => {
    setAdvancing(deliveryId);
    try {
      await api.patch(`/external-deliveries/${deliveryId}/status`, {
        status: nextStatus,
        note:   `Status advanced to ${nextStatus}`
      });
      toast.success(`Marked as: ${nextStatus}`);
      loadKanban();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setAdvancing(null); }
  };

  const assignStaff = async (deliveryId, staffId) => {
    try {
      await api.patch(`/external-deliveries/${deliveryId}/assign`, { staffId });
      toast.success('Staff assigned');
      loadKanban();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const totalActive = Object.values(kanban).reduce((a, arr) => a + arr.length, 0);

  const COLUMNS = [
    { key: 'Requested',         label: 'Requested',     color: 'border-amber-300  bg-amber-50',  dot: 'bg-amber-400' },
    { key: 'Accepted',          label: 'Accepted',      color: 'border-blue-300   bg-blue-50',   dot: 'bg-blue-400' },
    { key: 'Waiting at Gate',   label: 'At Gate',       color: 'border-purple-300 bg-purple-50', dot: 'bg-purple-400' },
    { key: 'Picked Up',         label: 'Picked Up',     color: 'border-indigo-300 bg-indigo-50', dot: 'bg-indigo-400' },
    { key: 'Out for Delivery',  label: 'Delivering',    color: 'border-green-300  bg-green-50',  dot: 'bg-green-400' },
  ];

  return (
    <div className="p-5 lg:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Pickup Queue</h1>
          <p className="text-stone-400 text-sm">
            {totalActive} active delivery{totalActive !== 1 ? 's' : ''} in pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>
          <button onClick={loadKanban} className="btn-outline btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map(col => (
          <div key={col.key} className="card p-3 text-center">
            <p className="text-xl font-bold text-stone-900">{kanban[col.key]?.length || 0}</p>
            <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">{col.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[400px]">
        {COLUMNS.map(col => (
          <div key={col.key} className="flex flex-col">
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-3 ${col.color}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
              <span className="text-xs font-semibold text-stone-700">{col.label}</span>
              <span className="ml-auto w-5 h-5 rounded-full bg-white/60 flex items-center justify-center
                text-[10px] font-bold text-stone-600">
                {kanban[col.key]?.length || 0}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5">
              {(kanban[col.key] || []).map(delivery => {
                const flow = STATUS_FLOW[delivery.deliveryStatus];
                return (
                  <motion.div key={delivery._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs
                               hover:shadow-card transition-all duration-150">
                    {/* Platform + time */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{PLATFORM_EMOJI[delivery.platformName] || '📦'}</span>
                        <span className="text-xs font-semibold text-stone-700">{delivery.platformName}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">{timeAgo(delivery.createdAt)}</span>
                    </div>

                    {/* Student */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User size={10} className="text-stone-400" />
                      <span className="text-xs text-stone-600 font-medium truncate">
                        {delivery.user?.name}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin size={10} className="text-stone-400" />
                      <span className="text-xs text-stone-500">
                        Block {delivery.hostelBlock}, Rm {delivery.roomNumber}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Phone size={10} className="text-stone-400" />
                      <a href={`tel:${delivery.contactNumber}`}
                        className="text-xs text-blue-600 hover:text-blue-800">
                        {delivery.contactNumber}
                      </a>
                    </div>

                    {/* Assign staff (only on Requested) */}
                    {delivery.deliveryStatus === 'Requested' && staff.length > 0 && (
                      <select
                        defaultValue={delivery.assignedStaff?._id || ''}
                        onChange={e => e.target.value && assignStaff(delivery._id, e.target.value)}
                        className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5 mb-2
                                   bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-brand-400">
                        <option value="">Assign staff…</option>
                        {staff.filter(s => s.isAvailable).map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    )}

                    {/* Assigned staff badge */}
                    {delivery.assignedStaff && delivery.deliveryStatus !== 'Requested' && (
                      <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-stone-50 rounded-lg">
                        <Truck size={10} className="text-stone-400" />
                        <span className="text-[11px] text-stone-600">{delivery.assignedStaff.name}</span>
                      </div>
                    )}

                    {/* Advance button */}
                    {flow && (
                      <button
                        onClick={() => advance(delivery._id, flow.next)}
                        disabled={advancing === delivery._id}
                        className={`w-full text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1
                          transition-all active:scale-[0.98]
                          ${flow.color === 'btn-primary'
                            ? 'bg-stone-900 text-white hover:bg-stone-700'
                            : 'bg-brand-500 text-white hover:bg-brand-600'
                          } disabled:opacity-50`}>
                        {advancing === delivery._id
                          ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <>{flow.label} <ArrowRight size={10} /></>
                        }
                      </button>
                    )}

                    {/* Delivered label */}
                    {delivery.deliveryStatus === 'Delivered' && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <CheckCircle size={12} /> Delivered
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Empty column */}
              {(kanban[col.key] || []).length === 0 && (
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-stone-400">No deliveries</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
