import api from './api.js';

const externalDeliveryService = {
  submit:       (formData) => api.post('/external-deliveries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyDeliveries: ()      => api.get('/external-deliveries/my'),
  getAll:       (params)   => api.get('/external-deliveries', { params }),
  getById:      (id)       => api.get(`/external-deliveries/${id}`),
  updateStatus: (id, data) => api.patch(`/external-deliveries/${id}/status`, data),
  assignStaff:  (id, staffId) => api.patch(`/external-deliveries/${id}/assign`, { staffId }),
  verifyOTP:    (id, otp)  => api.post(`/external-deliveries/${id}/verify-otp`, { otp }),
  cancel:       (id)       => api.delete(`/external-deliveries/${id}`),
  getAnalytics: ()         => api.get('/external-deliveries/analytics'),
};

export default externalDeliveryService;
