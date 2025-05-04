import api from './api';

// User related API calls
const userService = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      if (response.data.success) {
        // Update user data in localStorage
        const userData = response.data.data;
        localStorage.setItem('akflix_user', JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Toggle movie in watchlist
  toggleWatchlist: async (movieId) => {
    try {
      const response = await api.post(`/users/watchlist/${movieId}`);
      if (response.data.success) {
        // Update watchlist in user data
        const user = JSON.parse(localStorage.getItem('akflix_user') || '{}');
        user.watchlist = response.data.watchlist;
        localStorage.setItem('akflix_user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Toggle movie in watched list
  toggleWatched: async (movieId) => {
    try {
      const response = await api.post(`/users/watched/${movieId}`);
      if (response.data.success) {
        // Update watched list in user data
        const user = JSON.parse(localStorage.getItem('akflix_user') || '{}');
        user.watched = response.data.watched;
        localStorage.setItem('akflix_user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Check if a movie is in watchlist
  isInWatchlist: (movieId) => {
    const user = JSON.parse(localStorage.getItem('akflix_user') || '{}');
    return user.watchlist && user.watchlist.includes(movieId);
  },

  // Check if a movie is in watched list
  isWatched: (movieId) => {
    const user = JSON.parse(localStorage.getItem('akflix_user') || '{}');
    return user.watched && user.watched.includes(movieId);
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get user statistics (admin only)
  getStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  }
};

export default userService; 