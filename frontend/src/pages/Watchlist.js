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
            console.error(`Error fetching movie ${id}:`, err);
          }
        }
        
        setWatchlistMovies(moviesData);
      } catch (err) {
        setError(err.message || 'Failed to load watchlist');
        console.error('Error fetching watchlist:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWatchlistMovies();
  }, [currentUser, navigate]);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8">My Watchlist</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-xl text-red-500 mb-4">Error loading watchlist</p>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : watchlistMovies.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">Your watchlist is empty.</p>
          <p className="text-gray-500 mt-2">
            Add movies or TV shows by clicking the + button on any title.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {watchlistMovies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist; 