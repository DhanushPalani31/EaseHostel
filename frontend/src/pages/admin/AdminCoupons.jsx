import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, X, ToggleLeft, ToggleRight, Calendar, Percent, ShoppingBag } from 'lucide-react';
import api from '../../services/api.js';
import { formatDate } from '../../utils/index.js';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const EMPTY_COUPON = {
  code:               '',
  discountPercentage: '',
  maxDiscountAmount:  '',
  minOrderAmount:     '',
  expiryDate:         '',
  usageLimit:         100,
  description:        '',
  isActive:           true
};

export default function AdminCoupons() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_COUPON);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.data.coupons);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountPercentage || !form.expiryDate) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      await api.post('/coupons', form);
      toast.success('Coupon created!');
      setModal(false);
      setForm(EMPTY_COUPON);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/coupons/${id}/toggle`);
      toast.success(res.data.message);
      load();
    } catch { toast.error('Update failed'); }
  };

  const isExpired = (date) => new Date() > new Date(date);

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Coupons</h1>
          <p className="text-stone-400 text-sm">{coupons.length} promo codes</p>
        </div>
        <button onClick={() => { setForm(EMPTY_COUPON); setModal(true); }}
          className="btn-primary btn-md">
          <Plus size={14} /> Create coupon
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Coupons', value: coupons.length },
          { label: 'Active',        value: coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length },
          { label: 'Expired',       value: coupons.filter(c => isExpired(c.expiryDate)).length },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-stone-900 tracking-tighter">{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coupon cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={32} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map(coupon => {
            const expired = isExpired(coupon.expiryDate);
            const usable  = coupon.isActive && !expired && coupon.usedCount < coupon.usageLimit;

            return (
              <motion.div key={coupon._id} variants={staggerItem}
                className={`card p-5 transition-all duration-200 ${!usable ? 'opacity-60' : ''}`}>
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                      ${usable ? 'bg-brand-50' : 'bg-stone-100'}`}>
                      <Tag size={15} className={usable ? 'text-brand-600' : 'text-stone-400'} />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-stone-900 tracking-wider text-sm">
                        {coupon.code}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {expired
                          ? <span className="badge badge-red">Expired</span>
                          : coupon.isActive
                            ? <span className="badge badge-green">Active</span>
                            : <span className="badge badge-stone">Inactive</span>
                        }
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleToggle(coupon._id)}
                    className={`p-1 rounded-lg transition-colors ${coupon.isActive ? 'text-stone-900 hover:bg-stone-100' : 'text-stone-400 hover:bg-stone-100'}`}>
                    {coupon.isActive
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} />
                    }
                  </button>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Percent size={11} />
                    <span>{coupon.discountPercentage}% off</span>
                    {coupon.maxDiscountAmount && (
                      <span className="text-stone-400">(max ₹{coupon.maxDiscountAmount})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={11} />
                    <span>Min ₹{coupon.minOrderAmount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    <span>Expires {formatDate(coupon.expiryDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag size={11} />
                    <span>{coupon.usedCount}/{coupon.usageLimit} used</span>
                  </div>
                </div>

                {/* Usage progress */}
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500
                      ${coupon.usedCount / coupon.usageLimit > 0.8 ? 'bg-red-400' : 'bg-brand-400'}`}
                    style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                  />
                </div>

                {coupon.description && (
                  <p className="text-xs text-stone-400 mt-2 truncate">{coupon.description}</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Create Coupon Modal ──────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900">Create Coupon</h2>
                  <button onClick={() => setModal(false)} className="btn-ghost btn-sm p-1.5">
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-4">
                  {/* Code */}
                  <div>
                    <label className="label">Coupon code *</label>
                    <input
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. HOSTEL20"
                      className="input font-mono tracking-widest"
                      required
                    />
                    <p className="text-xs text-stone-400 mt-1">Will be auto-uppercased</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Discount % */}
                    <div>
                      <label className="label">Discount % *</label>
                      <input type="number" min="1" max="100"
                        value={form.discountPercentage}
                        onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))}
                        placeholder="20" className="input" required />
                    </div>

                    {/* Max discount */}
                    <div>
                      <label className="label">Max discount (₹)</label>
                      <input type="number" min="0"
                        value={form.maxDiscountAmount}
                        onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                        placeholder="50 (optional)" className="input" />
                    </div>

                    {/* Min order */}
                    <div>
                      <label className="label">Min order (₹)</label>
                      <input type="number" min="0"
                        value={form.minOrderAmount}
                        onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                        placeholder="0" className="input" />
                    </div>

                    {/* Usage limit */}
                    <div>
                      <label className="label">Usage limit</label>
                      <input type="number" min="1"
                        value={form.usageLimit}
                        onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                        placeholder="100" className="input" />
                    </div>
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="label">Expiry date *</label>
                    <input type="date"
                      value={form.expiryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                      className="input" required />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="label">Description</label>
                    <input value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="e.g. First order discount" className="input" />
                  </div>

                  {/* Active toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className={`w-9 h-5 rounded-full transition-colors duration-200 relative
                        ${form.isActive ? 'bg-stone-900' : 'bg-stone-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200
                        ${form.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-stone-700">Active immediately</span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModal(false)}
                      className="btn-outline btn-md flex-1">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="btn-primary btn-md flex-1">
                      {saving ? 'Creating…' : 'Create coupon'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
