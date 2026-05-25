import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Upload, X, MapPin, Phone, Calendar,
  Package, ExternalLink, Info, History, Plus
} from 'lucide-react';
import { submitDelivery, fetchMyDeliveries, cancelDelivery } from '../../store/slices/deliverySlice.js';
import { formatDate, timeAgo } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const PLATFORMS = [
  { name: 'Amazon',         emoji: '📦', color: 'bg-amber-50 border-amber-200' },
  { name: 'Flipkart',       emoji: '🛒', color: 'bg-blue-50 border-blue-200' },
  { name: 'Zepto',          emoji: '⚡', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Swiggy Instamart',emoji: '🧡', color: 'bg-orange-50 border-orange-200' },
  { name: 'Blinkit',        emoji: '💛', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Myntra',         emoji: '👗', color: 'bg-pink-50 border-pink-200' },
  { name: 'Meesho',         emoji: '🛍️', color: 'bg-purple-50 border-purple-200' },
  { name: 'Other',          emoji: '🌐', color: 'bg-stone-50 border-stone-200' },
];

const STATUS_STEPS = [
  'Requested', 'Accepted', 'Waiting at Gate', 'Picked Up', 'Out for Delivery', 'Delivered'
];

const STATUS_COLOR = {
  Requested:         'badge-amber',
  Accepted:          'badge-blue',
  'Waiting at Gate': 'badge-blue',
  'Picked Up':       'badge-blue',
  'Out for Delivery':'badge-amber',
  Delivered:         'badge-green',
  Cancelled:         'badge-red',
};

const EMPTY_FORM = {
  platformName: '', trackingId: '', parcelDescription: '',
  pickupLocation: 'Main Gate', hostelBlock: '', roomNumber: '',
  contactNumber: '', expectedArrival: '', deliveryNotes: ''
};

export default function ExternalDeliveryPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { myDeliveries, loading, submitting } = useSelector(s => s.deliveries);

  const [tab,      setTab]      = useState('new');
  const [form,     setForm]     = useState({
    ...EMPTY_FORM,
    hostelBlock:   user?.hostelBlock  || '',
    roomNumber:    user?.roomNumber   || '',
    contactNumber: user?.phoneNumber  || ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [errors,     setErrors]     = useState({});

  useEffect(() => { dispatch(fetchMyDeliveries()); }, [dispatch]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleScreenshot = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setScreenshot(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const validate = () => {
    const e = {};
    if (!form.platformName)   e.platformName   = 'Select a platform';
    if (!form.hostelBlock)    e.hostelBlock     = 'Hostel block is required';
    if (!form.roomNumber)     e.roomNumber      = 'Room number is required';
    if (!form.contactNumber)  e.contactNumber   = 'Contact number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (screenshot) fd.append('screenshot', screenshot);

    const result = await dispatch(submitDelivery(fd));
    if (submitDelivery.fulfilled.match(result)) {
      setForm({ ...EMPTY_FORM, hostelBlock: user?.hostelBlock || '', roomNumber: user?.roomNumber || '', contactNumber: user?.phoneNumber || '' });
      setScreenshot(null); setPreview(null);
      setTab('history');
    }
  };

  const activeDeliveries = myDeliveries.filter(d => !['Delivered', 'Cancelled'].includes(d.deliveryStatus));
  const pastDeliveries   = myDeliveries.filter(d =>  ['Delivered', 'Cancelled'].includes(d.deliveryStatus));

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Parcel Pickup</h1>
        <p className="text-stone-400 text-sm mt-1">
          Ordered from Amazon or Zepto? We'll pick it up from the gate and deliver it to your room.
        </p>
      </div>

      {/* Active deliveries banner */}
      {activeDeliveries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {activeDeliveries.length} active pickup{activeDeliveries.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-600">Track your parcels in real time</p>
            </div>
          </div>
          <button onClick={() => setTab('history')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors">
            Track now →
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit mb-6">
        {[
          { key: 'new',     label: 'New Request', icon: Plus },
          { key: 'history', label: 'My Parcels',  icon: History }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${tab === t.key ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'new' ? (
          <motion.div key="new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">

                  {/* Platform Selection */}
                  <div className="card p-5">
                    <h3 className="section-title mb-4">Where did you order from?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PLATFORMS.map(p => (
                        <button key={p.name} type="button" onClick={() => set('platformName', p.name)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150
                            ${form.platformName === p.name
                              ? 'border-stone-900 bg-stone-50 shadow-xs'
                              : `${p.color} hover:border-stone-300`}`}>
                          <span className="text-2xl">{p.emoji}</span>
                          <span className="text-xs font-medium text-stone-700 leading-tight">{p.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.platformName && (
                      <p className="mt-2 text-xs text-red-500">{errors.platformName}</p>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="card p-5 space-y-4">
                    <h3 className="section-title">Order Details</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Tracking ID (optional)</label>
                        <input value={form.trackingId}
                          onChange={e => set('trackingId', e.target.value)}
                          placeholder="OD12345678" className="input" />
                      </div>
                      <div>
                        <label className="label">Expected arrival date</label>
                        <input type="date" value={form.expectedArrival}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => set('expectedArrival', e.target.value)}
                          className="input" />
                      </div>
                    </div>

                    <div>
                      <label className="label">Parcel description (optional)</label>
                      <textarea rows={2} value={form.parcelDescription}
                        onChange={e => set('parcelDescription', e.target.value)}
                        placeholder="e.g. Blue box, approximately A4 size, contains shoes"
                        className="input resize-none" />
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="label">Order screenshot (optional)</label>
                      <label htmlFor="screenshot"
                        className="flex items-center gap-3 p-3 border-2 border-dashed border-stone-200 rounded-xl
                                   cursor-pointer hover:border-stone-300 hover:bg-stone-50 transition-all overflow-hidden">
                        {preview ? (
                          <div className="flex items-center gap-3 flex-1">
                            <img src={preview} alt="" className="w-16 h-12 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">{screenshot?.name}</p>
                              <p className="text-xs text-stone-400">Click to change</p>
                            </div>
                            <button type="button" onClick={(e) => { e.preventDefault(); setScreenshot(null); setPreview(null); }}
                              className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-stone-400">
                            <Upload size={18} />
                            <span className="text-sm">Upload order confirmation screenshot</span>
                          </div>
                        )}
                        <input id="screenshot" type="file" accept="image/*" className="sr-only" onChange={handleScreenshot} />
                      </label>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="card p-5 space-y-4">
                    <h3 className="section-title flex items-center gap-2">
                      <MapPin size={14} className="text-stone-400" /> Delivery Address
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Hostel block <span className="text-red-500">*</span></label>
                        <input value={form.hostelBlock}
                          onChange={e => set('hostelBlock', e.target.value)}
                          placeholder="e.g. A, B, C" className={`input ${errors.hostelBlock ? 'input-error' : ''}`} />
                        {errors.hostelBlock && <p className="mt-1 text-xs text-red-500">{errors.hostelBlock}</p>}
                      </div>
                      <div>
                        <label className="label">Room number <span className="text-red-500">*</span></label>
                        <input value={form.roomNumber}
                          onChange={e => set('roomNumber', e.target.value)}
                          placeholder="e.g. 204" className={`input ${errors.roomNumber ? 'input-error' : ''}`} />
                        {errors.roomNumber && <p className="mt-1 text-xs text-red-500">{errors.roomNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Contact number <span className="text-red-500">*</span></label>
                        <input value={form.contactNumber}
                          onChange={e => set('contactNumber', e.target.value)}
                          placeholder="9876543210" className={`input ${errors.contactNumber ? 'input-error' : ''}`} />
                        {errors.contactNumber && <p className="mt-1 text-xs text-red-500">{errors.contactNumber}</p>}
                      </div>
                      <div>
                        <label className="label">Pickup location</label>
                        <input value={form.pickupLocation}
                          onChange={e => set('pickupLocation', e.target.value)}
                          placeholder="Main Gate" className="input" />
                      </div>
                    </div>

                    <div>
                      <label className="label">Delivery notes (optional)</label>
                      <input value={form.deliveryNotes}
                        onChange={e => set('deliveryNotes', e.target.value)}
                        placeholder="e.g. Call before coming, I'll be in the library"
                        className="input" />
                    </div>
                  </div>
                </div>

                {/* Right: Summary + Fee */}
                <div className="space-y-4">
                  <div className="card p-5">
                    <h3 className="section-title mb-4">Delivery Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <span className="text-2xl">
                          {PLATFORMS.find(p => p.name === form.platformName)?.emoji || '📦'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            {form.platformName || 'Select platform'}
                          </p>
                          {form.trackingId && (
                            <p className="text-xs text-stone-400">{form.trackingId}</p>
                          )}
                        </div>
                      </div>

                      {form.hostelBlock && (
                        <div className="flex items-center gap-2 text-sm text-stone-600 p-3 bg-stone-50 rounded-xl">
                          <MapPin size={13} className="text-stone-400" />
                          Block {form.hostelBlock}, Room {form.roomNumber}
                        </div>
                      )}

                      <div className="border-t border-stone-100 pt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Delivery fee</span>
                          <span className="font-semibold text-stone-900">
                            ₹{['Amazon', 'Flipkart', 'Myntra'].includes(form.platformName) ? 30 : 20}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">Pay at delivery (Cash/UPI)</p>
                      </div>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex gap-2">
                      <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700 space-y-1">
                        <p className="font-semibold">How it works</p>
                        <p>1. Submit this request</p>
                        <p>2. We accept & monitor your parcel</p>
                        <p>3. Staff picks up from gate</p>
                        <p>4. Delivered to your room ✅</p>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
                    {submitting
                      ? <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting…
                        </span>
                      : <><Truck size={16} /> Submit Pickup Request</>
                    }
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          /* History / Tracking tab */
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
              </div>
            ) : myDeliveries.length === 0 ? (
              <div className="text-center py-20">
                <Truck size={36} className="text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">No parcel requests yet</p>
                <button onClick={() => setTab('new')} className="btn-outline btn-sm mt-4">
                  Submit a request
                </button>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                {myDeliveries.map(d => {
                  const stepIdx  = STATUS_STEPS.indexOf(d.deliveryStatus);
                  const platform = PLATFORMS.find(p => p.name === d.platformName);
                  const isActive = !['Delivered', 'Cancelled'].includes(d.deliveryStatus);

                  return (
                    <motion.div key={d._id} variants={staggerItem} className="card overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{platform?.emoji || '📦'}</span>
                            <div>
                              <p className="font-semibold text-stone-900">{d.platformName}</p>
                              <p className="text-xs text-stone-400">
                                {d.trackingId ? `#${d.trackingId} · ` : ''}
                                {timeAgo(d.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${STATUS_COLOR[d.deliveryStatus] || 'badge-stone'}`}>
                              {d.deliveryStatus}
                            </span>
                            <Link to={`/parcel-tracking/${d._id}`}
                              className="text-xs text-stone-500 hover:text-stone-900 font-medium">
                              Track →
                            </Link>
                          </div>
                        </div>

                        {/* Progress bar for active deliveries */}
                        {isActive && d.deliveryStatus !== 'Cancelled' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              {STATUS_STEPS.map((step, i) => (
                                <div key={step} className="flex items-center flex-1">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all
                                    ${i <= stepIdx ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    {i < stepIdx ? '✓' : i + 1}
                                  </div>
                                  {i < STATUS_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 transition-all ${i < stepIdx ? 'bg-stone-900' : 'bg-stone-200'}`} />
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-stone-400 text-center mt-1">
                              {d.deliveryStatus}
                            </p>
                          </div>
                        )}

                        {/* Staff info */}
                        {d.assignedStaff && (
                          <div className="mt-3 flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl">
                            <div className="w-7 h-7 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
                              {d.assignedStaff.photo
                                ? <img src={d.assignedStaff.photo} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-stone-500">
                                    {d.assignedStaff.name?.[0]}
                                  </div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-stone-700">{d.assignedStaff.name}</p>
                              <p className="text-xs text-stone-400">Delivery staff</p>
                            </div>
                            <a href={`tel:${d.assignedStaff.phone}`}
                              className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                              <Phone size={12} className="text-green-600" />
                            </a>
                          </div>
                        )}

                        {/* Cancel */}
                        {d.deliveryStatus === 'Requested' && (
                          <button onClick={() => dispatch(cancelDelivery(d._id))}
                            className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium">
                            Cancel request
                          </button>
                        )}
                      </div>
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
