import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const query = searchParams.get('q') || '';
  
  useEffect(() => {
    // Don't search if query is empty
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    const searchMovies = async () => {
      setLoading(true);
      try {
        const response = await movieService.searchMovies(query);
        
        if (response.success) {
          setResults(response.data || []);
        } else {
          setError(response.message || 'Search failed');
        }
      } catch (error) {
        console.error('Error searching movies:', error);
        setError('An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };
    
    // Add small timeout to prevent too many requests while typing
    const timer = setTimeout(() => {
      searchMovies();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-8">
        Search results for: <span className="text-netflix-red">{query}</span>
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="text-netflix-red text-xl sm:text-2xl">
            <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-10">
          <p className="text-lg sm:text-xl text-red-500 mb-4">{error}</p>
          <p className="text-sm sm:text-base text-gray-500 mt-2">Please try again later</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 sm:py-10">
          <p className="text-lg sm:text-xl text-gray-400">No results found for "{query}"</p>
          <p className="text-sm sm:text-base text-gray-500 mt-2">Try a different search term</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-base sm:text-lg">{results.length} results found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
            {results.map(result => (
              <div key={result._id} className="aspect-[2/3]">
                <MovieCard movie={result} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults; 