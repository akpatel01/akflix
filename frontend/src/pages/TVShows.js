import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';

const TVShows = () => {
  const [filter, setFilter] = useState('all');
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        // Get TV shows from API using type filter
        const response = await movieService.getMovies({ type: 'tv-show' });
        
        if (response.success) {
          setTvShows(response.data || []);
        } else {
          setError(response.message || 'Failed to load TV shows');
        }
      } catch (error) {
        console.error('Error loading TV shows:', error);
        setError('An error occurred while loading TV shows');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTVShows();
  }, []);
  
  const filterShows = () => {
    if (filter === 'all') {
      return tvShows;
    }
    return tvShows.filter(show => show.genres.includes(filter));
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
        <p className="text-xl text-red-500 mb-4">Error loading TV shows</p>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-8">TV Shows</h1>
      
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
          <p className="text-xl text-gray-400">No TV shows found</p>
          <p className="text-gray-500 mt-2">{filter !== 'all' ? 'Try a different filter' : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {filterShows().map(show => (
            <MovieCard key={show._id} movie={show} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TVShows; 