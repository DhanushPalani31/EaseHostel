import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// ─── Request interceptor – attach JWT ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('he_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor – handle 401 globally ──────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      // Token expired / invalid → clear session and redirect
      localStorage.removeItem('he_token');
      localStorage.removeItem('he_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }

    if (status >= 500) {
      toast.error('Something went wrong on our end. Try again shortly.');
    }

    return Promise.reject(error);
  }
);

export default api;
