import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchProductById, fetchTrending, clearCurrent } from '../store/slices/productSlice.js';
import { useDebounce } from './index.js';

/**
 * useProducts – fetches paginated products with live filter/search support.
 */
export const useProducts = (filters = {}) => {
  const dispatch   = useDispatch();
  const { items, pagination, loading, error } = useSelector(s => s.products);

  const debouncedSearch = useDebounce(filters.search, 400);

  const load = useCallback(() => {
    dispatch(fetchProducts({
      ...filters,
      search: debouncedSearch
    }));
  }, [dispatch, JSON.stringify(filters), debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  return { products: items, pagination, loading, error, reload: load };
};

/**
 * useProduct – fetches a single product by ID.
 */
export const useProduct = (id) => {
  const dispatch  = useDispatch();
  const { current, loading, error } = useSelector(s => s.products);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  return { product: current, loading, error };
};

/**
 * useTrending – fetches trending products.
 */
export const useTrending = () => {
  const dispatch    = useDispatch();
  const { trending } = useSelector(s => s.products);

  useEffect(() => {
    if (trending.length === 0) dispatch(fetchTrending());
  }, [dispatch]);

  return trending;
};
