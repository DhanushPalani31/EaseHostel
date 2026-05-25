import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, MapPin, Phone, Clock,
  CheckCircle, Truck, Star, Shield, Copy, Check
} from 'lucide-react';
import { fetchDeliveryById } from '../../store/slices/deliverySlice.js';
import { formatDateTime, timeAgo } from '../../utils/index.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const DELIVERY_STEPS = [
  { key: 'Requested',        icon: Package,      label: 'Request Submitted',  desc: 'We received your pickup request' },
  { key: 'Accepted',         icon: CheckCircle,  label: 'Accepted',           desc: 'A staff member accepted your request' },
  { key: 'Waiting at Gate',  icon: MapPin,       label: 'Waiting at Gate',    desc: 'Parcel expected at the gate' },
  { key: 'Picked Up',        icon: Package,      label: 'Picked Up',          desc: 'Staff collected your parcel from gate' },
  { key: 'Out for Delivery', icon: Truck,        label: 'Out for Delivery',   desc: 'On the way to your room' },
  { key: 'Delivered',        icon: CheckCircle,  label: 'Delivered',          desc: 'Parcel delivered to your room ✅' },
];

const PLATFORMS_EMOJI = {
  Amazon: '📦', Flipkart: '🛒', Zepto: '⚡',
  'Swiggy Instamart': '🧡', Blinkit: '💛', Myntra: '👗', Meesho: '🛍️', Other: '🌐'
};

