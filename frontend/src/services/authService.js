import api from './api';

// Auth related API calls
const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('akflix_token', response.data.token);
        localStorage.setItem('akflix_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('akflix_token', response.data.token);
        localStorage.setItem('akflix_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Logout user
  logout: () => {
    // Clear user data from localStorage
    localStorage.removeItem('akflix_token');
    localStorage.removeItem('akflix_user');
    return { success: true };
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('akflix_token');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('akflix_user') || '{}');
    return user.role === 'admin';
  },

  // Get user from localStorage
  getUser: () => {
    const userStr = localStorage.getItem('akflix_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post('/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  }
};

export default authService; 