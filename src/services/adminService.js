import api from '../config/api';

export const adminService = {
  login: async (username, password) => {
    const response = await api.post('/auth/admin/admin-login/', {
      username,
      password,
    });
    // Store tokens in localStorage
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Store login timestamp (1 week from now)
      const loginTimestamp = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
      localStorage.setItem('login_expires_at', loginTimestamp.toString());
    }
    return response.data;
  },

  getAllDevotees: async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await api.get(`/auth/admin/devotees/?${params.toString()}`);
    return response.data;
  },

  getDevoteeDetail: async (devoteeId) => {
    const response = await api.get(`/auth/admin/${devoteeId}/devotee-detail/`);
    return response.data;
  },

  filterDevoteeActivities: async (devoteeId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.week_id) params.append('week_id', filters.week_id);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    
    const response = await api.get(`/auth/admin/${devoteeId}/filter-activities/?${params.toString()}`);
    return response.data;
  },

  getAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.week_id) params.append('week_id', filters.week_id);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.devotee_id) params.append('devotee_id', filters.devotee_id);
    
    const response = await api.get(`/auth/admin/analytics/?${params.toString()}`);
    return response.data;
  },
};

