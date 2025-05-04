import api from './api';

// Movie related API calls
const movieService = {
  // Get all movies with optional filters
  getMovies: async (params = {}) => {
    try {
      const response = await api.get('/movies', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get featured movies
  getFeaturedMovies: async () => {
    try {
      console.log('API Service: Fetching featured movies');
      const response = await api.get('/movies/featured');
      console.log('API Service: Featured movies response:', response);
      
      // Validate the backdrop URLs before returning the data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map(movie => {
          // Ensure valid backdrop URL
          if (!movie.backdrop || (typeof movie.backdrop === 'string' && movie.backdrop.trim() === '')) {
            console.warn(`Movie "${movie.title}" has missing backdrop URL`);
          }
          return movie;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching featured movies:', error.response || error);
      
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
      console.log('API Service: Fetching movie with ID:', id);
      
      // Make sure the ID is valid
      if (!id) {
        console.error('API Service: Invalid movie ID for fetch:', id);
        return { success: false, message: 'Invalid movie ID' };
      }
      
      const response = await api.get(`/movies/${id}`);
      console.log('API Service: Fetch response:', response);
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching movie:', error.response || error);
      
      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        // The request was made but no response was received
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  },

  // Admin: Create a new movie
  createMovie: async (movieData) => {
    try {
      const response = await api.post('/movies', movieData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Admin: Update a movie
  updateMovie: async (id, movieData) => {
    try {
      console.log('API Service: Updating movie with ID:', id);
      console.log('API Service: Update data:', movieData);
      
      // Make sure the ID is valid
      if (!id) {
        console.error('API Service: Invalid movie ID for update:', id);
        return { success: false, message: 'Invalid movie ID' };
      }
      
      const response = await api.put(`/movies/${id}`, movieData);
      console.log('API Service: Update response:', response);
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating movie:', error.response || error);
      
      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return error.response.data || { success: false, message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        // The request was made but no response was received
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { success: false, message: error.message || 'Unknown error occurred' };
      }
    }
  },

  // Admin: Delete a movie
  deleteMovie: async (id) => {
    try {
      const response = await api.delete(`/movies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get all available genres from backend
  getGenres: async () => {
    try {
      // This assumes your backend has a genres endpoint
      // If not, you can implement it or handle genre extraction differently
      const response = await api.get('/movies');
      
      // Extract unique genres from all movies
      const allMovies = response.data.data || [];
      const genreSet = new Set();
      
      allMovies.forEach(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
          movie.genres.forEach(genre => genreSet.add(genre));
        }
      });
      
      return Array.from(genreSet).sort();
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Search movies
  searchMovies: async (searchTerm) => {
    try {
      const response = await api.get('/movies', { 
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (genre) => {
    try {
      const response = await api.get('/movies', { 
        params: { genre }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get recently added movies
  getRecentMovies: async (limit = 10) => {
    try {
      const response = await api.get('/movies', {
        params: { 
          sort: 'createdAt:desc',
          limit
        }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get movie statistics (admin only)
  getStats: async () => {
    try {
      const response = await api.get('/movies/stats');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Increment movie view count
  incrementViewCount: async (id) => {
    try {
      const response = await api.post(`/movies/${id}/view`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  }
};

export default movieService; 