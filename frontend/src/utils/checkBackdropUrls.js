/**
 * Utility to check backdrop URLs in the movies.json file
 */
const moviesData = require('../data/movies.json');

// List of known working backdrop URLs that can replace broken ones
const alternativeBackdrops = [
  "https://image.tmdb.org/t/p/original/wgdWRXxyKBZ1zdw4BIGpHWuxurd.jpg", // The Dark Knight
  "https://image.tmdb.org/t/p/original/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg", // Inception
  "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", // Interstellar
  "https://image.tmdb.org/t/p/original/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg", // The Shawshank Redemption
  "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", // The Godfather
  "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg", // Pulp Fiction
  "https://image.tmdb.org/t/p/original/8y537tN7jJHqZ6NPL8l55NzXpn8.jpg", // The Matrix
  "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", // Stranger Things
  "https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", // Breaking Bad
  "https://image.tmdb.org/t/p/original/3Alm5vvfJMWvLcFpXsEXFIBwLsz.jpg", // Game of Thrones
  "https://image.tmdb.org/t/p/original/m7tG5E1EbywuwTsl6hq990So0Bx.jpg", // The Witcher
  "https://image.tmdb.org/t/p/original/ulkWS7FzXmUsT1rHj0cxPjRUmWI.jpg", // Dune
  "https://image.tmdb.org/t/p/original/nFFTLCXnOUT1SX2UqQp8uMQEUTz.jpg", // The Queen's Gambit
  "https://image.tmdb.org/t/p/original/4OTYefcAlaShn6TGVK33UxLW9R7.jpg", // Joker
  "https://image.tmdb.org/t/p/original/hpU2cHC9tk90hswCFEpf5AtbqoL.jpg", // Black Mirror
  "https://image.tmdb.org/t/p/original/5YEUYhgSE7lYtwWG6K6Ol8yI8Jn.jpg", // The Mandalorian
  "https://image.tmdb.org/t/p/original/XAgfZ1nTHjSMZtK0ww04ov9cB5c.jpg", // Blade Runner 2049
  "https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg", // Parasite
  "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", // Avatar
  "https://image.tmdb.org/t/p/original/cA3Doe2b9I6TayT8C34XU0pYPql.jpg" // Peaky Blinders
];

/**
 * Check if a backdrop URL is valid
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - True if valid, false if not
 */
async function isBackdropValid(url) {
  try {
    // Use fetch API to check if the URL is accessible
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error checking URL: ${url}`, error);
    return false;
  }
}

/**
 * Find movies with potentially broken backdrop URLs
 * This function is meant to be run in the browser console
 */
async function checkBackdropUrls() {
  console.log('Checking backdrop URLs in movies.json file...');
  
  const results = {
    valid: [],
    invalid: []
  };
  
  for (const movie of moviesData) {
    const { title, backdrop } = movie;
    try {
      const isValid = await isBackdropValid(backdrop);
      
      if (isValid) {
        results.valid.push({ title, backdrop });
        console.log(`✅ Valid backdrop for: ${title}`);
      } else {
        results.invalid.push({ title, backdrop });
        console.log(`❌ Invalid backdrop for: ${title}`);
      }
    } catch (error) {
      console.error(`Error checking backdrop for ${title}:`, error);
      results.invalid.push({ title, backdrop });
    }
  }
  
  console.log(`
  📊 Results:
  ✅ Valid backdrops: ${results.valid.length}
  ❌ Invalid backdrops: ${results.invalid.length}
  `);
  
  if (results.invalid.length > 0) {
    console.log('Movies with invalid backdrops:');
    results.invalid.forEach(movie => console.log(`- ${movie.title}: ${movie.backdrop}`));
    
    console.log('\nSuggested fixes:');
    results.invalid.forEach((movie, index) => {
      const newBackdrop = alternativeBackdrops[index % alternativeBackdrops.length];
      console.log(`${movie.title}: Replace with "${newBackdrop}"`);
    });
  }
  
  return results;
}

// Add to window for easy access from console
if (typeof window !== 'undefined') {
  window.checkBackdropUrls = checkBackdropUrls;
  window.isBackdropValid = isBackdropValid;
  window.alternativeBackdrops = alternativeBackdrops;
}

export default {
  checkBackdropUrls,
  isBackdropValid,
  alternativeBackdrops
}; 