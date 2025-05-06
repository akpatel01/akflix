import api from '../services/api';

/**
 * A utility for making API calls with standard error handling and logging
 * Centralizes API request logic to reduce duplication across the application
 */
const apiUtils = {
  /**
   * Make a GET request to the API with standardized error handling
   * 
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} params - Optional query parameters
   * @param {Object} options - Additional options
   * @param {boolean} options.silent - If true, suppresses console logging
   * @returns {Promise<Object>} The API response data
   */
  get: async (endpoint, params = {}, options = {}) => {
    const { silent = false } = options;
    
    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      return apiUtils.handleError(error, endpoint, silent);
    }
  },
  
  /**
   * Make a POST request to the API with standardized error handling
   * 
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional options
   * @param {boolean} options.silent - If true, suppresses console logging
   * @returns {Promise<Object>} The API response data
   */
  post: async (endpoint, data = {}, options = {}) => {
    const { silent = false } = options;
    
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      return apiUtils.handleError(error, endpoint, silent);
    }
  },
  
  /**
   * Make a PUT request to the API with standardized error handling
   * 
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional options
   * @param {boolean} options.silent - If true, suppresses console logging
   * @returns {Promise<Object>} The API response data
   */
  put: async (endpoint, data = {}, options = {}) => {
    const { silent = false } = options;
    
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      return apiUtils.handleError(error, endpoint, silent);
    }
  },
  
  /**
   * Make a DELETE request to the API with standardized error handling
   * 
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Additional options
   * @param {boolean} options.silent - If true, suppresses console logging
   * @returns {Promise<Object>} The API response data
   */
  delete: async (endpoint, options = {}) => {
    const { silent = false } = options;
    
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      return apiUtils.handleError(error, endpoint, silent);
    }
  },
  
  /**
   * Standardized error handling for API requests
   * 
   * @param {Error} error - The error object
   * @param {string} endpoint - The API endpoint that was called
   * @param {boolean} silent - If true, suppresses console logging
   * @returns {Object} A standardized error response object
   * @private
   */
  handleError: (error, endpoint, silent = false) => {
    // Silent error handling
    
    if (error.response) {
      // The request was made and the server responded with an error status code
      return error.response.data || { 
        success: false, 
        message: `Server error: ${error.response.status}` 
      };
    } else if (error.request) {
      // The request was made but no response was received
      return { 
        success: false, 
        message: 'No response from server. Please check your connection.' 
      };
    } else {
      // Something happened in setting up the request
      return { 
        success: false, 
        message: error.message || 'Unknown error occurred' 
      };
    }
  }
};

/**
 * Fetch subcategories or related categories for a given category
 * @param {string} category - The main category to get related categories for
 * @param {Object} options - Options for the request
 * @param {boolean} options.related - Whether to fetch related categories (true) or movies in the category (false)
 * @param {number} options.limit - Maximum number of results to return
 * @returns {Promise<Object>} The API response with subcategories or related data
 */
export const fetchCategoryRelated = async (category, options = {}) => {
  try {
    if (!category) {
      return {
        success: false,
        message: 'Category parameter is required'
      };
    }

    const queryParams = new URLSearchParams();
    if (options.related !== undefined) {
      queryParams.append('related', options.related);
    }
    if (options.limit !== undefined) {
      queryParams.append('limit', options.limit);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await api.get(`/movies/categories/${encodeURIComponent(category)}${queryString}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch category related data',
      error
    };
  }
};

/**
 * Fetch movies by category (genre)
 * @param {string} category - The category/genre to fetch movies for
 * @param {Object} options - Options for the request
 * @param {number} options.limit - Maximum number of movies to return
 * @param {string} options.type - Type of content (movie, tv-show, etc.)
 * @returns {Promise<Object>} The API response with movies in the specified category
 */
export const fetchMoviesByCategory = async (category, options = {}) => {
  if (!category) {
    return {
      success: false,
      message: 'Category parameter is required'
    };
  }

  try {
    // First try the categories endpoint
    try {
      const categoryResponse = await fetchCategoryRelated(category, {
        related: false,
        limit: options.limit || 20
      });
      
      if (categoryResponse?.success && categoryResponse?.data?.movies) {
        const moviesArray = categoryResponse.data.movies;
        
        // Verify that the movies have the required fields for display
        const validMovies = moviesArray.filter(movie => 
          movie && movie._id && movie.title && movie.poster
        );
        
        if (validMovies.length > 0) {
          // If we got valid movies from the category endpoint, return them
          return {
            success: true,
            data: validMovies
          };
        }
      }
    } catch (categoryError) {
      // Silently fail and fall back to the regular endpoint
    }
    
    // Otherwise, fall back to the regular movies endpoint with genre filter
    const queryParams = {
      genre: category,
      ...options
    };
    
    const response = await apiUtils.get('/movies', queryParams);
    
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || `Failed to fetch movies by category: ${category}`,
      error
    };
  }
};

export default apiUtils; 