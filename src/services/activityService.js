import api from '../config/api';

export const activityService = {
  getWeekData: async () => {
    const response = await api.get('/api/daily-activity/week-data/');
    return response.data;
  },

  addOrEditDay: async (date, data) => {
    const response = await api.post('/api/daily-activity/add-or-edit-day/', {
      date,
      ...data,
    });
    return response.data;
  },

  deleteDay: async (activityId) => {
    const response = await api.delete(`/api/daily-activity/${activityId}/delete-day/`);
    return response.data;
  },

  filterActivities: async (filters) => {
    const params = new URLSearchParams();
    if (filters.week_id) params.append('week_id', filters.week_id);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);

    const response = await api.get(`/api/daily-activity/filter/?${params.toString()}`);
    return response.data;
  },

  // Monthly Activity APIs
  getCurrentMonthActivity: async () => {
    const response = await api.get('/api/monthly-activity/current-month/');
    return response.data;
  },

  getMonthActivity: async (month, year) => {
    const response = await api.get(`/api/monthly-activity/get-month/?month=${month}&year=${year}`);
    return response.data;
  },

  addOrEditMonthlyActivity: async (data) => {
    const response = await api.post('/api/monthly-activity/add-or-edit/', data);
    return response.data;
  },

  filterMonthlyActivities: async (filters) => {
    const params = new URLSearchParams();
    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);

    const response = await api.get(`/api/monthly-activity/filter/?${params.toString()}`);
    return response.data;
  },

  getChantingRoundCount: async () => {
    const response = await api.get('/api/daily-activity/chanting-round-count/');
    return response.data;
  },
};

