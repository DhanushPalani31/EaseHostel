import api from './api.js';

const orderService = {
  place:       (data)          => api.post('/orders', data),
  getMyOrders: ()              => api.get('/orders/my-orders'),
  getAll:      (params = {})   => api.get('/orders', { params }),
  cancel:      (id)            => api.delete(`/orders/${id}`),
  updateStatus:(id, data)      => api.patch(`/orders/${id}/status`, data),
  getInvoiceUrl: (id)          => `/api/orders/${id}/invoice`,
};

export default orderService;