export default function DeliveryTrackingPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { current: delivery, loading } = useSelector(s => s.deliveries);

  const [otp,       setOtp]      = useState('');
  const [verifying, setVerifying]= useState(false);
  const [copied,    setCopied]   = useState(false);

  useEffect(() => {
    dispatch(fetchDeliveryById(id));
    // Poll every 30s for live updates
    const interval = setInterval(() => dispatch(fetchDeliveryById(id)), 30000);
    return () => clearInterval(interval);
  }, [id, dispatch]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) { toast.error('Enter the 4-digit OTP'); return; }
    setVerifying(true);
    try {
      await api.post(`/external-deliveries/${id}/verify-otp`, { otp });
      toast.success('Delivery confirmed! ✅');
      dispatch(fetchDeliveryById(id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setVerifying(false); }
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(delivery?.trackingId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !delivery) return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="skeleton h-8 w-32 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );

  if (!delivery) return (
    <div className="p-6 text-center py-20">
      <p className="text-stone-500">Delivery not found</p>
      <button onClick={() => navigate(-1)} className="btn-outline btn-sm mt-4">Go back</button>
    </div>
  );

  const currentStepIdx = DELIVERY_STEPS.findIndex(s => s.key === delivery.deliveryStatus);
  const isCancelled    = delivery.deliveryStatus === 'Cancelled';
  const isDelivered    = delivery.deliveryStatus === 'Delivered';
  const isOutForDelivery = delivery.deliveryStatus === 'Out for Delivery';

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowLeft size={14} /> Back to parcels
      </button>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl flex-shrink-0">
              {PLATFORMS_EMOJI[delivery.platformName] || '📦'}
            </div>
            <div>
              <p className="text-lg font-bold text-stone-900">{delivery.platformName}</p>
              {delivery.trackingId && (
                <button onClick={copyTrackingId}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 mt-0.5 transition-colors">
                  <span className="font-mono">{delivery.trackingId}</span>
                  {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                </button>
              )}
              <p className="text-xs text-stone-400 mt-0.5">{timeAgo(delivery.createdAt)}</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold
            ${isDelivered ? 'bg-green-100 text-green-700' :
              isCancelled ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-700'}`}>
            {delivery.deliveryStatus}
          </div>
        </div>

        {/* ETA */}
        {delivery.estimatedDeliveryTime && !isDelivered && !isCancelled && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
            <Clock size={14} className="text-amber-500" />
            <span className="text-sm text-amber-700">
              ETA: <strong>{formatDateTime(delivery.estimatedDeliveryTime)}</strong>
            </span>
          </div>
        )}
      </motion.div>

      {/* Live tracker */}
      {!isCancelled && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card p-5">
          <h3 className="section-title mb-5">Live Tracking</h3>
          <div className="space-y-0">
            {DELIVERY_STEPS.map((step, i) => {
              const isDone    = i < currentStepIdx;
              const isCurrent = i === currentStepIdx;
              const isPending = i > currentStepIdx;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  {/* Icon + line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={isCurrent ? { scale: 0.8 } : {}}
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isDone    ? 'bg-stone-900 text-white' :
                          isCurrent ? 'bg-brand-500 text-white ring-4 ring-brand-100' :
                          'bg-stone-100 text-stone-300'}`}>
                      {isDone ? <CheckCircle size={16} /> : <Icon size={16} />}
                    </motion.div>
                    {i < DELIVERY_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 my-1 transition-all duration-500
                        ${isDone ? 'bg-stone-900' : 'bg-stone-200'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6 flex-1 min-w-0">
                    <p className={`text-sm font-semibold transition-colors
                      ${isDone ? 'text-stone-600' : isCurrent ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isCurrent ? 'text-stone-500' : 'text-stone-300'}`}>
                      {step.desc}
                    </p>
                    {isCurrent && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                        <span className="text-xs font-medium text-brand-600">Current status</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="card p-5 border-red-200 bg-red-50">
          <p className="text-red-700 font-semibold">This pickup request was cancelled.</p>
          <p className="text-red-500 text-sm mt-1">
            {delivery.statusHistory?.at(-1)?.note || 'Request cancelled'}
          </p>
        </div>
      )}

      {/* Staff info */}
      {delivery.assignedStaff && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-5">
          <h3 className="section-title mb-3">Delivery Staff</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0">
              {delivery.assignedStaff.photo
                ? <img src={delivery.assignedStaff.photo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-bold text-stone-500">
                    {delivery.assignedStaff.name?.[0]}
                  </div>
              }
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">{delivery.assignedStaff.name}</p>
              {delivery.assignedStaff.rating > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-stone-500">{delivery.assignedStaff.rating}</span>
                </div>
              )}
            </div>
            <a href={`tel:${delivery.assignedStaff.phone}`}
              className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center hover:bg-green-200 transition-colors">
              <Phone size={16} className="text-green-600" />
            </a>
          </div>
        </motion.div>
      )}

      {/* OTP Verification — only shown when Out for Delivery */}
      {isOutForDelivery && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="card p-5 border-brand-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-brand-500" />
            <h3 className="section-title">Confirm Delivery</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">
            Enter the 4-digit OTP shown by the delivery staff to confirm you received your parcel.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={otp}
              onChange={e => setOtp(e.target.value.slice(0, 4))}
              placeholder="0000"
              className="input text-center text-2xl font-mono tracking-widest w-32"
              maxLength={4}
            />
            <button onClick={handleVerifyOTP} disabled={verifying || otp.length !== 4}
              className="btn-primary btn-md flex-1">
              {verifying ? 'Verifying…' : 'Confirm Receipt'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Delivery proof */}
      {isDelivered && delivery.deliveryProof && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Delivery Proof</h3>
          <img src={delivery.deliveryProof} alt="Delivery proof"
            className="w-full rounded-xl object-cover max-h-48" />
        </div>
      )}

      {/* Delivery info */}
      <div className="card p-5">
        <h3 className="section-title mb-3">Delivery Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Deliver to',    value: `Block ${delivery.hostelBlock}, Room ${delivery.roomNumber}` },
            { label: 'Contact',       value: delivery.contactNumber },
            { label: 'Pickup from',   value: delivery.pickupLocation },
            { label: 'Delivery fee',  value: `₹${delivery.deliveryFee}` },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-stone-400 mb-0.5">{item.label}</p>
              <p className="font-medium text-stone-900">{item.value}</p>
            </div>
          ))}
        </div>
        {delivery.deliveryNotes && (
          <div className="mt-3 p-2.5 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-400">Note:</p>
            <p className="text-sm text-stone-700">{delivery.deliveryNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
