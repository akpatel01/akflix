import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import movieService from '../services/movieService';

const Watchlist = () => {
  const { currentUser } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchWatchlistMovies = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user's watchlist IDs
        const watchlistIds = currentUser.watchlist || [];
        
        if (watchlistIds.length === 0) {
          setWatchlistMovies([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch full movie details for each ID in watchlist
        const moviesData = [];
        
        for (const id of watchlistIds) {
          try {
            const response = await movieService.getMovie(id);
            if (response.success) {
              moviesData.push(response.data);
            }
          } catch (err) {
            // Silently handle individual movie fetch errors
          }
        }
        
        setWatchlistMovies(moviesData);
      } catch (err) {
        setError(err.message || 'Failed to load watchlist');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWatchlistMovies();
  }, [currentUser, navigate]);
  
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-8">My Watchlist</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16 sm:py-20">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-netflix-red" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-10">
          <p className="text-lg sm:text-xl text-red-500 mb-4">Error loading watchlist</p>
          <p className="text-sm sm:text-base text-gray-400">{error}</p>
        </div>
      ) : watchlistMovies.length === 0 ? (
        <div className="text-center py-8 sm:py-10">
          <p className="text-lg sm:text-xl text-gray-400">Your watchlist is empty.</p>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Add movies or TV shows by clicking the + button on any title.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {watchlistMovies.map(item => (
            <div key={item._id} className="aspect-[2/3]">
              <MovieCard movie={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist; 