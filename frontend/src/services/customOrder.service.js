// customOrder.service.js
import api from './api.js';

const customOrderService = {
  submit:       (formData) => api.post('/custom-orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyOrders:  ()         => api.get('/custom-orders/my'),
  getAll:       (params)   => api.get('/custom-orders', { params }),
  getById:      (id)       => api.get(`/custom-orders/${id}`),
  updateStatus: (id, data) => api.patch(`/custom-orders/${id}/status`, data),
  cancel:       (id)       => api.delete(`/custom-orders/${id}`),
  getAnalytics: ()         => api.get('/custom-orders/analytics'),
};

export default customOrderService;
