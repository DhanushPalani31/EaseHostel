import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyCustomOrders,
  fetchAllCustomOrders,
  submitCustomOrder,
  cancelCustomOrder
} from '../store/slices/customOrderSlice.js';

/**
 * useMyCustomOrders – student custom order state and actions.
 */
export const useMyCustomOrders = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, submitting } = useSelector(s => s.customOrders);

  useEffect(() => { dispatch(fetchMyCustomOrders()); }, [dispatch]);

  const submit = useCallback((formData) => dispatch(submitCustomOrder(formData)), [dispatch]);
  const cancel = useCallback((id)       => dispatch(cancelCustomOrder(id)),       [dispatch]);
  const refresh= useCallback(()         => dispatch(fetchMyCustomOrders()),        [dispatch]);

  return { orders: myOrders, loading, submitting, submit, cancel, refresh };
};

/**
 * useAllCustomOrders – admin custom order management.
 */
export const useAllCustomOrders = (params = {}) => {
  const dispatch = useDispatch();
  const { allOrders, pagination, loading } = useSelector(s => s.customOrders);

  const load = useCallback(() => {
    dispatch(fetchAllCustomOrders(params));
  }, [dispatch, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { orders: allOrders, pagination, loading, reload: load };
};
