import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, RefreshCw, Search, UserCheck, X,
  Clock, Package, MapPin, Phone, CheckCircle
} from 'lucide-react';
import { fetchAllDeliveries } from '../../store/slices/deliverySlice.js';
import { formatDate, timeAgo } from '../../utils/index.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All','Requested','Accepted','Waiting at Gate','Picked Up','Out for Delivery','Delivered','Cancelled'];

const STATUS_COLOR = {
  Requested:         'badge-amber',
  Accepted:          'badge-blue',
  'Waiting at Gate': 'badge-blue',
  'Picked Up':       'badge-blue',
  'Out for Delivery':'badge-amber',
  Delivered:         'badge-green',
  Cancelled:         'badge-red',
};

const PLATFORM_EMOJI = {
  Amazon: '📦', Flipkart: '🛒', Zepto: '⚡',
  'Swiggy Instamart': '🧡', Blinkit: '💛', Myntra: '👗', Meesho: '🛍️', Other: '🌐'
};

export default function AdminDeliveryManagement() {
  const dispatch = useDispatch();
  const { allDeliveries, pagination, loading } = useSelector(s => s.deliveries);

  const [status,    setStatus]    = useState('All');
  const [page,      setPage]      = useState(1);
  const [modal,     setModal]     = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [form,      setForm]      = useState({ status: '', note: '', staffId: '', estimatedDeliveryTime: '' });
  const [updating,  setUpdating]  = useState(false);

  const load = () => {
    dispatch(fetchAllDeliveries({
      page, limit: 20,
      ...(status !== 'All' && { status })
    }));
  };

  useEffect(() => { load(); }, [page, status]);

  useEffect(() => {
    api.get('/delivery-staff?activeOnly=true')
      .then(r => setStaffList(r.data.data.staff))
      .catch(() => {});
  }, []);

  const openModal = (d) => {
    setModal(d);
    setForm({ status: d.deliveryStatus, note: '', staffId: d.assignedStaff?._id || '', estimatedDeliveryTime: '' });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Assign staff if changed
      if (form.staffId && form.staffId !== modal.assignedStaff?._id) {
        await api.patch(`/external-deliveries/${modal._id}/assign`, { staffId: form.staffId });
      }
      // Update status
      if (form.status !== modal.deliveryStatus) {
        await api.patch(`/external-deliveries/${modal._id}/status`, {
          status: form.status,
          note:   form.note,
          estimatedDeliveryTime: form.estimatedDeliveryTime || undefined
        });
      }
      toast.success('Delivery updated');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  // Stats
  const pending    = allDeliveries.filter(d => d.deliveryStatus === 'Requested').length;
  const active     = allDeliveries.filter(d => !['Delivered','Cancelled'].includes(d.deliveryStatus)).length;
  const delivered  = allDeliveries.filter(d => d.deliveryStatus === 'Delivered').length;

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Delivery Management</h1>
          <p className="text-stone-400 text-sm">Manage all gate pickups and hostel deliveries</p>
        </div>
        <button onClick={load} className="btn-outline btn-sm"><RefreshCw size={13}/> Refresh</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',   value: pending,   color: 'bg-amber-50',  text: 'text-amber-700' },
          { label: 'Active',    value: active,    color: 'bg-blue-50',   text: 'text-blue-700' },
          { label: 'Delivered', value: delivered, color: 'bg-green-50',  text: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color} border-none`}>
            <p className={`text-2xl font-bold tracking-tighter ${s.text}`}>{s.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${status === s ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Delivery cards */}
      {loading ? (
        <div className="space-y-3">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
      ) : allDeliveries.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Truck size={32} className="mx-auto mb-3 text-stone-300"/>
          No deliveries found
        </div>
      ) : (
        <div className="space-y-3">
          {allDeliveries.map(d => (
            <motion.div key={d._id} initial={{opacity:0}} animate={{opacity:1}}
              className="card p-4 hover:shadow-panel transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{PLATFORM_EMOJI[d.platformName] || '📦'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-stone-900">{d.platformName}</p>
                      <span className={`badge ${STATUS_COLOR[d.deliveryStatus] || 'badge-stone'}`}>
                        {d.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {d.user?.name} · Block {d.hostelBlock}, Rm {d.roomNumber} · {timeAgo(d.createdAt)}
                    </p>
                    {d.trackingId && (
                      <p className="text-xs font-mono text-stone-400">#{d.trackingId}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {d.assignedStaff && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 rounded-lg">
                      <UserCheck size={12} className="text-stone-500"/>
                      <span className="text-xs text-stone-600">{d.assignedStaff.name}</span>
                    </div>
                  )}
                  <button onClick={() => openModal(d)}
                    className="btn-outline btn-sm text-xs">
                    Manage
                  </button>
                </div>
              </div>

              {/* Staff contact */}
              {d.user?.phoneNumber && (
                <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
                  <Phone size={11}/>
                  <a href={`tel:${d.user.phoneNumber}`} className="hover:text-stone-700 transition-colors">
                    {d.user.phoneNumber}
                  </a>
                  <span className="text-stone-200">·</span>
                  <MapPin size={11}/>
                  <span>{d.pickupLocation}</span>
                  {d.expectedArrival && (
                    <>
                      <span className="text-stone-200">·</span>
                      <Clock size={11}/>
                      <span>Expected: {formatDate(d.expectedArrival)}</span>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-outline btn-sm">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(p=>p+1)} disabled={page===pagination.totalPages} className="btn-outline btn-sm">Next</button>
        </div>
      )}

      {/* Manage Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setModal(null)}/>
            <motion.div
              initial={{opacity:0,scale:0.96,y:16}} animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:0.96}} transition={{duration:0.2,ease:[0.16,1,0.3,1]}}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900">Manage Delivery</h2>
                  <button onClick={() => setModal(null)} className="btn-ghost btn-sm p-1.5"><X size={15}/></button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Parcel info */}
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{PLATFORM_EMOJI[modal.platformName] || '📦'}</span>
                      <div>
                        <p className="font-bold text-stone-900">{modal.platformName}</p>
                        {modal.trackingId && <p className="text-xs font-mono text-stone-400">#{modal.trackingId}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><p className="text-xs text-stone-400">Student</p><p className="font-medium text-stone-900">{modal.user?.name}</p></div>
                      <div><p className="text-xs text-stone-400">Contact</p><p className="font-medium text-stone-900">{modal.contactNumber}</p></div>
                      <div><p className="text-xs text-stone-400">Deliver to</p><p className="font-medium text-stone-900">Block {modal.hostelBlock}, Rm {modal.roomNumber}</p></div>
                      <div><p className="text-xs text-stone-400">Pickup</p><p className="font-medium text-stone-900">{modal.pickupLocation}</p></div>
                    </div>
                    {modal.parcelDescription && (
                      <p className="text-xs text-stone-500 mt-2 p-2 bg-white rounded-lg">{modal.parcelDescription}</p>
                    )}
                  </div>

                  {/* Assign staff */}
                  <div>
                    <label className="label">Assign Delivery Staff</label>
                    <select value={form.staffId}
                      onChange={e => setForm(f => ({...f, staffId: e.target.value}))}
                      className="input">
                      <option value="">— Select staff —</option>
                      {staffList.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} · {s.activeDeliveryCount} active · {s.isAvailable ? 'Available' : 'Busy'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="label">Update Status</label>
                    <select value={form.status}
                      onChange={e => setForm(f => ({...f, status: e.target.value}))}
                      className="input">
                      {['Requested','Accepted','Waiting at Gate','Picked Up','Out for Delivery','Delivered','Cancelled']
                        .map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* ETA */}
                  <div>
                    <label className="label">Estimated Delivery Time</label>
                    <input type="datetime-local" value={form.estimatedDeliveryTime}
                      onChange={e => setForm(f => ({...f, estimatedDeliveryTime: e.target.value}))}
                      className="input"/>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="label">Internal note</label>
                    <input value={form.note}
                      onChange={e => setForm(f => ({...f, note: e.target.value}))}
                      placeholder="e.g. Parcel is large box" className="input"/>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setModal(null)} className="btn-outline btn-md flex-1">Cancel</button>
                    <button onClick={handleUpdate} disabled={updating} className="btn-primary btn-md flex-1">
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
