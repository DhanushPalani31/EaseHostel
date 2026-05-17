import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analytics.service.js';
import toast from 'react-hot-toast';

/**
 * useDashboardStats – fetches and caches admin KPI data.
 */
export const useDashboardStats = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboard();
      setStats(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, error, reload: load };
};

/**
 * useMonthlyRevenue – monthly chart data for analytics page.
 */
export const useMonthlyRevenue = () => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getMonthly()
      .then(res => setData(res.data.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};

/**
 * useCategoryAnalytics – category revenue breakdown.
 */
export const useCategoryAnalytics = () => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getCategories()
      .then(res => setData(res.data.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
