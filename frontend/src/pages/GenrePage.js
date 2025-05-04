import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import movieService from '../services/movieService';

const GenrePage = () => {
  const { genreId } = useParams();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format genre name for display
  const genreName = genreId.charAt(0).toUpperCase() + genreId.slice(1);
  
  useEffect(() => {
    const fetchContentByGenre = async () => {
      try {
        setLoading(true);
        // Get movies and TV shows filtered by the genre
        const response = await movieService.getMoviesByGenre(genreId.toLowerCase());
        
        if (response.success) {
          setContent(response.data || []);
        } else {
          setError(response.message || 'Failed to load content');
        }
      } catch (error) {
        console.error(`Error loading ${genreName} content:`, error);
        setError('An error occurred while loading content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContentByGenre();
  }, [genreId, genreName]);
  
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
        <p className="text-xl text-red-500 mb-4">Error loading content</p>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8">{genreName} Movies & TV Shows</h1>
      
      {content.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">No content found for this genre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {content.map(item => (
            <MovieCard key={item._id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenrePage; 