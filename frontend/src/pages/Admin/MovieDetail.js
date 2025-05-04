import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import movieService from '../../services/movieService';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      
      try {
        const response = await movieService.getMovie(id);
        
        if (response.success) {
          setMovie(response.data);
        } else {
          setError(response.message || 'Movie not found');
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError('An error occurred while loading the movie');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-netflix-red text-2xl mb-2"></i>
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-film text-4xl mb-3"></i>
          <h2 className="text-xl font-semibold">Movie not found</h2>
          <p className="mb-4">{error || "The movie you're looking for doesn't exist or has been removed."}</p>
        </div>
        <button
          onClick={() => navigate('/admin/movies')}
          className="bg-netflix-red hover:bg-netflix-red-hover text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Movie Details</h2>
        <div className="flex space-x-3">
          <Link
            to={`/admin/movies/edit/${movie._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center"
          >
            <i className="fas fa-edit mr-2"></i> Edit
          </Link>
          <button
            onClick={() => navigate('/admin/movies')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {/* Backdrop Image */}
        <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${movie.backdrop})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Poster */}
            <div className="md:w-1/4 mb-6 md:mb-0 md:pr-6">
              <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full rounded shadow-lg"
              />
            </div>
            
            {/* Details */}
            <div className="md:w-3/4">
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                {movie.title} 
                <span className="text-gray-400 ml-3 text-xl">({movie.year})</span>
              </h1>
              
              <div className="flex items-center mb-4">
                <span className="bg-yellow-600 text-white px-2 py-1 rounded mr-3 flex items-center">
                  <i className="fas fa-star mr-1"></i> {movie.rating}/10
                </span>
                <span className="text-gray-400">{movie.duration}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map(genre => (
                  <span key={genre} className="bg-gray-800 text-gray-300 py-1 px-3 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-gray-300">{movie.description}</p>
              </div>
              
              {movie.director && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold mb-1">Director</h3>
                  <p className="text-gray-300">{movie.director}</p>
                </div>
              )}
              
              {movie.actors && movie.actors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.actors.map(actor => (
                      <span key={actor} className="bg-gray-800 text-gray-300 py-1 px-3 rounded-full text-sm">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {movie.videoUrl && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
                  <div className="aspect-video bg-black rounded overflow-hidden">
                    <video 
                      src={movie.videoUrl}
                      controls
                      poster={movie.backdrop}
                      className="w-full h-full"
                    ></video>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Technical Details Section */}
        <div className="border-t border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">ID</h4>
              <p className="text-white">{movie._id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Poster URL</h4>
              <p className="text-white break-all text-sm">{movie.poster}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Backdrop URL</h4>
              <p className="text-white break-all text-sm">{movie.backdrop}</p>
            </div>
            {movie.videoUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Video URL</h4>
                <p className="text-white break-all text-sm">{movie.videoUrl}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail; 