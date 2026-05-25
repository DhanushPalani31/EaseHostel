import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Upload, X, ChevronDown, AlertCircle,
  Clock, Zap, ArrowRight, History, Star
} from 'lucide-react';
import { submitCustomOrder, fetchMyCustomOrders, cancelCustomOrder } from '../../store/slices/customOrderSlice.js';
import { useEffect } from 'react';
import { formatDate } from '../../utils/index.js';
import { staggerContainer, staggerItem, slideUp } from '../../animations/variants.js';

const CATEGORIES = ['Snacks','Stationery','Toiletries','Drinks','Instant Foods','Daily Essentials','Personal Care','Clothing','Electronics','Other'];

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-stone-500',  bg: 'bg-stone-100',  desc: '3–5 days' },
  medium: { label: 'Medium', color: 'text-blue-600',   bg: 'bg-blue-50',    desc: '1–2 days' },
  high:   { label: 'High',   color: 'text-amber-600',  bg: 'bg-amber-50',   desc: 'Same day' },
  urgent: { label: 'Urgent', color: 'text-red-600',    bg: 'bg-red-50',     desc: 'ASAP' }
};

const STATUS_CONFIG = {
  Pending:   { color: 'badge-amber',  dot: 'bg-amber-400' },
  Reviewing: { color: 'badge-blue',   dot: 'bg-blue-400' },
  Approved:  { color: 'badge-green',  dot: 'bg-green-400' },
  Purchasing:{ color: 'badge-blue',   dot: 'bg-blue-500' },
  Delivered: { color: 'badge-green',  dot: 'bg-green-500' },
  Rejected:  { color: 'badge-red',    dot: 'bg-red-400' },
  Cancelled: { color: 'badge-stone',  dot: 'bg-stone-400' }
};

const EMPTY_FORM = {
  productName: '', brandName: '', category: 'Other', quantity: 1,
  notes: '', priority: 'medium', orderType: 'internal',
  estimatedBudget: { min: '', max: '' }
};

