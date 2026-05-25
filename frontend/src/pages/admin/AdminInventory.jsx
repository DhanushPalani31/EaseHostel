import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, RefreshCw, TrendingDown, Search } from 'lucide-react';
import api from '../../services/api.js';
import { formatCurrency } from '../../utils/index.js';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const STOCK_THRESHOLD = 10;

export default function AdminInventory() {
  const [products,  setProducts]  = useState([]);
  const [lowStock,  setLowStock]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [updating,  setUpdating]  = useState(null);
  const [restock,   setRestock]   = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        api.get('/products', { params: { limit: 50 } }),
        api.get('/products/low-stock', { params: { threshold: STOCK_THRESHOLD } })
      ]);
      setProducts(allRes.data.data || []);
      setLowStock(lowRes.data.data.products || []);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRestock = async (productId) => {
    const qty = Number(restock[productId]);
    if (!qty || qty < 1) { toast.error('Enter a valid quantity'); return; }
    setUpdating(productId);
    try {
      // Fetch current stock first, then add
      const prod = products.find(p => p._id === productId);
      await api.put(`/products/${productId}`, { stock: (prod?.stock || 0) + qty });
      toast.success(`Added ${qty} units to stock`);
      setRestock(r => ({ ...r, [productId]: '' }));
      load();
    } catch { toast.error('Restock failed'); }
    finally { setUpdating(null); }
  };

  const handleToggleAvailability = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isAvailable: !product.isAvailable });
      toast.success(`Product ${product.isAvailable ? 'hidden' : 'shown'}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const outOfStock  = products.filter(p => p.stock === 0);
  const critical    = products.filter(p => p.stock > 0 && p.stock <= 5);
  const low         = products.filter(p => p.stock > 5 && p.stock <= STOCK_THRESHOLD);

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Inventory</h1>
          <p className="text-stone-400 text-sm">{products.length} products tracked</p>
        </div>
        <button onClick={load} className="btn-outline btn-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Stock summary cards ─────────────────────────── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length,   color: 'bg-stone-100',  icon: Package,       textColor: 'text-stone-600' },
          { label: 'Out of Stock',   value: outOfStock.length, color: 'bg-red-50',     icon: AlertTriangle, textColor: 'text-red-500' },
          { label: 'Critical (≤5)',  value: critical.length,   color: 'bg-orange-50',  icon: TrendingDown,  textColor: 'text-orange-500' },
          { label: 'Low (≤10)',      value: low.length,        color: 'bg-amber-50',   icon: AlertTriangle, textColor: 'text-amber-500' },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="card p-4">
            <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={16} className={stat.textColor} />
            </div>
            <p className="text-2xl font-bold text-stone-900 tracking-tighter">{stat.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Low stock alerts ────────────────────────────── */}
      {lowStock.length > 0 && (
        <div className="card p-5 border-amber-200/80">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-600" />
            </div>
            <h3 className="section-title">Low Stock Alerts</h3>
            <span className="badge badge-amber ml-1">{lowStock.length} products</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(p => (
              <div key={p._id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${p.stock === 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <Package size={14} className={p.stock === 0 ? 'text-red-500' : 'text-amber-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{p.productName}</p>
                  <p className="text-xs text-stone-400">{p.category}</p>
                </div>
                <span className={`badge flex-shrink-0 ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                  {p.stock === 0 ? 'Out' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full inventory table ────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-3">
          <h3 className="section-title">All Products</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input pl-8 text-sm py-1.5 w-48" />
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-center px-4 py-3">Current Stock</th>
                  <th className="text-left px-4 py-3">Restock</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Price</th>
                  <th className="text-center px-4 py-3">Visible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Product name + image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                          {p.image
                            ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-base">🛍️</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate max-w-[160px]">{p.productName}</p>
                          {p.brand && <p className="text-xs text-stone-400">{p.brand}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="badge badge-stone">{p.category}</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-7 rounded-lg text-xs font-bold
                        ${p.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : p.stock <= 5
                            ? 'bg-orange-100 text-orange-700'
                            : p.stock <= STOCK_THRESHOLD
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                        {p.stock}
                      </span>
                    </td>

                    {/* Restock input */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" min="1"
                          value={restock[p._id] || ''}
                          onChange={e => setRestock(r => ({ ...r, [p._id]: e.target.value }))}
                          placeholder="Add qty"
                          className="input text-xs py-1.5 w-20"
                        />
                        <button
                          onClick={() => handleRestock(p._id)}
                          disabled={updating === p._id || !restock[p._id]}
                          className="btn-primary btn-sm px-2.5 py-1.5 text-xs disabled:opacity-40">
                          {updating === p._id ? '…' : 'Add'}
                        </button>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 hidden md:table-cell font-semibold text-stone-900">
                      {formatCurrency(p.price)}
                    </td>

                    {/* Toggle visibility */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        className={`w-9 h-5 rounded-full transition-colors duration-200 relative mx-auto block
                          ${p.isAvailable ? 'bg-stone-900' : 'bg-stone-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200
                          ${p.isAvailable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-stone-400">
                <Package size={28} className="mx-auto mb-2 text-stone-300" />
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
