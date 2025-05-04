import movieService from '../services/movieService';
import moviesData from '../data/movies.json';

/**
 * Import movies from the JSON data file into the database
 * This utility can be run from the browser console for development/testing
 */
export const importMoviesFromJson = async () => {
  console.log(`Starting import of ${moviesData.length} movies from JSON data...`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (const movie of moviesData) {
    try {
      // Check if movie already exists to avoid duplicates
      const searchResponse = await movieService.searchMovies(movie.title);
      
      if (searchResponse.success && searchResponse.data) {
        const existingMovie = searchResponse.data.find(m => 
          m.title === movie.title && m.year === movie.year
        );
        
        if (existingMovie) {
          console.log(`Movie already exists: ${movie.title} (${movie.year}). Skipping.`);
          skippedCount++;
          continue;
        }
      }
      
      // Create the movie in the database
      const response = await movieService.createMovie(movie);
      
      if (response.success) {
        successCount++;
        console.log(`✅ Successfully imported: ${movie.title}`);
      } else {
        errorCount++;
        console.error(`❌ Failed to import ${movie.title}: ${response.message}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error importing ${movie.title}:`, error);
    }
  }
  
  console.log(`
  📊 Import completed:
  ✅ Successfully imported: ${successCount} movies
  ⏭️ Skipped (already exist): ${skippedCount} movies
  ❌ Failed to import: ${errorCount} movies
  `);
  
  return {
    total: moviesData.length,
    success: successCount,
    skipped: skippedCount,
    error: errorCount
  };
};

/**
 * Update existing movies with data from the JSON file
 * Useful for updating missing fields
 */
export const updateExistingMovies = async () => {
  console.log(`Starting update of existing movies from JSON data...`);
  
  let updatedCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;
  
  for (const movieData of moviesData) {
    try {
      // Find the movie by title and year
      const searchResponse = await movieService.searchMovies(movieData.title);
      
      if (searchResponse.success && searchResponse.data) {
        const existingMovie = searchResponse.data.find(m => 
          m.title === movieData.title && m.year === movieData.year
        );
        
        if (existingMovie) {
          // Update the movie with data from JSON
          const response = await movieService.updateMovie(existingMovie._id, movieData);
          
          if (response.success) {
            updatedCount++;
            console.log(`✅ Successfully updated: ${movieData.title}`);
          } else {
            errorCount++;
            console.error(`❌ Failed to update ${movieData.title}: ${response.message}`);
          }
        } else {
          notFoundCount++;
          console.log(`⚠️ Movie not found in database: ${movieData.title} (${movieData.year})`);
        }
      } else {
        notFoundCount++;
        console.log(`⚠️ Search failed for movie: ${movieData.title}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error updating ${movieData.title}:`, error);
    }
  }
  
  console.log(`
  📊 Update completed:
  ✅ Successfully updated: ${updatedCount} movies
  ⚠️ Not found in database: ${notFoundCount} movies
  ❌ Errors: ${errorCount} movies
  `);
  
  return {
    total: moviesData.length,
    updated: updatedCount,
    notFound: notFoundCount,
    error: errorCount
  };
};

// Add to window for easy access from console
if (typeof window !== 'undefined') {
  window.importMoviesFromJson = importMoviesFromJson;
  window.updateExistingMovies = updateExistingMovies;
  window.moviesData = moviesData;
}

export default {
  importMoviesFromJson,
  updateExistingMovies,
  moviesData
}; 