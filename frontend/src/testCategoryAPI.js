const axios = require('axios');

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Test function to check category API endpoints
const testCategoryAPI = async () => {
  console.log('Starting Category API test...');
  
  try {
    // 1. Test all categories endpoint
    console.log('\n1. Testing all categories endpoint...');
    try {
      const allCategoriesResponse = await axios.get(`${API_BASE_URL}/movies/categories`);
      console.log('All categories response:', 
        allCategoriesResponse.data?.success ? 'SUCCESS' : 'FAILED',
        allCategoriesResponse.data?.data?.length ? `Found ${allCategoriesResponse.data.data.length} categories` : 'No data'
      );
      
      // Save a category name for the next tests
      const sampleCategory = allCategoriesResponse.data?.data?.[0]?.name;
      if (sampleCategory) {
        console.log(`Using category "${sampleCategory}" for further tests`);
        
        // 2. Test category-specific endpoint without related parameter
        console.log('\n2. Testing category-specific endpoint (movies in category)...');
        try {
          const categoryMoviesResponse = await axios.get(`${API_BASE_URL}/movies/categories/${sampleCategory}`);
          console.log('Category movies response:', 
            categoryMoviesResponse.data?.success ? 'SUCCESS' : 'FAILED',
            categoryMoviesResponse.data?.data?.movies?.length 
              ? `Found ${categoryMoviesResponse.data.data.movies.length} movies in ${sampleCategory}` 
              : 'No movies found'
          );
        } catch (error) {
          console.error('Category movies test FAILED:', error.message);
        }
        
        // 3. Test related categories endpoint
        console.log('\n3. Testing related categories endpoint...');
        try {
          const relatedCategoriesResponse = await axios.get(`${API_BASE_URL}/movies/categories/${sampleCategory}?related=true&limit=5`);
          console.log('Related categories response:', 
            relatedCategoriesResponse.data?.success ? 'SUCCESS' : 'FAILED',
            relatedCategoriesResponse.data?.data?.length 
              ? `Found ${relatedCategoriesResponse.data.data.length} categories related to ${sampleCategory}` 
              : 'No related categories found'
          );
          
          // Show the related categories if they exist
          if (relatedCategoriesResponse.data?.data?.length > 0) {
            console.log('Related categories:');
            relatedCategoriesResponse.data.data.forEach((category, index) => {
              console.log(`  ${index + 1}. ${category.name} (appears with ${sampleCategory} in ${category.count} movies)`);
            });
          }
        } catch (error) {
          console.error('Related categories test FAILED:', error.message);
        }
      } else {
        console.log('No categories found to test with');
      }
    } catch (error) {
      console.error('All categories test FAILED:', error.message);
    }
    
    console.log('\nCategory API test complete!');
  } catch (error) {
    console.error('Category API test failed with error:', error.message);
  }
};

// Run the test
testCategoryAPI(); 