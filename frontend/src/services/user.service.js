import api from './api.js';

const userService = {
  getProfile:     ()         => api.get('/auth/profile'),
  updateProfile:  (formData) => api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getWishlist:    ()         => api.get('/wishlist'),
  toggleWishlist: (productId) => api.post('/wishlist', { productId }),
  getSpending:    ()         => api.get('/analytics/spending'),

  // Admin
  getAll:        ()         => api.get('/users'),
  toggleStatus:  (id)       => api.patch(`/users/${id}/toggle`),
  broadcast:     (data)     => api.post('/users/broadcast', data),
};

export default userService;