export default function CustomOrderPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { myOrders, loading, submitting } = useSelector(s => s.customOrders);
  const { user }  = useSelector(s => s.auth);

  const [form,     setForm]     = useState(EMPTY_FORM);
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tab,      setTab]      = useState('new'); // 'new' | 'history'
  const [errors,   setErrors]   = useState({});

  useEffect(() => { dispatch(fetchMyCustomOrders()); }, [dispatch]);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - images.length);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(p => [...p, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = 'Product name is required';
    if (form.quantity < 1)        e.quantity    = 'Quantity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'estimatedBudget') {
        fd.append('estimatedBudget[min]', v.min || 0);
        fd.append('estimatedBudget[max]', v.max || 0);
      } else {
        fd.append(k, v);
      }
    });
    images.forEach(img => fd.append('referenceImages', img));

    const result = await dispatch(submitCustomOrder(fd));
    if (submitCustomOrder.fulfilled.match(result)) {
      setForm(EMPTY_FORM);
      setImages([]);
      setPreviews([]);
      setTab('history');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    dispatch(cancelCustomOrder(id));
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Custom Orders</h1>
          <p className="text-stone-400 text-sm mt-1">
            Can't find what you need? Request any product and we'll source it for you.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">
          <Zap size={14} className="text-brand-500" />
          <span className="text-xs font-medium text-brand-700">{myOrders.length} requests made</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit mb-6">
        {[
          { key: 'new',     label: 'New Request', icon: Package },
          { key: 'history', label: 'My Requests', icon: History }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${tab === t.key ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'new' ? (
          <motion.div key="new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Main form */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Product Info Card */}
                  <div className="card p-5 space-y-4">
                    <h3 className="section-title flex items-center gap-2">
                      <Package size={15} className="text-stone-400" />
                      Product Details
                    </h3>

                    {/* Product Name */}
                    <div>
                      <label className="label">Product name <span className="text-red-500">*</span></label>
                      <input value={form.productName}
                        onChange={e => set('productName', e.target.value)}
                        placeholder="e.g. Maggi Family Pack, Nike Socks, Dove Shampoo"
                        className={`input ${errors.productName ? 'input-error' : ''}`} />
                      {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Brand */}
                      <div>
                        <label className="label">Brand (optional)</label>
                        <input value={form.brandName}
                          onChange={e => set('brandName', e.target.value)}
                          placeholder="e.g. Nestle, Nike, Dove"
                          className="input" />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="label">Quantity <span className="text-red-500">*</span></label>
                        <input type="number" min="1" value={form.quantity}
                          onChange={e => set('quantity', Number(e.target.value))}
                          className={`input ${errors.quantity ? 'input-error' : ''}`} />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="label">Category</label>
                      <div className="relative">
                        <select value={form.category}
                          onChange={e => set('category', e.target.value)}
                          className="input appearance-none pr-8">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <label className="label">Estimated budget (₹)</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min="0"
                          value={form.estimatedBudget.min}
                          onChange={e => setForm(p => ({ ...p, estimatedBudget: { ...p.estimatedBudget, min: e.target.value } }))}
                          placeholder="Min" className="input" />
                        <span className="text-stone-300 flex-shrink-0">–</span>
                        <input type="number" min="0"
                          value={form.estimatedBudget.max}
                          onChange={e => setForm(p => ({ ...p, estimatedBudget: { ...p.estimatedBudget, max: e.target.value } }))}
                          placeholder="Max" className="input" />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="label">Additional notes</label>
                      <textarea rows={3} value={form.notes}
                        onChange={e => set('notes', e.target.value)}
                        placeholder="Any specific details, size, colour, variant, etc."
                        className="input resize-none" />
                    </div>
                  </div>

                  {/* Reference Images */}
                  <div className="card p-5">
                    <h3 className="section-title mb-4 flex items-center gap-2">
                      <Upload size={15} className="text-stone-400" />
                      Reference Images
                      <span className="text-xs font-normal text-stone-400 ml-1">(up to 3)</span>
                    </h3>

                    <div className="flex gap-3 flex-wrap">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-24 h-24">
                          <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-stone-200" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xs">
                            <X size={10} />
                          </button>
                        </div>
                      ))}

                      {previews.length < 3 && (
                        <label htmlFor="ref-imgs"
                          className="w-24 h-24 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center
                                     justify-center gap-1 cursor-pointer hover:border-stone-300 hover:bg-stone-50 transition-all">
                          <Upload size={16} className="text-stone-400" />
                          <span className="text-xs text-stone-400">Add photo</span>
                          <input id="ref-imgs" type="file" accept="image/*" multiple className="sr-only" onChange={handleImageAdd} />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                      Upload a screenshot from Amazon, Instagram, or any reference image.
                    </p>
                  </div>
                </div>

                {/* Right: Priority + Order Type + Submit */}
                <div className="space-y-4">
                  {/* Priority selector */}
                  <div className="card p-5">
                    <h3 className="section-title mb-4 flex items-center gap-2">
                      <Zap size={15} className="text-stone-400" />
                      Priority
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <button key={key} type="button" onClick={() => set('priority', key)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-150
                            ${form.priority === key
                              ? 'border-stone-900 bg-stone-50'
                              : 'border-stone-200 hover:border-stone-300'}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center
                              ${form.priority === key ? 'border-stone-900' : 'border-stone-300'}`}>
                              {form.priority === key && <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />}
                            </div>
                            <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Clock size={10} /> {cfg.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order type */}
                  <div className="card p-5">
                    <h3 className="section-title mb-3">Order Type</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'internal', label: 'HostelEase sources it', desc: 'We buy and deliver to you' },
                        { key: 'external', label: 'I already ordered online', desc: 'Just pick up from gate & deliver' }
                      ].map(t => (
                        <button key={t.key} type="button" onClick={() => set('orderType', t.key)}
                          className={`w-full p-3 rounded-xl border text-left transition-all duration-150
                            ${form.orderType === t.key ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                          <p className="text-sm font-medium text-stone-900">{t.label}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                    {form.orderType === 'external' && (
                      <div className="mt-3 p-2.5 bg-blue-50 rounded-lg flex gap-2">
                        <AlertCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                          For external orders, also submit a{' '}
                          <Link to="/parcel-request" className="font-semibold underline">Parcel Pickup Request</Link>
                          {' '}with your tracking ID.
                        </p>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
                    {submitting
                      ? <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting…
                        </span>
                      : <><Package size={16} /> Submit Request</>
                    }
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          /* History Tab */
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : myOrders.length === 0 ? (
              <div className="text-center py-20">
                <Package size={36} className="text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">No custom requests yet</p>
                <p className="text-stone-400 text-sm mb-4">Your requests will appear here</p>
                <button onClick={() => setTab('new')} className="btn-outline btn-sm">
                  Make your first request
                </button>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                {myOrders.map(order => {
                  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                  const priorityCfg = PRIORITY_CONFIG[order.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <motion.div key={order._id} variants={staggerItem} className="card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Image or emoji */}
                          <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                            {order.referenceImages?.[0]
                              ? <img src={order.referenceImages[0]} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate">{order.productName}</p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {order.brandName && `${order.brandName} · `}
                              Qty: {order.quantity} · {formatDate(order.createdAt)}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`badge ${statusCfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                {order.status}
                              </span>
                              <span className={`badge text-[10px] ${priorityCfg.bg} ${priorityCfg.color}`}>
                                {priorityCfg.label} priority
                              </span>
                              <span className="badge badge-stone">{order.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          {order.finalPrice && (
                            <p className="text-sm font-bold text-stone-900">₹{order.finalPrice}</p>
                          )}
                          {['Pending', 'Reviewing'].includes(order.status) && (
                            <button onClick={() => handleCancel(order._id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Admin note */}
                      {order.adminNote && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">Admin Note:</p>
                          <p className="text-xs text-blue-600">{order.adminNote}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
