import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { updateItem, removeItem } from '../../store/slices/cartSlice.js';
import { closeCart } from '../../store/slices/uiSlice.js';
import { formatCurrency, getCartCount } from '../../utils/index.js';

/**
 * CartDrawer – slide-over cart panel used in desktop nav.
 */
const CartDrawer = memo(() => {
  const dispatch  = useDispatch();
  const { cartOpen } = useSelector(s => s.ui);
  const { cart }  = useSelector(s => s.cart);

  const items    = cart?.items || [];
  const total    = cart?.totalPrice || 0;
  const count    = getCartCount(cart);

  const handleQty = (productId, current, delta) => {
    const newQty = current + delta;
    if (newQty < 1) dispatch(removeItem(productId));
    else dispatch(updateItem({ productId, quantity: newQty }));
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed right-0 inset-y-0 z-50 w-full max-w-sm bg-white shadow-modal flex flex-col"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-stone-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={17} className="text-stone-600" />
                <span className="font-semibold text-stone-900">Cart</span>
                {count > 0 && (
                  <span className="badge bg-stone-900 text-white text-[10px] font-bold">{count}</span>
                )}
              </div>
              <button onClick={() => dispatch(closeCart())}
                className="btn-ghost btn-sm p-1.5">
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart size={36} className="text-stone-300 mb-3" />
                  <p className="text-stone-500 font-medium">Your cart is empty</p>
                  <Link to="/products" onClick={() => dispatch(closeCart())}
                    className="btn-outline btn-sm mt-4">Browse products</Link>
                </div>
              ) : (
                items.map(item => (
                  <div key={item._id || item.product}
                    className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    {/* Image */}
                    <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-900 truncate leading-tight">{item.productName}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{formatCurrency(item.price)}</p>

                      {/* Qty */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <button onClick={() => handleQty(item.product, item.quantity, -1)}
                          className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center
                                     text-stone-500 hover:bg-stone-100 transition-colors">
                          {item.quantity === 1 ? <Trash2 size={10} className="text-red-400" /> : <Minus size={10} />}
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-stone-900">{item.quantity}</span>
                        <button onClick={() => handleQty(item.product, item.quantity, 1)}
                          className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center
                                     text-stone-500 hover:bg-stone-100 transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-stone-100 space-y-3 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Total</span>
                  <span className="font-bold text-stone-900 text-lg tracking-tight">{formatCurrency(total)}</span>
                </div>
                <Link to="/checkout" onClick={() => dispatch(closeCart())}
                  className="btn-primary btn-md w-full flex items-center justify-center gap-2">
                  Checkout <ArrowRight size={14} />
                </Link>
                <Link to="/cart" onClick={() => dispatch(closeCart())}
                  className="btn-ghost btn-sm w-full justify-center text-stone-500 text-xs">
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

CartDrawer.displayName = 'CartDrawer';
export default CartDrawer;
