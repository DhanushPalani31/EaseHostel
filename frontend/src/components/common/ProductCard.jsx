import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice.js';
import { formatCurrency, truncate } from '../../utils/index.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const ProductCard = memo(({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please log in to add to cart'); return; }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please log in'); return; }
    try {
      await api.post('/wishlist', { productId: product._id });
      toast.success('Wishlist updated');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Link to={`/products/${product._id}`} className="block">
        <div className="card-hover overflow-hidden group">
          {/* Image */}
          <div className="relative aspect-square bg-stone-100 overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">🛍️</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
              {discount > 0 && (
                <span className="badge bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                  -{discount}%
                </span>
              )}
              {product.isTrending && (
                <span className="badge bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                  🔥 Hot
                </span>
              )}
              {!product.isAvailable && (
                <span className="badge bg-stone-700 text-white text-[10px] px-1.5 py-0.5">
                  Out of stock
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button onClick={handleWishlist}
              className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-all duration-200 hover:bg-white hover:scale-110 shadow-xs">
              <Heart size={13} className="text-stone-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3.5">
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <p className="text-sm font-medium text-stone-900 leading-snug mb-2">
              {truncate(product.productName, 40)}
            </p>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-stone-500">
                  {product.ratings} ({product.numReviews})
                </span>
              </div>
            )}

            {/* Price + CTA */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-bold text-stone-900 tracking-tight">
                  {formatCurrency(product.price)}
                </p>
                {product.originalPrice && (
                  <p className="text-xs text-stone-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </p>
                )}
              </div>
              <button onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stock === 0}
                className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center
                           text-white hover:bg-stone-700 active:scale-95 transition-all duration-150
                           disabled:opacity-40 disabled:pointer-events-none flex-shrink-0">
                <ShoppingCart size={14} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
