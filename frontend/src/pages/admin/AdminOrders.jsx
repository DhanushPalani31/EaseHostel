import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { fetchAllOrders } from '../../store/slices/orderSlice.js';
import { formatCurrency, formatDateTime, getOrderStatusColor, getPaymentStatusColor } from '../../utils/index.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders, loading, pagination } = useSelector(s => s.orders);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('All');
  const [page,    setPage]    = useState(1);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    dispatch(fetchAllOrders({
      page, limit: 20,
      ...(status !== 'All' && { status }),
      ...(search && { search })
    }));
  };

  useEffect(() => { load(); }, [page, status]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      load();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Orders</h1>
          {pagination && <p className="text-stone-400 text-sm">{pagination.total} total orders</p>}
        </div>
        <button onClick={load} className="btn-outline btn-sm">
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"/>
          <input value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search invoice ID…" className="input pl-9"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                ${status === s ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              {s}
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
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Items</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Payment</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allOrders.map(o => (
                  <motion.tr key={o._id} initial={{opacity:0}} animate={{opacity:1}}
                    className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-600">#{o.invoiceId}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-900">{o.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-stone-400">
                        {o.user?.hostelBlock && `Blk ${o.user.hostelBlock}, Rm ${o.user.roomNumber}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-500 hidden md:table-cell">{o.items?.length} items</td>
                    <td className="px-4 py-3 text-stone-500 hidden lg:table-cell">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getOrderStatusColor(o.orderStatus)}`}>{o.orderStatus}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge ${getPaymentStatusColor(o.paymentStatus)}`}>{o.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <select
                          value={o.orderStatus}
                          disabled={updating === o._id || o.orderStatus === 'Cancelled'}
                          onChange={e => handleStatusUpdate(o._id, e.target.value)}
                          className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white text-stone-700
                                     focus:outline-none focus:ring-1 focus:ring-brand-400 disabled:opacity-50 cursor-pointer">
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {allOrders.length === 0 && (
              <div className="text-center py-12 text-stone-400">No orders found</div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="btn-outline btn-sm">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page === pagination.totalPages}
            className="btn-outline btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}
