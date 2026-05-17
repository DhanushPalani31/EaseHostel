import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, X, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { formatCurrency, CATEGORIES, getCategoryEmoji, truncate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import styles from './StudentHome.module.css';

export default function StudentHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [orderModal, setOrderModal] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const { user } = useSelector((s) => s.auth);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { available: 'true' };
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  const openOrder = (product) => {
    setOrderModal(product);
    setQuantity(1);
    setNote('');
  };

  const handlePlaceOrder = async () => {
    if (!orderModal) return;
    try {
      setPlacing(true);
      await api.post('/orders', { productId: orderModal._id, quantity, deliveryNote: note });
      toast.success('Order placed successfully! 🎉');
      setOrderModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <motion.div className={styles.heroBanner} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className={styles.heroText}>
          <p className={styles.heroGreet}>
            Hey {user?.name?.split(' ')[0]} 👋
            {user?.roomNumber && <span className={styles.heroRoom}>Room {user.roomNumber}</span>}
          </p>
          <h1 className={styles.heroTitle}>What do you need today?</h1>
          <p className={styles.heroSub}>Browse and order your hostel essentials with one tap.</p>
        </div>
        <div className={styles.heroOrb} />
      </motion.div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search snacks, stationery, toiletries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => setSearch('')}><X size={14} /></button>
        )}
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        {CATEGORIES.map((c) => (
          <button key={c} className={[styles.catChip, category === c ? styles.catActive : ''].join(' ')} onClick={() => setCategory(c)}>
            <span>{getCategoryEmoji(c)}</span>
            <span>{c}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className={styles.resultsHeader}>
        <p className={styles.resultsCount}>{loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''} available`}</p>
        {(search || category !== 'All') && (
          <button className={styles.clearFilters} onClick={() => { setSearch(''); setCategory('All'); }}>Clear filters <X size={12} /></button>
        )}
      </div>

      {loading ? (
        <div className={styles.skeletonGrid}>{Array(8).fill(0).map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
      ) : products.length === 0 ? (
        <motion.div className={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className={styles.emptyEmoji}>🔍</span>
          <h3 className={styles.emptyTitle}>No products found</h3>
          <p className={styles.emptyDesc}>Try a different search or category</p>
        </motion.div>
      ) : (
        <motion.div className={styles.grid} variants={{ animate: { transition: { staggerChildren: 0.06 } } }} initial="initial" animate="animate">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product._id}
                className={styles.productCard}
                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                layout
              >
                <div className={styles.cardImg}>
                  {product.image
                    ? <img src={product.image} alt={product.productName} className={styles.productImage} />
                    : <div className={styles.productImgFallback}><span>{getCategoryEmoji(product.category)}</span></div>
                  }
                  <div className={styles.catPill}>{product.category}</div>
                  {product.stock <= 10 && product.stock > 0 && (
                    <div className={styles.lowStockBadge}>Only {product.stock} left!</div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.productName}>{product.productName}</h3>
                    <p className={styles.productPrice}>{formatCurrency(product.price)}</p>
                  </div>
                  {product.description && <p className={styles.productDesc}>{truncate(product.description, 55)}</p>}
                  <Button fullWidth icon={ShoppingCart} onClick={() => openOrder(product)}>Order Now</Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Order Modal */}
      <Modal open={!!orderModal} onClose={() => setOrderModal(null)} title="Place Order" size="sm">
        {orderModal && (
          <div className={styles.orderModal}>
            <div className={styles.modalProduct}>
              <div className={styles.modalProductImg}>
                {orderModal.image ? <img src={orderModal.image} alt="" /> : <span style={{ fontSize: 28 }}>{getCategoryEmoji(orderModal.category)}</span>}
              </div>
              <div>
                <h3 className={styles.modalProductName}>{orderModal.productName}</h3>
                <p className={styles.modalProductCat}>{orderModal.category}</p>
                <p className={styles.modalProductPrice}>{formatCurrency(orderModal.price)} each</p>
              </div>
            </div>

            <div className={styles.quantitySection}>
              <p className={styles.qtyLabel}>Quantity</p>
              <div className={styles.qtyControls}>
                <button className={styles.qtyBtn} onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={14} /></button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button className={styles.qtyBtn} onClick={() => setQuantity((q) => Math.min(orderModal.stock, q + 1))} disabled={quantity >= orderModal.stock}><Plus size={14} /></button>
              </div>
            </div>

            <div className={styles.noteSection}>
              <p className={styles.qtyLabel}>Delivery Note (optional)</p>
              <textarea className={styles.noteInput} placeholder="Any special instructions…" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}><span>Unit Price</span><span>{formatCurrency(orderModal.price)}</span></div>
              <div className={styles.summaryRow}><span>Quantity</span><span>× {quantity}</span></div>
              <div className={[styles.summaryRow, styles.summaryTotal].join(' ')}>
                <span>Total</span>
                <span className={styles.totalAmount}>{formatCurrency(orderModal.price * quantity)}</span>
              </div>
            </div>

            {user?.roomNumber && (
              <div className={styles.deliveryInfo}>📍 Delivering to <strong>Room {user.roomNumber}</strong></div>
            )}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setOrderModal(null)}>Cancel</Button>
              <Button loading={placing} onClick={handlePlaceOrder} icon={ShoppingCart}>Confirm Order</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
