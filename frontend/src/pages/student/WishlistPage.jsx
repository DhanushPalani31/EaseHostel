// WishlistPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard.jsx';
import api from '../../services/api.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

export function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]  = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.data.wishlist);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-6">Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i)=><div key={i} className="skeleton aspect-square rounded-2xl"/>)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={36} className="text-stone-300 mx-auto mb-3"/>
          <p className="text-stone-500">Your wishlist is empty</p>
          <p className="text-stone-400 text-sm">Tap the heart on any product to save it</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map(p => (
            <motion.div key={p._id} variants={staggerItem}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
export default WishlistPage;
