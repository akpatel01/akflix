import api from './api';
import apiUtils from '../utils/apiUtils';

// Movie related API calls
const movieService = {
  // Get all movies with optional filters
  getMovies: async (params = {}) => {
    try {
      return await apiUtils.get('/movies', params);
    } catch (error) {
      throw error;
    }
  },

  // Get featured movies
  getFeaturedMovies: async () => {
    try {
      const response = await apiUtils.get('/movies/featured');
      
      // Validate the backdrop URLs before returning the data
      if (response.success && Array.isArray(response.data)) {
        response.data = response.data.map(movie => {
          // Ensure valid backdrop URL
          if (!movie.backdrop || (typeof movie.backdrop === 'string' && movie.backdrop.trim() === '')) {
            // Handle missing backdrop silently
          }
          return movie;
        });
      }
      
      return response;
    } catch (error) {
      // Handle different error types
      if (error.response) {
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  },

  // Get a single movie by ID
  getMovie: async (id) => {
    try {
      // Make sure the ID is valid
      if (!id) {
        return { success: false, message: 'Invalid movie ID' };
      }
      
      return await apiUtils.get(`/movies/${id}`);
    } catch (error) {
      // Handle different error types
      if (error.response) {
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  },

  // Admin: Create a new movie
  createMovie: async (movieData) => {
    try {
      return await apiUtils.post('/movies', movieData);
    } catch (error) {
      throw error;
    }
  },

  // Admin: Update a movie
  updateMovie: async (id, movieData) => {
    try {
      // Make sure the ID is valid
      if (!id) {
        return { success: false, message: 'Invalid movie ID' };
      }
      
      return await apiUtils.put(`/movies/${id}`, movieData);
    } catch (error) {
      // Handle different error types
      if (error.response) {
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  },

  // Admin: Delete a movie
  deleteMovie: async (id) => {
    try {
      return await apiUtils.delete(`/movies/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Get all available genres from backend
  getGenres: async () => {
    try {
      const response = await apiUtils.get('/movies/categories');
      
      if (response.success && Array.isArray(response.data)) {
        // Extract the name field from each category object and return as array of strings
        return response.data.map(category => category.name);
      }
      
      // Fallback to empty array if no categories found
      return [];
    } catch (error) {
      return [];
    }
  },

  // Get all categories (genres) - explicit method that returns the raw API response
  getCategories: async () => {
    try {
      return await apiUtils.get('/movies/categories');
    } catch (error) {
      if (error.response) {
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  },

  // Search movies
  searchMovies: async (searchTerm) => {
    try {
      return await apiUtils.get('/movies', { search: searchTerm });
    } catch (error) {
      throw error;
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (genre) => {
    try {
      return await apiUtils.get('/movies', { genre });
    } catch (error) {
      throw error;
    }
  },

  // Get recently added movies
  getRecentMovies: async (limit = 10) => {
    try {
      return await apiUtils.get('/movies', { sort: 'createdAt:desc', limit });
    } catch (error) {
      throw error;
    }
  },

  // Get movie statistics (admin only)
  getStats: async () => {
    try {
      return await apiUtils.get('/movies/stats');
    } catch (error) {
      throw error;
    }
  },

  // Increment movie view count
  incrementViewCount: async (id) => {
    try {
      return await apiUtils.post(`/movies/${id}/view`);
    } catch (error) {
      throw error;
    }
  },

  // Get secure video URL for a movie
  getSecureVideoUrl: async (id) => {
    try {
      // Make sure the ID is valid
      if (!id) {
        return { success: false, message: 'Invalid movie ID' };
      }
      
      return await apiUtils.get(`/movies/${id}/secure-video`);
    } catch (error) {
      // Handle different error types
      if (error.response) {
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  }
};

export default movieService; 