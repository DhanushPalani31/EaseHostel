import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronDown, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { formatCurrency, formatDate, ORDER_STATUSES, getCategoryEmoji } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import styles from './StudentOrders.module.css';

export default function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cancelling, setCancelling] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { user } = useSelector((s) => s.auth);

  const fetchOrders = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.get('/orders/user/' + user._id, { params });
      setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user, statusFilter]);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      setCancelling(confirmCancel._id);
      await api.delete('/orders/' + confirmCancel._id);
      toast.success('Order cancelled');
      setConfirmCancel(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(null);
    }
  };

  const statusCounts = ORDER_STATUSES.reduce((acc, s) => {
    if (s === 'All') { acc[s] = orders.length; return acc; }
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const toggleExpand = (id) => setExpandedOrder((prev) => (prev === id ? null : id));

  return (
    <div className={styles.page}>
      <motion.div className={styles.header} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchOrders}>Refresh</Button>
      </motion.div>

      <div className={styles.tabs}>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            className={[styles.tab, statusFilter === s ? styles.tabActive : ''].join(' ')}
            onClick={() => setStatusFilter(s)}
          >
            {s}
            {statusCounts[s] > 0 && (
              <span className={[styles.tabCount, statusFilter === s ? styles.tabCountActive : ''].join(' ')}>
                {statusCounts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {Array(4).fill(0).map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : orders.length === 0 ? (
        <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ShoppingBag size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>{statusFilter === 'All' ? 'No orders yet' : 'No ' + statusFilter.toLowerCase() + ' orders'}</h3>
          <p className={styles.emptyDesc}>{statusFilter === 'All' ? 'Head to the shop and place your first order!' : 'Try a different filter.'}</p>
          {statusFilter !== 'All' && <Button variant="secondary" size="sm" onClick={() => setStatusFilter('All')}>View All</Button>}
        </motion.div>
      ) : (
        <motion.div className={styles.ordersList} variants={{ animate: { transition: { staggerChildren: 0.07 } } }} initial="initial" animate="animate">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                className={styles.orderCard}
                variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                layout
              >
                <div className={styles.cardHeader} onClick={() => toggleExpand(order._id)}>
                  <div className={styles.productInfo}>
                    <div className={styles.productImg}>
                      {order.productId?.image
                        ? <img src={order.productId.image} alt={order.orderName} />
                        : <span>{getCategoryEmoji(order.productId?.category)}</span>
                      }
                    </div>
                    <div className={styles.productText}>
                      <p className={styles.productName}>{order.orderName}</p>
                      <p className={styles.productMeta}>{order.productId?.category} · Qty: {order.quantity}</p>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <StatusBadge status={order.status} />
                    <p className={styles.cardAmount}>{formatCurrency(order.totalAmount)}</p>
                    <ChevronDown size={16} className={[styles.expandIcon, expandedOrder === order._id ? styles.expanded : ''].join(' ')} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order._id && (
                    <motion.div
                      className={styles.cardExpanded}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={styles.expandedContent}>
                        <div className={styles.detailsGrid}>
                          <div className={styles.detailItem}><span className={styles.detailLabel}>Unit Price</span><span className={styles.detailValue}>{formatCurrency(order.price)}</span></div>
                          <div className={styles.detailItem}><span className={styles.detailLabel}>Quantity</span><span className={styles.detailValue}>{order.quantity}</span></div>
                          <div className={styles.detailItem}><span className={styles.detailLabel}>Total</span><span className={[styles.detailValue, styles.detailTotal].join(' ')}>{formatCurrency(order.totalAmount)}</span></div>
                          <div className={styles.detailItem}><span className={styles.detailLabel}>Room</span><span className={styles.detailValue}>{order.roomNumber || user?.roomNumber || 'N/A'}</span></div>
                          <div className={styles.detailItem}><span className={styles.detailLabel}>Placed On</span><span className={styles.detailValue}>{formatDate(order.createdAt)}</span></div>
                          {order.deliveryNote && (
                            <div className={[styles.detailItem, styles.detailFull].join(' ')}><span className={styles.detailLabel}>Delivery Note</span><span className={styles.detailValue}>{order.deliveryNote}</span></div>
                          )}
                        </div>

                        {order.statusHistory?.length > 0 && (
                          <div className={styles.timeline}>
                            <p className={styles.timelineLabel}>Status History</p>
                            <div className={styles.timelineItems}>
                              {order.statusHistory.map((h, i) => (
                                <div key={i} className={styles.timelineItem}>
                                  <div className={styles.timelineDotWrap}>
                                    <div className={styles.timelineDot} />
                                    {i < order.statusHistory.length - 1 && <div className={styles.timelineLine} />}
                                  </div>
                                  <div className={styles.timelineContent}>
                                    <StatusBadge status={h.status} />
                                    <span className={styles.timelineNote}>{h.note}</span>
                                    <span className={styles.timelineDate}>{formatDate(h.changedAt)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.status === 'Pending' && (
                          <div className={styles.expandedActions}>
                            <div className={styles.pendingNote}><Clock size={13} />You can cancel this order while it's still pending.</div>
                            <Button variant="danger" size="sm" icon={X} onClick={() => setConfirmCancel(order)}>Cancel Order</Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={!!confirmCancel} onClose={() => setConfirmCancel(null)} title="Cancel Order" size="sm">
        <div className={styles.confirmBody}>
          <p className={styles.confirmText}>Cancel your order for <strong>{confirmCancel?.orderName}</strong>? Stock will be restored.</p>
          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setConfirmCancel(null)}>Keep Order</Button>
            <Button variant="danger" loading={!!cancelling} onClick={handleCancel} icon={X}>Yes, Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
