import api from './api.js';

/**
 * productService – centralised API calls for product-related endpoints.
 * Components & thunks call these instead of raw api.get/post directly.
 */
const productService = {
  getAll:    (params = {}) => api.get('/products', { params }),
  getById:   (id)          => api.get(`/products/${id}`),
  getTrending: ()          => api.get('/products/trending'),
  getLowStock: (threshold) => api.get('/products/low-stock', { params: { threshold } }),

  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  remove:    (id)          => api.delete(`/products/${id}`),
  addReview: (id, data)    => api.post(`/products/${id}/review`, data),
};

export default productService;
