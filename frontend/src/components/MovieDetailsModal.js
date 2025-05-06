import React from 'react';
import { Link } from 'react-router-dom';

const MovieDetailsModal = ({ movie, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Movie backdrop */}
        <div className="relative h-[400px] w-full">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>
          
          {/* Play button overlay */}
          <Link
            to={`/watch/${movie._id || movie.id || 'preview'}`}
            className="absolute bottom-8 left-8 bg-white hover:bg-white/90 text-black py-3 px-8 rounded flex items-center transition-colors"
          >
            <i className="fas fa-play mr-2"></i> Play
          </Link>
        </div>

        {/* Content */}
        <div className="p-8 pt-0">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                {movie.releaseDate && (
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                )}
                {movie.rating && <span>{movie.rating}/10</span>}
                {movie.duration && <span>{movie.duration}</span>}
                {movie.maturityRating && (
                  <span className="border border-gray-400 px-2 py-0.5 rounded">
                    {movie.maturityRating}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-lg mb-6">
            {movie.overview || movie.description || 'No description available.'}
          </p>

          {/* Additional details */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-4">
              <span className="text-gray-400">Genres: </span>
              <span className="text-white">
                {movie.genres.join(', ')}
              </span>
            </div>
          )}

          {movie.cast && movie.cast.length > 0 && (
            <div className="mb-4">
              <span className="text-gray-400">Cast: </span>
              <span className="text-white">
                {movie.cast.join(', ')}
              </span>
            </div>
          )}

          {movie.director && (
            <div className="mb-4">
              <span className="text-gray-400">Director: </span>
              <span className="text-white">{movie.director}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal; 