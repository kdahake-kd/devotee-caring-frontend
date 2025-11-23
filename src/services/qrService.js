import api from '../config/api';
import axios from 'axios';

// Create a separate axios instance for public endpoints (no auth required)
const publicApi = axios.create({
  baseURL: api.defaults.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const qrService = {
  generateQrToken: async () => {
    const response = await api.post('/auth/generate-qr-token/');
    return response.data;
  },

  validateQrToken: async (token) => {
    // Use public API (no auth headers) for this endpoint
    const response = await publicApi.get(`/api/quick-entry/validate/${token}/`);
    return response.data;
  },

  submitQuickEntry: async (token, data) => {
    // Use public API (no auth headers) for this endpoint
    const response = await publicApi.post(`/api/quick-entry/submit/${token}/`, data);
    return response.data;
  },
};
