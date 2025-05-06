import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import MovieSlider from '../components/MovieSlider';
import fallbackMovies from '../data/movies.json'; // Import fallback data
import apiUtils from '../utils/apiUtils';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Make a single API call to get all movies
        // Using a higher limit to get most of the movies in one request
        const allMoviesResponse = await apiUtils.get('/movies', { limit: 150 });
        
        if (allMoviesResponse.success && Array.isArray(allMoviesResponse.data)) {
          const allMovies = allMoviesResponse.data;
          
          // Extract featured movies
          const featuredMovies = allMovies.filter(movie => movie.isFeatured);
          
          // Filter out items without valid backdrop images for the banner
          const validBannerMovies = featuredMovies.filter(
            movie => movie && movie.backdrop && movie.backdrop.trim() !== ''
          );
          
          if (validBannerMovies.length > 0) {
            setFeatured(validBannerMovies);
          } else if (featuredMovies.length > 0) {
            // Fallback to featured items even if they don't have backdrop images
            setFeatured(featuredMovies);
          } else {
            // If no featured movies found, use top rated or recent movies for banner
            const topMovies = [...allMovies]
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 5);
            setFeatured(topMovies);
          }
          
          // Process movies by genre
          const genreMap = {};
          
          allMovies.forEach(movie => {
            if (movie.genres && Array.isArray(movie.genres)) {
              movie.genres.forEach(genre => {
                if (!genreMap[genre]) {
                  genreMap[genre] = [];
                }
                genreMap[genre].push(movie);
              });
            }
          });
          
          // Convert map to array of category objects
          // Sort genres by number of movies (descending)
          const categoriesData = Object.keys(genreMap)
            .filter(genre => genreMap[genre].length >= 4) // Only use genres with enough movies
            .sort((a, b) => genreMap[b].length - genreMap[a].length)
            .map(genre => ({
              name: genre,
              movies: genreMap[genre].slice(0, 10) // Limit to 10 movies per category
            }))
            .slice(0, 6); // Limit to 6 categories
          
          setCategories(categoriesData);
        } else {
          // Use fallback data
          useFallbackData();
        }
      } catch (error) {
        // Use fallback data
        useFallbackData();
        setError('Failed to load from API, using fallback data');
      } finally {
        setIsLoading(false);
      }
    };
    
    const useFallbackData = () => {
      // Set featured movies from fallback data
      const fallbackFeatured = fallbackMovies.filter(movie => movie.isFeatured);
      setFeatured(fallbackFeatured);
      
      // Create categories from fallback data
      const genreMap = {};
      
      fallbackMovies.forEach(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
          movie.genres.forEach(genre => {
            if (!genreMap[genre]) {
              genreMap[genre] = [];
            }
            genreMap[genre].push(movie);
          });
        }
      });
      
      // Convert map to array of category objects
      const fallbackCategories = Object.keys(genreMap)
        .filter(genre => genreMap[genre].length >= 4) // Only use genres with enough movies
        .map(genre => ({
          name: genre,
          movies: genreMap[genre].slice(0, 10) // Limit to 10 movies per category
        }))
        .slice(0, 6); // Limit to 6 categories
      
      setCategories(fallbackCategories);
      setUsingFallbackData(true);
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  if (error && !usingFallbackData) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-500 mb-4">Error loading content</p>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-[50px]">
      {usingFallbackData && (
        <div className="bg-yellow-500/20 text-yellow-300 py-2 px-4 text-center mb-4">
          <i className="fas fa-info-circle mr-2"></i>
          Using local data. Some features may be limited.
        </div>
      )}
      
      {featured && featured.length > 0 && <Banner movies={featured} />}
      
      <div className="mt-6 px-6">
        {categories && categories.length > 0 ? (
          categories.map((category, index) => (
            <MovieSlider key={index} title={category.name} movies={category.movies} />
          ))
        ) : (
          <div className="text-center py-10">
            <div className="inline-block p-8 bg-white/5 rounded-lg mb-6">
              <i className="fas fa-film text-netflix-red text-5xl"></i>
            </div>
            <p className="text-2xl text-gray-200 mb-4">No movies found</p>
            <p className="text-lg text-gray-400">We'll be adding new movies to our collection soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 