import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, ArrowLeft, Package, Truck, Shield, Plus, Minus } from 'lucide-react';
import { fetchProductById, clearCurrent } from '../../store/slices/productSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { formatCurrency, formatDate, timeAgo } from '../../utils/index.js';
import { slideUp } from '../../animations/variants.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: product, loading } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);

  const [qty, setQty]           = useState(1);
  const [review, setReview]     = useState({ rating: 5, comment: '' });
  const [submitting, setSubmit] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  const handleAddToCart = () => {
    if (!user) { toast.error('Please log in'); return; }
    dispatch(addToCart({ productId: id, quantity: qty }));
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in'); return; }
    setSubmit(true);
    try {
      await api.post(`/products/${id}/review`, review);
      toast.success('Review submitted!');
      dispatch(fetchProductById(id));
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmit(false);
    }
  };

  if (loading || !product) return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="skeleton h-8 w-32 rounded-xl mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          {[40, 60, 24, 32, 24].map((w, i) => (
            <div key={i} className={`skeleton h-5 w-${w} rounded`} />
          ))}
        </div>
      </div>
    </div>
  );

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* ── Image ─────────────────────────────────────── */}
        <motion.div {...slideUp} className="aspect-square bg-stone-100 rounded-2xl overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.productName}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🛍️</div>
          )}
        </motion.div>

        {/* ── Details ───────────────────────────────────── */}
        <motion.div {...slideUp} transition={{ delay: 0.08 }} className="space-y-5">
          {/* Category & badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-stone">{product.category}</span>
            {product.isTrending && <span className="badge badge-amber">🔥 Trending</span>}
            {!product.isAvailable && <span className="badge badge-red">Out of stock</span>}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight leading-snug mb-2">
              {product.productName}
            </h1>
            {product.brand && <p className="text-sm text-stone-400">by {product.brand}</p>}
          </div>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14}
                    className={s <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'} />
                ))}
              </div>
              <span className="text-sm text-stone-500">{product.ratings} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-stone-900 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-stone-400 line-through">{formatCurrency(product.originalPrice)}</span>
            )}
            {discount > 0 && <span className="badge badge-red text-sm">{discount}% off</span>}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package size={14} className={product.stock > 0 ? 'text-green-500' : 'text-red-500'} />
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + Add to cart */}
          {product.isAvailable && product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-stone-900">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary btn-md flex-1">
                <ShoppingCart size={15} /> Add to cart
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Truck,  text: 'Delivery within the slot' },
              { icon: Shield, text: 'Secure payment' }
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2 text-xs text-stone-500">
                <b.icon size={13} className="text-stone-400 flex-shrink-0" />
                {b.text}
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Reviews ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Review form */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Write a review</h3>
          {user ? (
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                      <Star size={22}
                        className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 hover:text-amber-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Comment (optional)</label>
                <textarea value={review.comment}
                  onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                  rows={3} placeholder="Share your experience…"
                  className="input resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary btn-sm">
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-stone-500 text-sm mb-3">Log in to leave a review</p>
              <Link to="/login" className="btn-outline btn-sm">Sign in</Link>
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div>
          <h3 className="section-title mb-4">
            Reviews {product.numReviews > 0 && <span className="text-stone-400 font-normal text-sm">({product.numReviews})</span>}
          </h3>
          {product.reviews?.length === 0 ? (
            <p className="text-stone-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews?.slice(0, 5).map((r, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-stone-500">
                    {r.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-stone-900">{r.name}</span>
                      <span className="text-xs text-stone-400">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 my-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11}
                          className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-stone-600">{r.comment}</p>}
                    {r.verifiedPurchase && (
                      <span className="text-[10px] text-green-600 font-medium">✓ Verified purchase</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
