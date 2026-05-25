import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Filter, RefreshCw, Eye,
  CheckCircle, XCircle, Truck, Clock, X
} from 'lucide-react';
import { fetchAllCustomOrders } from '../../store/slices/customOrderSlice.js';
import { formatDate, formatCurrency } from '../../utils/index.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const STATUS_OPTIONS  = ['All','Pending','Reviewing','Approved','Purchasing','Delivered','Rejected','Cancelled'];
const PRIORITY_OPTIONS= ['All','urgent','high','medium','low'];

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', cls: 'badge-red' },
  high:   { label: 'High',   cls: 'badge-amber' },
  medium: { label: 'Medium', cls: 'badge-blue' },
  low:    { label: 'Low',    cls: 'badge-stone' },
};

const STATUS_CONFIG = {
  Pending:   'badge-amber', Reviewing: 'badge-blue', Approved: 'badge-green',
  Purchasing:'badge-blue',  Delivered: 'badge-green', Rejected: 'badge-red', Cancelled: 'badge-stone'
};

export default function AdminCustomRequests() {
  const dispatch = useDispatch();
  const { allOrders, pagination, loading } = useSelector(s => s.customOrders);

  const [status,   setStatus]   = useState('All');
  const [priority, setPriority] = useState('All');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(null); // selected order
  const [updating, setUpdating] = useState(false);
  const [form,     setForm]     = useState({ status: '', adminNote: '', finalPrice: '' });

  const load = () => {
    dispatch(fetchAllCustomOrders({
      page, limit: 20,
      ...(status   !== 'All' && { status }),
      ...(priority !== 'All' && { priority }),
      ...(search   && { search })
    }));
  };

  useEffect(() => { load(); }, [page, status, priority]);

  const openModal = (order) => {
    setModal(order);
    setForm({ status: order.status, adminNote: order.adminNote || '', finalPrice: order.finalPrice || '' });
  };

  const handleUpdate = async () => {
    if (!form.status) { toast.error('Select a status'); return; }
    setUpdating(true);
    try {
      await api.patch(`/custom-orders/${modal._id}/status`, form);
      toast.success('Order updated');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  // Quick action: approve / reject
  const quickAction = async (orderId, status, note = '') => {
    try {
      await api.patch(`/custom-orders/${orderId}/status`, { status, adminNote: note });
      toast.success(`Order ${status}`);
      load();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Custom Requests</h1>
          {pagination && <p className="text-stone-400 text-sm">{pagination.total} total requests</p>}
        </div>
        <button onClick={load} className="btn-outline btn-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search product name…" className="input pl-9" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${status === s ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {PRIORITY_OPTIONS.map(p => (
            <button key={p} onClick={() => { setPriority(p); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                ${priority === p ? 'bg-brand-500 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              {p === 'All' ? 'All Priority' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{Array.from({length:8}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Student</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-center px-4 py-3">Priority</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allOrders.map(order => (
                  <motion.tr key={order._id} initial={{opacity:0}} animate={{opacity:1}}
                    className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                          {order.referenceImages?.[0]
                            ? <img src={order.referenceImages[0]} alt="" className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center">📦</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate max-w-[140px]">{order.productName}</p>
                          {order.brandName && <p className="text-xs text-stone-400">{order.brandName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="font-medium text-stone-900">{order.user?.name}</p>
                      <p className="text-xs text-stone-400">
                        {order.user?.hostelBlock && `Block ${order.user.hostelBlock}, Rm ${order.user.roomNumber}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge badge-stone">{order.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${PRIORITY_CONFIG[order.priority]?.cls || 'badge-stone'} capitalize`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_CONFIG[order.status] || 'badge-stone'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-stone-500 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openModal(order)}
                          className="btn-ghost btn-sm p-1.5 hover:bg-blue-50 hover:text-blue-600" title="View & Edit">
                          <Eye size={13}/>
                        </button>
                        {order.status === 'Pending' && (
                          <>
                            <button onClick={() => quickAction(order._id, 'Approved', 'Approved by admin')}
                              className="btn-ghost btn-sm p-1.5 hover:bg-green-50 hover:text-green-600" title="Approve">
                              <CheckCircle size={13}/>
                            </button>
                            <button onClick={() => quickAction(order._id, 'Rejected', 'Cannot fulfil this request')}
                              className="btn-ghost btn-sm p-1.5 hover:bg-red-50 hover:text-red-600" title="Reject">
                              <XCircle size={13}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {allOrders.length === 0 && (
              <div className="text-center py-12 text-stone-400">No requests found</div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-outline btn-sm">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(p=>p+1)} disabled={page===pagination.totalPages} className="btn-outline btn-sm">Next</button>
        </div>
      )}

      {/* Update Modal */}
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
                  <h2 className="text-lg font-bold text-stone-900">Custom Request Details</h2>
                  <button onClick={() => setModal(null)} className="btn-ghost btn-sm p-1.5"><X size={15}/></button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Product info */}
                  <div className="flex gap-4">
                    {modal.referenceImages?.[0] && (
                      <img src={modal.referenceImages[0]} alt=""
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-stone-900 text-lg">{modal.productName}</p>
                      {modal.brandName && <p className="text-sm text-stone-500">{modal.brandName}</p>}
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <span className="badge badge-stone">{modal.category}</span>
                        <span className="badge badge-stone">Qty: {modal.quantity}</span>
                        <span className={`badge ${PRIORITY_CONFIG[modal.priority]?.cls} capitalize`}>{modal.priority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Student info */}
                  <div className="p-3.5 bg-stone-50 rounded-xl">
                    <p className="text-xs font-semibold text-stone-500 uppercase mb-2">Student</p>
                    <p className="font-medium text-stone-900">{modal.user?.name}</p>
                    <p className="text-sm text-stone-500">{modal.user?.email}</p>
                    <p className="text-sm text-stone-500">
                      {modal.user?.hostelBlock && `Block ${modal.user.hostelBlock}, Room ${modal.user.roomNumber}`}
                    </p>
                    {modal.user?.phoneNumber && (
                      <a href={`tel:${modal.user.phoneNumber}`}
                        className="text-sm text-blue-600 hover:underline">{modal.user.phoneNumber}</a>
                    )}
                  </div>

                  {/* Budget */}
                  {(modal.estimatedBudget?.min || modal.estimatedBudget?.max) && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase mb-1">Budget</p>
                      <p className="text-stone-700">
                        ₹{modal.estimatedBudget.min} – ₹{modal.estimatedBudget.max}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {modal.notes && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase mb-1">Student Notes</p>
                      <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl">{modal.notes}</p>
                    </div>
                  )}

                  {/* Update form */}
                  <div className="border-t border-stone-100 pt-4 space-y-4">
                    <div>
                      <label className="label">Update Status</label>
                      <select value={form.status}
                        onChange={e => setForm(f => ({...f, status: e.target.value}))}
                        className="input">
                        {['Pending','Reviewing','Approved','Purchasing','Delivered','Rejected','Cancelled']
                          .map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="label">Final Price (₹)</label>
                      <input type="number" min="0" value={form.finalPrice}
                        onChange={e => setForm(f => ({...f, finalPrice: e.target.value}))}
                        placeholder="Set price after sourcing product" className="input"/>
                    </div>

                    <div>
                      <label className="label">Note to student</label>
                      <textarea rows={3} value={form.adminNote}
                        onChange={e => setForm(f => ({...f, adminNote: e.target.value}))}
                        placeholder="e.g. Found it on Amazon for ₹120, will deliver tomorrow"
                        className="input resize-none"/>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setModal(null)} className="btn-outline btn-md flex-1">Cancel</button>
                    <button onClick={handleUpdate} disabled={updating} className="btn-primary btn-md flex-1">
                      {updating ? 'Saving…' : 'Update Request'}
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
