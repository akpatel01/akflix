import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import MovieSlider from '../components/MovieSlider';
import movieService from '../services/movieService';
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
        
        // Fetch featured movies for the banner
        console.log('Home: Fetching featured movies...');
        const featuredResponse = await apiUtils.get('/movies/featured');
        console.log('Home: Received featured response:', featuredResponse);
        
        // Fetch genres to get their respective movies
        console.log('Home: Fetching categories...');
        const categoriesResponse = await apiUtils.get('/movies/categories');
        console.log('Home: Received categories response:', categoriesResponse);
        
        if (featuredResponse.success && Array.isArray(featuredResponse.data)) {
          console.log('Home: Processing featured data...');
          // Filter out items without valid backdrop images for the banner
          const validBannerMovies = featuredResponse.data.filter(
            movie => movie && movie.backdrop && movie.backdrop.trim() !== ''
          );
          
          if (validBannerMovies.length > 0) {
            setFeatured(validBannerMovies);
            console.log('Home: Set featured movies with valid backdrops:', validBannerMovies.length);
          } else {
            // Fallback to items even if they don't have backdrop images
            setFeatured(featuredResponse.data);
            console.log('Home: Set featured movies without filtering:', featuredResponse.data.length);
          }
        } else {
          // Use fallback data
          console.log('Home: Using fallback featured data');
          const fallbackFeatured = fallbackMovies.filter(movie => movie.isFeatured);
          setFeatured(fallbackFeatured);
          setUsingFallbackData(true);
        }
        
        // Process categories and fetch movies for each category
        if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
          console.log('Home: Processing categories data...');
          const topCategories = categoriesResponse.data.slice(0, 6);
          console.log('Home: Selected top categories:', topCategories.length);
          
          // Fetch movies for each category
          const categoryData = await Promise.all(
            topCategories.map(async (category) => {
              try {
                console.log('Home: Fetching movies for category:', category.name);
                const response = await apiUtils.get('/movies', { 
                  genre: category.name,
                  limit: 10
                });
                
                if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                  console.log('Home: Found movies for category:', category.name, response.data.length);
                  return {
                    name: category.name,
                    movies: response.data
                  };
                }
                console.log('Home: No movies found for category:', category.name);
                return null;
              } catch (error) {
                console.error('Home: Error fetching movies for category:', category.name, error);
                return null;
              }
            })
          );
          
          // Filter out categories that didn't return any movies
          const validCategories = categoryData.filter(category => category !== null);
          console.log('Home: Valid categories with movies:', validCategories.length);
          
          if (validCategories.length > 0) {
            setCategories(validCategories);
          } else {
            console.log('Home: No valid categories found, using fallback');
            useFallbackCategories();
          }
        } else {
          console.log('Home: Category response invalid, using fallback');
          useFallbackCategories();
        }
      } catch (error) {
        console.error('Home: Error fetching data:', error);
        // Use fallback data
        const fallbackFeatured = fallbackMovies.filter(movie => movie.isFeatured);
        setFeatured(fallbackFeatured);
        useFallbackCategories();
        setUsingFallbackData(true);
        setError('Failed to load from API, using fallback data');
      } finally {
        setIsLoading(false);
      }
    };
    
    const useFallbackCategories = () => {
      console.log('Home: Creating fallback categories');
      // Create categories from sample data
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
      
      console.log('Home: Created fallback categories:', fallbackCategories.length);
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