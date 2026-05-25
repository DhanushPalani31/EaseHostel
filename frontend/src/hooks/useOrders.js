import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMyOrders,
  fetchAllOrders,
  placeOrder as placeAction,
  cancelOrder as cancelAction
} from '../store/slices/orderSlice.js';

/**
 * useMyOrders – student order state and actions.
 */
export const useMyOrders = () => {
  const dispatch  = useDispatch();
  const { myOrders, loading, placing } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const cancel = useCallback((id) => dispatch(cancelAction(id)), [dispatch]);
  const place  = useCallback((data) => dispatch(placeAction(data)), [dispatch]);

  return { orders: myOrders, loading, placing, cancel, place };
};

/**
 * useAllOrders – admin order state and actions.
 */
export const useAllOrders = (params = {}) => {
  const dispatch  = useDispatch();
  const { allOrders, pagination, loading } = useSelector(s => s.orders);

  const load = useCallback(() => {
    dispatch(fetchAllOrders(params));
  }, [dispatch, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { orders: allOrders, pagination, loading, reload: load };
};
