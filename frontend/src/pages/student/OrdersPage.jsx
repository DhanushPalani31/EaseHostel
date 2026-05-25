// ═══════════════════════════════════════════════════════════
// OrdersPage.jsx
// ═══════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Package, ChevronDown, RotateCcw, XCircle } from 'lucide-react';
import { fetchMyOrders, cancelOrder } from '../../store/slices/orderSlice.js';
import { formatCurrency, formatDateTime, getOrderStatusColor, getPaymentStatusColor } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';
import toast from 'react-hot-toast';

export function OrdersPage() {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector(s => s.orders);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    const result = await dispatch(cancelOrder(id));
    if (cancelOrder.rejected.match(result)) toast.error(result.payload);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
      ) : myOrders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={36} className="text-stone-300 mx-auto mb-3"/>
          <p className="text-stone-500">No orders yet</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {myOrders.map(order => (
            <motion.div key={order._id} variants={staggerItem} className="card overflow-hidden">
              <button onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={15} className="text-stone-500"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900">#{order.invoiceId}</p>
                    <p className="text-xs text-stone-400">{formatDateTime(order.createdAt)} · {order.items.length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`badge ${getOrderStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                  <span className="font-bold text-stone-900 text-sm">{formatCurrency(order.totalAmount)}</span>
                  <ChevronDown size={14} className={`text-stone-400 transition-transform ${expanded===order._id?'rotate-180':''}`}/>
                </div>
              </button>

              {expanded === order._id && (
                <div className="border-t border-stone-100 p-4 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item,i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center">🛍️</div>}
                        </div>
                        <span className="flex-1 text-stone-700 truncate">{item.productName}</span>
                        <span className="text-stone-400">×{item.quantity}</span>
                        <span className="font-medium text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <div><span className="font-medium text-stone-700">Payment:</span> {order.paymentMethod}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-stone-700">Status:</span>
                      <span className={`badge text-[10px] ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                    </div>
                    {order.deliverySlot && <div><span className="font-medium text-stone-700">Slot:</span> {order.deliverySlot}</div>}
                    {order.deliveryNotes && <div><span className="font-medium text-stone-700">Notes:</span> {order.deliveryNotes}</div>}
                  </div>

                  {order.orderStatus === 'Pending' && (
                    <button onClick={() => handleCancel(order._id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors font-medium">
                      <XCircle size={13}/> Cancel order
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
export default OrdersPage;
