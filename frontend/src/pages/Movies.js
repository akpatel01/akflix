import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';
import sampleMovies from '../data/movies.json'; // Import sample data as fallback
import apiUtils, { fetchCategoryRelated, fetchMoviesByCategory } from '../utils/apiUtils';

const Movies = () => {
  const location = useLocation();
  const [filter, setFilter] = useState('all');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  
  // Reset state and refetch data on route change
  useEffect(() => {
    setIsLoading(true);
    setMovies([]);
    setFilteredMovies([]);
    setFilter('all');
    
    // Fetch movies will be triggered by the dependency change
  }, [location.pathname]);
  
  // Fetch all movies first
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        // Get movies filtered by type (not tv-show)
        const response = await apiUtils.get('/movies', { type: 'movie' });
        
        // Only use API data if we got a successful response
        if (response?.success) {
          setMovies(response.data || []);
          setFilteredMovies(response.data || []);
          setUsingFallbackData(false);
        } else {
          // Use fallback data if the API response had an error
          useFallbackData();
        }
      } catch (error) {
        // Use fallback data on error
        useFallbackData();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to use fallback data
    const useFallbackData = () => {
      // Filter fallback data to only include movies (not TV shows)
      const filteredMovies = sampleMovies.filter(item => item.type !== 'tv-show');
      
      // Add _id field to fallback data if not present
      const processedMovies = filteredMovies.map((movie, index) => ({
        ...movie,
        _id: movie._id || `fallback-${index}`
      }));
      
      setMovies(processedMovies);
      setFilteredMovies(processedMovies); 
      setUsingFallbackData(true);
    };
    
    fetchMovies();
  }, [location.pathname]);
  
  // Fetch genres for filtering
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await apiUtils.get('/movies/categories');
        if (fetchedGenres.success && Array.isArray(fetchedGenres.data)) {
          // Add 'all' at the beginning of the genres array
          setGenres(['all', ...fetchedGenres.data.map(category => category.name)]);
        }
      } catch (error) {
        // Silently use default genres on error
        setGenres(['all']);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Apply filter when it changes
  useEffect(() => {
    const applyFilter = async () => {
      try {
        setIsLoading(true);
        
        if (filter === 'all') {
          // Show all movies
          setFilteredMovies(movies);
        } else {
          // Try getting filtered movies from API first
          try {
            const response = await apiUtils.get('/movies', { 
              genre: filter,
              limit: 50
            });
            
            if (response?.success && Array.isArray(response.data)) {
              setFilteredMovies(response.data);
            } else {
              // Fall back to client-side filtering
              performClientSideFiltering();
            }
          } catch (error) {
            // Fall back to client-side filtering
            performClientSideFiltering();
          }
        }
      } catch (error) {
        // On any error, just show what we have
        setFilteredMovies(movies);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Client-side filtering function
    const performClientSideFiltering = () => {
      // Case-insensitive filtering
      const filtered = movies.filter(movie => 
        movie.genres && 
        movie.genres.some(genre => 
          genre.toLowerCase() === filter.toLowerCase()
        )
      );
      setFilteredMovies(filtered);
    };
    
    applyFilter();
  }, [filter, movies]);
  
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl mb-4 sm:mb-8">Movies</h1>
      
      {usingFallbackData && (
        <div className="mb-4 p-2 bg-yellow-500/20 text-yellow-300 rounded text-sm sm:text-base">
          Note: Using local data. Some features may be limited.
        </div>
      )}
      
      <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
        {genres.map(genre => (
          <button
            key={genre}
            className={`border-none rounded-full py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer transition-all duration-200
            ${filter === genre 
              ? 'bg-netflix-red hover:bg-netflix-red-hover' 
              : 'bg-white/10 hover:bg-white/20'}`}
            onClick={() => setFilter(genre)}
          >
            {genre === 'all' ? 'All' : genre.charAt(0).toUpperCase() + genre.slice(1)}
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-2xl text-gray-200 mb-6">
            <i className="fas fa-film mr-3 text-netflix-red"></i>
            We're having trouble loading movies
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Try refreshing the page or check back later. Our team is working on bringing the latest movies to you!
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-netflix-red text-white border-none rounded py-2 px-6 cursor-pointer hover:bg-netflix-red-hover"
          >
            <i className="fas fa-redo-alt mr-2"></i> Try Again
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block p-8 bg-white/5 rounded-lg mb-6">
            <i className="fas fa-search text-netflix-red text-5xl"></i>
          </div>
          <p className="text-2xl text-gray-200 mb-4">No movies found for {filter === 'all' ? 'this category' : filter}</p>
          <p className="text-lg text-gray-400">Try changing the filter or check back soon for new additions</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {filteredMovies.map(movie => (
            <div key={movie._id} className="aspect-[2/3]">
              <MovieCard movie={movie} />
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-center text-netflix-light-gray">{movie.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies; 