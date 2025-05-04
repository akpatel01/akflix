import movieService from '../services/movieService';

/**
 * Utility function to check movies in the database for missing backdrop URLs
 * This can be called from the browser console when needed
 */
export const checkBackdrops = async () => {
  // Get all movies from the database
  try {
    console.log('Fetching movies from the database...');
    const response = await movieService.getMovies();
    
    if (!response.success || !Array.isArray(response.data)) {
      console.error('Failed to fetch movies:', response);
      return;
    }
    
    const dbMovies = response.data;
    console.log(`Found ${dbMovies.length} movies in the database`);
    
    // Find movies that need backdrop updates
    const moviesNeedingUpdates = dbMovies.filter(
      movie => !movie.backdrop || movie.backdrop.trim() === '' || 
      !movie.backdrop.startsWith('http')
    );
    
    if (moviesNeedingUpdates.length === 0) {
      console.log('All movies have valid backdrop URLs. No updates needed.');
      return;
    }
    
    console.log(`Found ${moviesNeedingUpdates.length} movies that need backdrop updates:`);
    
    // Display the list of movies that need backdrop URLs
    for (const movie of moviesNeedingUpdates) {
      console.log(`- ${movie.title} (ID: ${movie._id}) - Current backdrop: ${movie.backdrop || 'MISSING'}`);
    }
    
    console.log(`
    📝 Manual update instructions:
    1. For each movie listed above, find a suitable backdrop image URL
    2. Use the updateMovieBackdrop() function to update each movie
    3. Example: updateMovieBackdrop("movieId", "https://example.com/backdrop.jpg")
    `);
    
  } catch (error) {
    console.error('Error during backdrop check process:', error);
  }
};

/**
 * Updates a specific movie's backdrop by ID
 */
export const updateMovieBackdrop = async (movieId, backdropUrl) => {
  if (!movieId || !backdropUrl) {
    console.error('Invalid parameters: movieId and backdropUrl are required');
    return false;
  }
  
  try {
    console.log(`Manually updating backdrop for movie ID: ${movieId}`);
    const updateResponse = await movieService.updateMovie(movieId, { backdrop: backdropUrl });
    
    if (updateResponse.success) {
      console.log(`✅ Successfully updated backdrop for movie ID: ${movieId}`);
      return true;
    } else {
      console.error(`❌ Failed to update backdrop:`, updateResponse.message);
      return false;
    }
  } catch (error) {
    console.error('Error updating backdrop:', error);
    return false;
  }
};

/**
 * Batch update backdrops from a mapping object
 * @param {Object} backdropMap - Object with movieId as key and backdrop URL as value
 */
export const batchUpdateBackdrops = async (backdropMap) => {
  if (!backdropMap || typeof backdropMap !== 'object') {
    console.error('Invalid backdropMap. Please provide an object with movieId:backdropUrl pairs');
    return;
  }
  
  const movieIds = Object.keys(backdropMap);
  if (movieIds.length === 0) {
    console.log('No backdrops to update.');
    return;
  }
  
  console.log(`Batch updating ${movieIds.length} movie backdrops...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const movieId of movieIds) {
    const backdropUrl = backdropMap[movieId];
    const success = await updateMovieBackdrop(movieId, backdropUrl);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`
  🔄 Batch update completed:
  ✅ Successfully updated: ${successCount} movies
  ❌ Failed to update: ${errorCount} movies
  `);
};

// Add to window for easy access from console
if (typeof window !== 'undefined') {
  window.checkBackdrops = checkBackdrops;
  window.updateMovieBackdrop = updateMovieBackdrop;
  window.batchUpdateBackdrops = batchUpdateBackdrops;
}

export default {
  checkBackdrops,
  updateMovieBackdrop,
  batchUpdateBackdrops
}; 