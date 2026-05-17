import api from './api.js';
import toast from 'react-hot-toast';

/**
 * loadRazorpayScript – dynamically injects the Razorpay checkout SDK.
 * Returns a promise that resolves when the script is ready.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }

    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * initiateRazorpayPayment – orchestrates the full Razorpay checkout flow:
 * 1. Load SDK
 * 2. Create server-side Razorpay order
 * 3. Open checkout modal
 * 4. Verify signature on success
 */
export const initiateRazorpayPayment = async ({ orderId, user, onSuccess, onFailure }) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    toast.error('Failed to load payment gateway. Check your internet connection.');
    onFailure?.('SDK_LOAD_FAILED');
    return;
  }

  try {
    // Step 1: Create Razorpay order on server
    const res = await api.post('/payments/create-order', { orderId });
    const { razorpayOrderId, amount, currency, keyId } = res.data.data;

    // Step 2: Open checkout modal
    const options = {
      key:         keyId,
      amount,
      currency,
      name:        'HostelEase',
      description: 'Hostel Essentials Order',
      image:       '/favicon.svg',
      order_id:    razorpayOrderId,

      handler: async (response) => {
        try {
          // Step 3: Verify signature server-side
          const verifyRes = await api.post('/payments/verify', {
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId
          });
          toast.success('Payment successful! 🎉');
          onSuccess?.(verifyRes.data.data.order);
        } catch (err) {
          toast.error('Payment verification failed. Please contact support.');
          onFailure?.(err);
        }
      },

      prefill: {
        name:    user?.name,
        email:   user?.email,
        contact: user?.phoneNumber || ''
      },

      notes:  { orderId },
      theme:  { color: '#161210' },

      modal: {
        ondismiss: () => {
          toast('Payment cancelled', { icon: '⚠️' });
          onFailure?.('PAYMENT_DISMISSED');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      toast.error(`Payment failed: ${resp.error.description}`);
      onFailure?.(resp.error);
    });
    rzp.open();

  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to initialize payment');
    onFailure?.(err);
  }
};
