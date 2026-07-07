import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('citycare_user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const submitComplaint = (formData) =>
  api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getComplaints = (filters = {}) =>
  api.get('/complaints', { params: filters });

export const getComplaintById = (id) =>
  api.get(`/complaints/${id}`);

export const updateStatus = (id, status) =>
  api.patch(`/complaints/${id}/status`, { status });

export const getStats = () =>
  api.get('/complaints/stats');
