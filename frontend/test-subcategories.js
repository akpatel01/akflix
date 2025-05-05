const axios = require('axios');

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Test function to check subcategories functionality
const testSubcategories = async () => {
  console.log('Starting Subcategories Test...');
  
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
    
    // 2. Test subcategories endpoint for the first 3 categories
    for (const category of categories.slice(0, 3)) {
      const categoryName = category.name;
      console.log(`\n2. Testing subcategories endpoint for: ${categoryName}`);
      
      try {
        const subcategoriesUrl = `${API_BASE_URL}/movies/categories/${categoryName}`;
        console.log(`Calling: ${subcategoriesUrl}`);
        
        const subcategoriesResponse = await axios.get(subcategoriesUrl);
        
        if (subcategoriesResponse.data?.success) {
          const result = subcategoriesResponse.data;
          
          console.log(`Success! Got data for ${categoryName}:
            - Category: ${result.category}
            - Count: ${result.count || 0}
            - Has movies array: ${result.data && result.data.movies ? 'Yes' : 'No'}
            - Number of movies: ${result.data && result.data.movies ? result.data.movies.length : 0}
          `);
          
          // Check if movies have all required fields
          if (result.data && result.data.movies && result.data.movies.length > 0) {
            const firstMovie = result.data.movies[0];
            console.log(`First movie details:
              - ID: ${firstMovie._id || 'Missing'}
              - Title: ${firstMovie.title || 'Missing'}
              - Has poster: ${firstMovie.poster ? 'Yes' : 'No'}
              - Has backdrop: ${firstMovie.backdrop ? 'Yes' : 'No'}
              - Year: ${firstMovie.year || 'Missing'}
              - Genres: ${firstMovie.genres ? firstMovie.genres.join(', ') : 'Missing'}
            `);
          }
        } else {
          console.error(`Failed to get subcategories for ${categoryName}:`, subcategoriesResponse.data?.message || 'Unknown error');
        }
      } catch (error) {
        console.error(`Error testing subcategories for ${categoryName}:`, error.message);
        console.error('Response:', error.response?.data || 'No response data');
      }
      
      // 3. Test related categories
      console.log(`\n3. Testing related categories for: ${categoryName}`);
      
      try {
        const relatedUrl = `${API_BASE_URL}/movies/categories/${categoryName}?related=true&limit=5`;
        console.log(`Calling: ${relatedUrl}`);
        
        const relatedResponse = await axios.get(relatedUrl);
        
        if (relatedResponse.data?.success) {
          const result = relatedResponse.data;
          
          console.log(`Success! Got related categories for ${categoryName}:
            - Category: ${result.category}
            - Count: ${result.count || 0}
            - Number of related categories: ${Array.isArray(result.data) ? result.data.length : 0}
          `);
          
          // List related categories
          if (Array.isArray(result.data) && result.data.length > 0) {
            console.log('Related categories:');
            result.data.forEach((related, index) => {
              console.log(`  ${index + 1}. ${related.name} (appears with ${categoryName} in ${related.count} movies)`);
            });
          }
        } else {
          console.error(`Failed to get related categories for ${categoryName}:`, relatedResponse.data?.message || 'Unknown error');
        }
      } catch (error) {
        console.error(`Error testing related categories for ${categoryName}:`, error.message);
      }
    }
    
    console.log('\nSubcategories test complete!');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
};

// Run the test
testSubcategories(); 