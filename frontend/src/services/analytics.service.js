import api from './api.js';

const analyticsService = {
  getDashboard:   ()  => api.get('/analytics/dashboard'),
  getMonthly:     ()  => api.get('/analytics/monthly'),
  getCategories:  ()  => api.get('/analytics/categories'),
  getSpending:    ()  => api.get('/analytics/spending'),
  getPaymentAnalytics: () => api.get('/payments/analytics'),
};

export default analyticsService;
