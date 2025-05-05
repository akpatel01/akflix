const axios = require('axios');

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Test function to check movie categories functionality
const testMoviesByCategory = async () => {
  console.log('Starting Movies by Category API test...');
  
  try {
    // 1. Get all categories
    console.log('\n1. Getting all categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/movies/categories`);
    
    if (!categoriesResponse.data?.success) {
      console.error('Failed to fetch categories');
      return;
    }
    
    const categories = categoriesResponse.data.data;
    console.log(`Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.error('No categories found');
      return;
    }
    
    // 2. Test each category with both endpoints
    for (const category of categories.slice(0, 3)) { // Test first 3 categories only
      const categoryName = category.name;
      console.log(`\n2. Testing category: ${categoryName}`);
      
      // 2.1 Test with standard movies endpoint
      console.log(`\n2.1 Testing standard movies endpoint with genre=${categoryName}`);
      try {
        const moviesResponse = await axios.get(`${API_BASE_URL}/movies`, { 
          params: { genre: categoryName } 
        });
        
        console.log(`Standard endpoint: Found ${moviesResponse.data?.data?.length || 0} movies for ${categoryName}`);
      } catch (error) {
        console.error(`Error testing standard endpoint: ${error.message}`);
      }
      
      // 2.2 Test with categories/:category endpoint
      console.log(`\n2.2 Testing category-specific endpoint for ${categoryName}`);
      try {
        const categoryMoviesResponse = await axios.get(`${API_BASE_URL}/movies/categories/${categoryName}`);
        
        console.log(`Category endpoint: Found ${categoryMoviesResponse.data?.data?.movies?.length || 0} movies for ${categoryName}`);
      } catch (error) {
        console.error(`Error testing category endpoint: ${error.message}`);
      }
    }
    
    console.log('\nMovies by Category test complete!');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
};

// Run the test
testMoviesByCategory(); 