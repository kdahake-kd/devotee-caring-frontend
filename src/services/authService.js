import api from '../config/api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register-user/', userData);
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
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

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if API call fails
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('login_expires_at');
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    const response = await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    });
    return response.data;
  },
};

