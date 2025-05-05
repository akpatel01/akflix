import apiUtils from './utils/apiUtils';

// Test function to check API connections
const testAPI = async () => {
  console.log('Starting API connection test...');
  
  try {
    // Test featured movies endpoint
    console.log('Testing featured movies endpoint...');
    const featuredResponse = await apiUtils.get('/movies/featured');
    console.log('Featured movies response:', 
      featuredResponse.success ? 'SUCCESS' : 'FAILED',
      featuredResponse.data?.length ? `Found ${featuredResponse.data.length} movies` : 'No data'
    );
    
    // Test categories endpoint
    console.log('Testing categories endpoint...');
    const categoriesResponse = await apiUtils.get('/movies/categories');
    console.log('Categories response:', 
      categoriesResponse.success ? 'SUCCESS' : 'FAILED',
      categoriesResponse.data?.length ? `Found ${categoriesResponse.data.length} categories` : 'No data'
    );
    
    // Test movies by genre endpoint
    console.log('Testing movies by genre endpoint...');
    const actionMoviesResponse = await apiUtils.get('/movies', { genre: 'Action' });
    console.log('Action movies response:', 
      actionMoviesResponse.success ? 'SUCCESS' : 'FAILED',
      actionMoviesResponse.data?.length ? `Found ${actionMoviesResponse.data.length} movies` : 'No data'
    );
    
    console.log('API test complete!');
  } catch (error) {
    console.error('API test failed with error:', error.message);
  }
};

// Run the test
testAPI();

export default testAPI; 