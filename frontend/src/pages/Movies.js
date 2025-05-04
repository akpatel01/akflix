import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';

const Movies = () => {
  const [filter, setFilter] = useState('all');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        let response;
        
        if (filter === 'all') {
          response = await movieService.getMovies({ limit: 50 });
        } else {
          response = await movieService.getMoviesByGenre(filter);
        }
        
        if (response.success) {
          setMovies(response.data);
        } else {
          setError(response.message || 'Failed to load movies');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, [filter]);
  
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await movieService.getGenres();
        // Add 'all' to the beginning of the genres array
        setGenres(['all', ...fetchedGenres]);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    
    fetchGenres();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-8">Movies</h1>
      
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
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-xl text-red-500 mb-4">Error loading movies</p>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">No movies found</p>
          <p className="text-gray-500 mt-2">Try changing the filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies; 