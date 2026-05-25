// ─── useDebounce ──────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initSocket, disconnectSocket, getSocket } from '../services/socket.js';
import { addRealtime } from '../store/slices/notificationSlice.js';

export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── useAuth ──────────────────────────────────────────────────────
export const useAuth = () => {
  const { user, accessToken, loading } = useSelector(s => s.auth);
  return { user, accessToken, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin' };
};

// ─── useSocket ────────────────────────────────────────────────────
export const useSocket = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const mounted  = useRef(false);

  useEffect(() => {
    if (!user?._id || mounted.current) return;
    mounted.current = true;

    const socket = initSocket(user._id);

    // V1: General notifications
    socket.on('notification', (data) => {
      dispatch(addRealtime(data));
    });

    // V1: Order status updates
    socket.on('orderUpdate', (data) => {
      dispatch(addRealtime({ message: `Order status: ${data.status}`, type: 'order' }));
    });

    // V2: Custom order status updates
    socket.on('customOrderUpdate', (data) => {
      dispatch(addRealtime({
        message: data.message || `Custom order status: ${data.status}`,
        type:    'order',
        link:    '/custom-orders'
      }));
    });

    // V2: Delivery status updates (real-time tracker)
    socket.on('deliveryUpdate', (data) => {
      dispatch(addRealtime({
        message: data.message || `Delivery status: ${data.status}`,
        type:    'delivery',
        link:    data.deliveryId ? `/parcel-tracking/${data.deliveryId}` : '/parcel-request'
      }));
      // Also update delivery state in Redux
      if (data.deliveryId && data.status) {
        dispatch({ type: 'deliveries/updateDeliveryRealtime', payload: {
          deliveryId: data.deliveryId,
          status:     data.status
        }});
      }
    });

    return () => {
      disconnectSocket();
      mounted.current = false;
    };
  }, [user?._id]);
};

// ─── useClickOutside ─────────────────────────────────────────────
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
};

// ─── useLocalStorage ─────────────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const set = (v) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  };

  return [value, set];
};

// ─── usePagination ────────────────────────────────────────────────
export const usePagination = (initialPage = 1, initialLimit = 12) => {
  const [page,  setPage]  = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goTo  = (p) => setPage(p);
  const next  = ()  => setPage(p => p + 1);
  const prev  = ()  => setPage(p => Math.max(1, p - 1));
  const reset = ()  => setPage(1);

  return { page, limit, setPage: goTo, nextPage: next, prevPage: prev, resetPage: reset, setLimit };
};
