import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

/**
 * useWishlist – manages wishlist fetch + toggle with optimistic UI.
 */
export const useWishlist = () => {
  const { user } = useSelector(s => s.auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.data.wishlist);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (productId) => {
    if (!user) { toast.error('Please log in'); return; }
    try {
      const res = await api.post('/wishlist', { productId });
      const { added } = res.data.data;
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
      load(); // refresh
    } catch {
      toast.error('Failed to update wishlist');
    }
  }, [user, load]);

  const isInWishlist = useCallback((productId) =>
    wishlist.some(p => (p._id || p) === productId),
    [wishlist]
  );

  return { wishlist, loading, toggle, isInWishlist, refresh: load };
};
