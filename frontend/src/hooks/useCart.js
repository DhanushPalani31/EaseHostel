import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchCart,
  addToCart as addAction,
  updateItem,
  removeItem,
  clearCartAPI
} from '../store/slices/cartSlice.js';
import { getCartCount } from '../utils/index.js';

/**
 * useCart – provides cart state and all cart actions.
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const { cart, loading } = useSelector(s => s.cart);

  const items      = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;
  const count      = getCartCount(cart);

  const add     = useCallback((productId, quantity = 1) =>
    dispatch(addAction({ productId, quantity })), [dispatch]);

  const update  = useCallback((productId, quantity) =>
    dispatch(updateItem({ productId, quantity })), [dispatch]);

  const remove  = useCallback((productId) =>
    dispatch(removeItem(productId)), [dispatch]);

  const clear   = useCallback(() =>
    dispatch(clearCartAPI()), [dispatch]);

  const refresh = useCallback(() =>
    dispatch(fetchCart()), [dispatch]);

  return { cart, items, totalPrice, count, loading, add, update, remove, clear, refresh };
};
