import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { fetchCart, updateItem, removeItem, clearCartAPI } from '../../store/slices/cartSlice.js';
import { formatCurrency } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector(s => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const items      = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;

  const handleQty = (productId, current, delta) => {
    const newQty = current + delta;
    if (newQty < 1) {
      dispatch(removeItem(productId));
    } else {
      dispatch(updateItem({ productId, quantity: newQty }));
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear entire cart?')) return;
    dispatch(clearCartAPI());
    toast.success('Cart cleared');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Cart</h1>
          <p className="text-stone-400 text-sm mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} className="btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-600">
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-24">
          <ShoppingBag size={40} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 font-medium mb-1">Your cart is empty</p>
          <p className="text-stone-400 text-sm mb-6">Add some items to get started</p>
          <Link to="/products" className="btn-primary btn-md inline-flex">Browse products</Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1 min-w-0">
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item._id || item.product}
                    variants={staggerItem}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="card p-4 flex items-center gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.productName}</p>
                      <p className="text-sm text-stone-500 mt-0.5">{formatCurrency(item.price)} each</p>
                    </div>

                    {/* Qty control */}
                    <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden flex-shrink-0">
                      <button onClick={() => handleQty(item.product, item.quantity, -1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                        {item.quantity === 1 ? <Trash2 size={13} className="text-red-400" /> : <Minus size={13} />}
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-stone-900">{item.quantity}</span>
                      <button onClick={() => handleQty(item.product, item.quantity, 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0 w-20">
                      <p className="text-sm font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>

                    {/* Remove */}
                    <button onClick={() => dispatch(removeItem(item.product))}
                      className="btn-ghost btn-sm p-1.5 text-stone-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Summary */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="card p-5 sticky top-6">
              <h3 className="section-title mb-4">Order summary</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal ({items.length} items)</span>
                  <span className="font-medium text-stone-900">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="font-bold text-stone-900 text-lg tracking-tight">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')}
                className="btn-primary btn-md w-full">
                Proceed to checkout <ArrowRight size={15} />
              </button>
              <Link to="/products" className="btn-ghost btn-sm w-full mt-2 justify-center text-stone-500">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
