import api from './api.js';

const deliveryStaffService = {
  create:            (formData) => api.post('/delivery-staff', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll:            (activeOnly = false) => api.get('/delivery-staff', { params: { activeOnly } }),
  getById:           (id)       => api.get(`/delivery-staff/${id}`),
  update:            (id, data) => api.put(`/delivery-staff/${id}`, data),
  toggleAvailability:(id)       => api.patch(`/delivery-staff/${id}/availability`),
  toggleActive:      (id)       => api.patch(`/delivery-staff/${id}/active`),
  getDeliveries:     (id, params) => api.get(`/delivery-staff/${id}/deliveries`, { params }),
  getPerformance:    ()         => api.get('/delivery-staff/performance'),
  remove:            (id)       => api.delete(`/delivery-staff/${id}`),
};

export default deliveryStaffService;
