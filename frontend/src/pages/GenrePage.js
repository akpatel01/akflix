import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';
import sampleMovies from '../data/movies.json'; // Import sample data as fallback
import apiUtils from '../utils/apiUtils';

const GenrePage = () => {
  const { genreId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [subGenres, setSubGenres] = useState([]);
  const [activeSubGenre, setActiveSubGenre] = useState(null);
  
  // Format genre name for display
  const genreName = genreId.charAt(0).toUpperCase() + genreId.slice(1);
  
  // Fetch all categories once
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categoryResponse = await apiUtils.get('/movies/categories');
        if (categoryResponse.success && Array.isArray(categoryResponse.data)) {
          // Find potential related categories (simple string matching)
          const allCategories = categoryResponse.data.map(cat => cat.name);
          const related = allCategories.filter(cat => 
            cat.toLowerCase() !== genreId.toLowerCase() && 
            (cat.includes(genreId) || genreId.includes(cat) || 
             // Add common related genres (could be expanded)
             (genreId.toLowerCase() === 'action' && ['Adventure', 'Thriller'].includes(cat)) ||
             (genreId.toLowerCase() === 'comedy' && ['Romance', 'Family'].includes(cat)) ||
             (genreId.toLowerCase() === 'drama' && ['Romance', 'Crime'].includes(cat))
            )
          );
          
          setSubGenres(related);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchAllCategories();
  }, [genreId]);
  
  // Fetch all movies once and store them
  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        setLoading(true);
        const response = await apiUtils.get('/movies', { limit: 100 });
        
        if (response?.success && Array.isArray(response.data)) {
          console.log(`Fetched ${response.data.length} movies for filtering`);
          setAllMovies(response.data);
          setUsingFallbackData(false);
        } else {
          console.warn('API response unsuccessful, using fallback data');
          // Use fallback data
          const fallbackData = sampleMovies.map((movie, index) => ({
            ...movie,
            _id: movie._id || `fallback-${index}`
          }));
          setAllMovies(fallbackData);
          setUsingFallbackData(true);
        }
      } catch (error) {
        console.error('Error fetching all movies:', error);
        // Use fallback data
        const fallbackData = sampleMovies.map((movie, index) => ({
          ...movie,
          _id: movie._id || `fallback-${index}`
        }));
        setAllMovies(fallbackData);
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllMovies();
  }, []);
  
  // Filter movies based on the selected genre
  useEffect(() => {
    setLoading(true);
    
    // Reset content when switching genres
    setContent([]);
    setError(null);
    
    const filterMoviesByGenre = async () => {
      try {
        const genreToFilter = activeSubGenre || genreId;
        console.log(`Filtering movies for genre: ${genreToFilter}`);
        
        // Try to get from API first
        try {
          const response = await apiUtils.get('/movies', { 
            genre: genreToFilter.toLowerCase(),
            limit: 50 
          });
          
          if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`Got ${response.data.length} movies from API for ${genreToFilter}`);
            setContent(response.data);
            setUsingFallbackData(false);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API error, falling back to client filtering:', apiError);
        }
        
        // If API call fails or returns no results, filter the allMovies array
        console.log(`Filtering ${allMovies.length} movies for genre: ${genreToFilter}`);
        
        // Case-insensitive genre filtering
        const filteredMovies = allMovies.filter(movie => 
          movie.genres && Array.isArray(movie.genres) &&
          movie.genres.some(genre => 
            genre.toLowerCase() === genreToFilter.toLowerCase()
          )
        );
        
        console.log(`Found ${filteredMovies.length} movies matching ${genreToFilter}`);
        
        if (filteredMovies.length > 0) {
          setContent(filteredMovies);
          setUsingFallbackData(usingFallbackData); // Keep existing fallback status
        } else {
          setError(`No movies found for ${genreToFilter}`);
        }
      } catch (error) {
        console.error('Error filtering movies:', error);
        setError(`Error loading ${genreId} content`);
      } finally {
        setLoading(false);
      }
    };
    
    filterMoviesByGenre();
  }, [genreId, activeSubGenre, allMovies, usingFallbackData]);
  
  // Handle sub-genre selection
  const handleSubGenreClick = (subGenre) => {
    setActiveSubGenre(subGenre);
    // This will trigger a re-filter with the new active sub-genre
  };
  
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
          <i className="fas fa-film mr-3 text-netflix-red"></i>
          We're having trouble finding {activeSubGenre || genreName} content
        </p>
        <p className="text-lg text-gray-400 mb-8">
          Try refreshing the page or check back later. We're working on bringing more great {activeSubGenre || genreName} titles to you soon!
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
      <h1 className="text-3xl font-semibold mb-4">{activeSubGenre || genreName} Movies & TV Shows</h1>
      
      {/* Sub-genre navigation */}
      {subGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveSubGenre(null)}
            className={`px-4 py-2 rounded-full text-sm ${!activeSubGenre 
              ? 'bg-netflix-red text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            All {genreName}
          </button>
          
          {subGenres.map((subGenre, index) => (
            <button 
              key={index}
              onClick={() => handleSubGenreClick(subGenre)}
              className={`px-4 py-2 rounded-full text-sm ${activeSubGenre === subGenre 
                ? 'bg-netflix-red text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {subGenre}
            </button>
          ))}
        </div>
      )}
      
      {usingFallbackData && (
        <div className="mb-4 p-2 bg-yellow-500/20 text-yellow-300 rounded">
          Note: Using local data. Some features may be limited.
        </div>
      )}
      
      {content.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block p-8 bg-white/5 rounded-lg mb-6">
            <i className="fas fa-film text-netflix-red text-5xl"></i>
          </div>
          <p className="text-2xl text-gray-200 mb-4">
            No {activeSubGenre || genreName} content found
          </p>
          <p className="text-lg text-gray-400 mb-6">
            We're constantly updating our library with new titles
          </p>
        </div>
      ) : (
        <>
          <p className="mb-6 text-lg">{content.length} titles found</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
            {content.map(item => (
              <div key={item._id} className="aspect-[2/3]">
                <MovieCard movie={item} />
                <div className="mt-2 text-sm text-center text-netflix-light-gray">{item.year}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GenrePage; 