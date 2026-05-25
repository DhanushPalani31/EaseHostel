import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyDeliveries,
  fetchAllDeliveries,
  fetchDeliveryById,
  submitDelivery,
  cancelDelivery
} from '../store/slices/deliverySlice.js';

/**
 * useMyDeliveries – student parcel delivery state.
 */
export const useMyDeliveries = () => {
  const dispatch = useDispatch();
  const { myDeliveries, loading, submitting } = useSelector(s => s.deliveries);

  useEffect(() => { dispatch(fetchMyDeliveries()); }, [dispatch]);

  const submit  = useCallback((fd) => dispatch(submitDelivery(fd)),    [dispatch]);
  const cancel  = useCallback((id) => dispatch(cancelDelivery(id)),    [dispatch]);
  const refresh = useCallback(()   => dispatch(fetchMyDeliveries()),   [dispatch]);

  const active = myDeliveries.filter(d => !['Delivered','Cancelled'].includes(d.deliveryStatus));
  const past   = myDeliveries.filter(d =>  ['Delivered','Cancelled'].includes(d.deliveryStatus));

  return { deliveries: myDeliveries, active, past, loading, submitting, submit, cancel, refresh };
};

/**
 * useDelivery – fetch a single delivery by ID (for tracking page).
 */
export const useDelivery = (id) => {
  const dispatch = useDispatch();
  const { current, loading } = useSelector(s => s.deliveries);

  useEffect(() => {
    if (id) dispatch(fetchDeliveryById(id));
  }, [id, dispatch]);

  return { delivery: current, loading };
};

/**
 * useAllDeliveries – admin delivery management.
 */
export const useAllDeliveries = (params = {}) => {
  const dispatch = useDispatch();
  const { allDeliveries, pagination, loading } = useSelector(s => s.deliveries);

  const load = useCallback(() => {
    dispatch(fetchAllDeliveries(params));
  }, [dispatch, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { deliveries: allDeliveries, pagination, loading, reload: load };
};
