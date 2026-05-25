import axios from 'axios';
import toast from 'react-hot-toast';

// In production: VITE_API_URL = https://your-backend.onrender.com/api
// In development: vite proxy handles /api → localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API Base URL:', BASE_URL); // remove after debugging

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000 // 30s timeout for cold Render starts
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
