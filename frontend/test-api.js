// Import axios for making API requests
const axios = require('axios');

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Test function to check API connections
const testAPI = async () => {
  console.log('Starting API connection test...');
  
  try {
    // Test server connectivity
    console.log('Testing basic server connectivity...');
    try {
      const serverResponse = await axios.get(`${API_BASE_URL}/movies/test`);
      console.log('Server connectivity test:', 'SUCCESS');
      console.log('Server response:', serverResponse.data);
    } catch (error) {
      console.error('Server connectivity test FAILED:', error.message);
    }
    
    // Test featured movies endpoint
    console.log('\nTesting featured movies endpoint...');
    try {
      const featuredResponse = await axios.get(`${API_BASE_URL}/movies/featured`);
      console.log('Featured movies response:', 
        featuredResponse.data?.success ? 'SUCCESS' : 'FAILED',
        featuredResponse.data?.data?.length ? `Found ${featuredResponse.data.data.length} movies` : 'No data'
      );
    } catch (error) {
      console.error('Featured movies endpoint FAILED:', error.message);
    }
    
    // Test categories endpoint
    console.log('\nTesting categories endpoint...');
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/movies/categories`);
      console.log('Categories response:', 
        categoriesResponse.data?.success ? 'SUCCESS' : 'FAILED',
        categoriesResponse.data?.data?.length ? `Found ${categoriesResponse.data.data.length} categories` : 'No data'
      );
    } catch (error) {
      console.error('Categories endpoint FAILED:', error.message);
    }
    
    // Test movies by genre endpoint
    console.log('\nTesting movies by genre endpoint...');
    try {
      const actionMoviesResponse = await axios.get(`${API_BASE_URL}/movies`, { 
        params: { genre: 'Action' } 
      });
      console.log('Action movies response:', 
        actionMoviesResponse.data?.success ? 'SUCCESS' : 'FAILED',
        actionMoviesResponse.data?.data?.length ? `Found ${actionMoviesResponse.data.data.length} movies` : 'No data'
      );
    } catch (error) {
      console.error('Movies by genre endpoint FAILED:', error.message);
    }
    
    console.log('\nAPI test complete!');
  } catch (error) {
    console.error('API test failed with error:', error.message);
  }
};

// Run the test
testAPI(); 