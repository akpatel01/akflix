import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';
import sampleMovies from '../data/movies.json'; // Import sample data as fallback
import apiUtils from '../utils/apiUtils';

const TVShows = () => {
  const location = useLocation();
  const [filter, setFilter] = useState('all');
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  
  // Reset state when the route changes
  useEffect(() => {
    setLoading(true);
    setTvShows([]);
    setError(null);
  }, [location.pathname]);
  
  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        // Get TV shows from the API
        const response = await apiUtils.get('/movies', { type: 'tv' });
        
        // Only use API data if we got a successful response with data
        if (response?.success && Array.isArray(response.data)) {
          const data = response.data || [];
          setTvShows(data);
          setUsingFallbackData(false);
        } else {
          // Use fallback data if the API response had an error
          useFallbackData();
        }
      } catch (error) {
        // Use fallback data on error
        useFallbackData();
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to use fallback data
    const useFallbackData = () => {
      // Filter the fallback data to only TV shows
      const fallbackShows = sampleMovies.filter(item => 
        item.type === 'tv' || item.categories?.includes('TV Show')
      );
      
      if (fallbackShows.length > 0) {
        // Add _id field to fallback data if not present
        const processedData = fallbackShows.map((show, index) => ({
          ...show,
          _id: show._id || `fallback-${index}`
        }));
        
        setTvShows(processedData);
        setUsingFallbackData(true);
      } else {
        setError('No TV shows found in fallback data.');
      }
    };
    
    fetchShows();
  }, []);
  
  const filterShows = () => {
    if (filter === 'all') {
      return tvShows;
    }
    return tvShows.filter(show => 
      show.genres && 
      show.genres.map(g => g.toLowerCase()).includes(filter.toLowerCase())
    );
  };
  
  // Extract all unique genres from TV shows
  const allGenres = [...new Set(tvShows.flatMap(show => show.genres || []))];
  const genres = ['all', ...allGenres];
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-2xl text-gray-200 mb-6">
          <i className="fas fa-tv mr-3 text-netflix-red"></i>
          We're having trouble loading TV shows
        </p>
        <p className="text-lg text-gray-400 mb-8">
          Try refreshing the page or check back later. We're constantly updating our collection with the best TV series!
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-netflix-red text-white border-none rounded py-2 px-6 cursor-pointer hover:bg-netflix-red-hover"
        >
          <i className="fas fa-redo-alt mr-2"></i> Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-8">TV Shows</h1>
      
      {usingFallbackData && (
        <div className="mb-4 p-2 bg-yellow-500/20 text-yellow-300 rounded">
          Note: Using local data. Some features may be limited.
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        {genres.map(genre => (
          <button
            key={genre}
            className={`border-none rounded-full py-2 px-4 text-sm cursor-pointer transition-all duration-200
            ${filter === genre 
              ? 'bg-netflix-red hover:bg-netflix-red-hover' 
              : 'bg-white/10 hover:bg-white/20'}`}
            onClick={() => setFilter(genre)}
          >
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </button>
        ))}
      </div>
      
      {filterShows().length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block p-8 bg-white/5 rounded-lg mb-6">
            <i className="fas fa-tv text-netflix-red text-5xl"></i>
          </div>
          <p className="text-2xl text-gray-200 mb-4">No TV shows found</p>
          <p className="text-lg text-gray-400">
            {filter !== 'all' 
              ? 'Try selecting a different genre filter' 
              : 'We\'ll be adding new shows to our collection soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {filterShows().map(show => (
            <div key={show._id} className="aspect-[2/3]">
              <MovieCard movie={show} />
              <div className="mt-2 text-sm text-center text-netflix-light-gray">{show.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TVShows; 