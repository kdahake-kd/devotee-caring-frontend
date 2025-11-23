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

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const formData = new FormData();
    if (profileData.first_name) formData.append('first_name', profileData.first_name);
    if (profileData.last_name) formData.append('last_name', profileData.last_name);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.profile_image) formData.append('profile_image', profileData.profile_image);
    if (profileData.date_of_birth) formData.append('date_of_birth', profileData.date_of_birth);
    if (profileData.initiation_date) formData.append('initiation_date', profileData.initiation_date);

    const response = await api.put('/auth/update-profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/auth/delete-profile/');
    return response.data;
  },

  deleteSadanaData: async () => {
    const response = await api.delete('/auth/delete-sadana-data/');
    return response.data;
  },

  getSpiritualGrowth: async () => {
    const response = await api.get('/auth/spiritual-growth/');
    return response.data;
  },

  generateQrToken: async () => {
    const response = await api.post('/auth/generate-qr-token/');
    return response.data;
  },
};

