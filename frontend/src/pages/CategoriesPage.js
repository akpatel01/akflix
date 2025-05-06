import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiUtils from '../utils/apiUtils';

const CategoryCard = ({ category, count, movies = [] }) => {
  // Get up to 3 movie posters to display for this category
  const posters = movies.slice(0, 3).map(movie => movie.poster);

  return (
    <Link 
      to={`/genre/${category}`}
      className="bg-netflix-dark-gray rounded-md overflow-hidden hover:bg-gray-800 transition-colors duration-200 flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        {posters.length > 0 ? (
          <div className="flex h-full">
            {posters.map((poster, index) => (
              <div 
                key={index} 
                className="flex-1 bg-cover bg-center h-full"
                style={{ backgroundImage: `url(${poster})` }}
              ></div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-netflix-black">
            <i className="fas fa-film text-netflix-red text-3xl"></i>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-medium text-white">{category}</h3>
        <p className="text-sm text-gray-400 mt-1">{count} titles</p>
      </div>
    </Link>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moviesByGenre, setMoviesByGenre] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Make a single API call to get all movies (with limit)
        // Using a higher limit to get most movies in one request
        const moviesResponse = await apiUtils.get('/movies', { limit: 100 });
        
        if (moviesResponse.success && Array.isArray(moviesResponse.data)) {
          const allMovies = moviesResponse.data;
          
          // Extract all unique genres and count movies per genre
          const genreCounts = {};
          const moviesByGenreMap = {};
          
          // Process movies to group by genre
          allMovies.forEach(movie => {
            if (movie.genres && Array.isArray(movie.genres)) {
              movie.genres.forEach(genre => {
                // Count movies per genre
                if (!genreCounts[genre]) {
                  genreCounts[genre] = 0;
                  moviesByGenreMap[genre] = [];
                }
                genreCounts[genre]++;
                
                // Add movie to its genre's list (up to 3 per genre)
                if (moviesByGenreMap[genre].length < 3) {
                  moviesByGenreMap[genre].push(movie);
                }
              });
            }
          });
          
          // Convert to category objects format
          const categoriesWithCounts = Object.keys(genreCounts).map(genre => ({
            name: genre,
            count: genreCounts[genre]
          })).sort((a, b) => b.count - a.count); // Sort by popularity
          
          setCategories(categoriesWithCounts);
          setMoviesByGenre(moviesByGenreMap);
        } else {
          // Fallback to stats API if the first method fails
          // This is less efficient but ensures backward compatibility
          console.log('Falling back to separate API calls');
          
          // Fetch all categories
          const categoriesResponse = await apiUtils.get('/movies/categories');
          
          if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
            // Fetch stats to get movie counts by genre
            const statsResponse = await apiUtils.get('/movies/stats');
            
            // Create a map of genre to movie count
            const countMap = {};
            if (statsResponse.success && statsResponse.data && statsResponse.data.byGenre) {
              statsResponse.data.byGenre.forEach(item => {
                countMap[item.name] = item.count;
              });
            }
            
            // Add counts to categories
            const categoriesWithCounts = categoriesResponse.data.map(category => ({
              ...category,
              count: countMap[category.name] || 0
            })).sort((a, b) => b.count - a.count); // Sort by popularity
            
            setCategories(categoriesWithCounts);
          } else {
            setError('Failed to load categories');
          }
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('An error occurred while loading content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-semibold mb-8">Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-netflix-dark-gray rounded-md overflow-hidden">
              <div className="h-40 bg-gray-800 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 w-24 bg-gray-800 animate-pulse mb-2"></div>
                <div className="h-4 w-16 bg-gray-800 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-semibold mb-8">Categories</h1>
        <div className="bg-netflix-dark-gray p-8 rounded-md text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-netflix-red text-white py-2 px-6 rounded-md hover:bg-netflix-red-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-2">Categories</h1>
      <p className="text-gray-400 mb-8">Browse movies and TV shows by genre</p>

      {categories.length === 0 ? (
        <div className="text-center p-8 bg-netflix-dark-gray rounded-md">
          <p className="text-xl text-gray-300">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index} 
              category={category.name} 
              count={category.count} 
              movies={moviesByGenre[category.name] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage; 