import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Tag, ChevronDown, CheckCircle } from 'lucide-react';
import { placeOrder } from '../../store/slices/orderSlice.js';
import { fetchCart } from '../../store/slices/cartSlice.js';
import { formatCurrency } from '../../utils/index.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { slideUp } from '../../animations/variants.js';

const DELIVERY_SLOTS = [
  '8:00 AM – 10:00 AM',
  '12:00 PM – 2:00 PM',
  '4:00 PM – 6:00 PM',
  '7:00 PM – 9:00 PM'
];

export default function CheckoutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const { cart }  = useSelector(s => s.cart);
  const { placing } = useSelector(s => s.orders);

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [slot, setSlot]     = useState(DELIVERY_SLOTS[0]);
  const [notes, setNotes]   = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const items      = cart?.items || [];
  const subtotal   = cart?.totalPrice || 0;
  const total      = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: coupon, orderAmount: subtotal });
      setDiscount(res.data.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! ₹${res.data.data.discount} off`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRazorpay = async (orderId) => {
    try {
      const res = await api.post('/payments/create-order', { orderId });
      const { razorpayOrderId, amount, currency, keyId } = res.data.data;

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'HostelEase',
        description: 'Hostel Essentials Order',
        order_id:    razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId
            });
            toast.success('Payment successful! 🎉');
            navigate('/orders');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill:  { name: user?.name, email: user?.email, contact: user?.phoneNumber },
        theme:    { color: '#161210' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch {
      toast.error('Failed to initialize payment');
    }
  };

  const handleSubmit = async () => {
    const orderPayload = {
      items: items.map(i => ({ product: i.product, quantity: i.quantity })),
      paymentMethod,
      deliverySlot: slot,
      deliveryNotes: notes,
      ...(couponApplied && { couponCode: coupon })
    };

    const result = await dispatch(placeOrder(orderPayload));
    if (placeOrder.fulfilled.match(result)) {
      const orderId = result.payload._id;
      if (paymentMethod === 'Razorpay') {
        await handleRazorpay(orderId);
      } else {
        toast.success('Order placed! Pay on delivery.');
        navigate('/orders');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Checkout</h1>
        <p className="text-stone-400 text-sm mt-0.5">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Form ─────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Delivery info */}
          <motion.div {...slideUp} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={16} className="text-stone-500" />
              <h3 className="section-title">Delivery details</h3>
            </div>
            <div className="bg-stone-50 rounded-xl p-3.5 mb-4">
              <p className="text-sm text-stone-600">
                <span className="font-medium text-stone-900">Delivering to:</span>{' '}
                {user?.hostelBlock
                  ? `Block ${user.hostelBlock}, Room ${user.roomNumber}`
                  : 'No address set – please update your profile'}
              </p>
            </div>
            <div>
              <label className="label">Delivery slot</label>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_SLOTS.map(s => (
                  <button key={s} onClick={() => setSlot(s)} type="button"
                    className={`p-3 rounded-xl border text-sm font-medium text-left transition-all duration-150
                      ${slot === s
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Delivery notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} placeholder="e.g. Leave at hostel reception"
                className="input resize-none" />
            </div>
          </motion.div>

          {/* Payment method */}
          <motion.div {...slideUp} transition={{ delay: 0.05 }} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-stone-500" />
              <h3 className="section-title">Payment method</h3>
            </div>
            <div className="space-y-2">
              {['Cash on Delivery', 'Razorpay'].map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)} type="button"
                  className={`w-full p-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all duration-150
                    ${paymentMethod === method
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${paymentMethod === method ? 'border-stone-900' : 'border-stone-300'}`}>
                    {paymentMethod === method && <div className="w-2 h-2 bg-stone-900 rounded-full" />}
                  </div>
                  <span className="text-stone-900">{method}</span>
                  {method === 'Razorpay' && (
                    <span className="ml-auto text-xs text-stone-400">Cards, UPI, Netbanking</span>
                  )}
                  {method === 'Cash on Delivery' && (
                    <span className="ml-auto text-xs text-stone-400">Pay when received</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Coupon */}
          <motion.div {...slideUp} transition={{ delay: 0.1 }} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-stone-500" />
              <h3 className="section-title">Promo code</h3>
            </div>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="Enter coupon code" disabled={couponApplied}
                className="input flex-1" />
              <button onClick={applyCoupon} disabled={couponLoading || couponApplied || !coupon}
                className="btn-outline btn-md flex-shrink-0">
                {couponLoading ? '…' : couponApplied ? <CheckCircle size={16} className="text-green-500" /> : 'Apply'}
              </button>
            </div>
            {couponApplied && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle size={12} /> Coupon applied – saving {formatCurrency(discount)}
              </p>
            )}
          </motion.div>
        </div>

        {/* ── Right: Summary ──────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-6">
            <h3 className="section-title mb-4">Order summary</h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item._id || item.product} className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-900 truncate">{item.productName}</p>
                    <p className="text-xs text-stone-400">×{item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-stone-900 flex-shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600 font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-stone-100 pt-2 flex justify-between">
                <span className="font-bold text-stone-900">Total</span>
                <span className="font-bold text-stone-900 text-lg tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={placing || items.length === 0}
              className="btn-primary btn-md w-full">
              {placing
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing order…
                  </span>
                : `Place order · ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
