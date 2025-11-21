import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Check if login has expired before making request
    const expiresAt = localStorage.getItem('login_expires_at');
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt, 10);
      const currentTime = Date.now();
      
      if (currentTime > expirationTime) {
        // Login has expired, clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('login_expires_at');
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired'));
      }
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_expires_at');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

