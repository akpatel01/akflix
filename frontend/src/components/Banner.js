import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import MovieDetailsModal from './MovieDetailsModal';

const Banner = ({ movies = [], local = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!movies || movies.length <= 1) return;
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    },
    onSwipedRight: () => {
      if (!movies || movies.length <= 1) return;
      setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    },
    onSwiping: () => setIsSwiping(true),
    onSwiped: () => setIsSwiping(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });
  
  // Filter movies to only include those with valid backdrop URLs
  useEffect(() => {
    if (!Array.isArray(movies)) {
      setCurrentMovie(null);
      return;
    }
    
    if (movies && movies.length > 0) {
      // For banner, we need items with backdrop images
      const validMovies = movies.filter(m => m && m.backdrop && m.backdrop.trim() !== '');
      
      if (validMovies.length > 0) {
        setCurrentMovie(validMovies[currentIndex % validMovies.length]);
      } else if (movies.length > 0) {
        // Fall back to movies even without backdrops if we have no valid ones
        setCurrentMovie(movies[currentIndex % movies.length]);
      } else {
        setCurrentMovie(null);
      }
    } else {
      setCurrentMovie(null);
    }
  }, [movies, currentIndex]);

  // Auto-rotate banner every 8 seconds
  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [movies]);

  if (!currentMovie) {
    return (
      <div className="w-full h-[550px] bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 text-xl">No featured content available</p>
      </div>
    );
  }

  // Determine backdrop URL based on whether it's a local file or remote URL
  let backdropUrl = currentMovie.backdrop || '';
  if (local && backdropUrl && !backdropUrl.startsWith('http')) {
    // For local images, add the public path
    backdropUrl = `/images/${backdropUrl}`;
  }

  return (
    <>
      <div 
        className="relative w-full h-[550px] overflow-hidden"
        {...handlers}
      >
        {/* Backdrop Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ${
            isSwiping ? 'scale-[1.02]' : ''
          }`}
          style={{ 
            backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
            backgroundPosition: 'center 20%',
            backgroundColor: backdropUrl ? 'transparent' : '#111'
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </div>
        
        {/* Swipe Indicators */}
        <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/20 to-transparent opacity-0 transition-opacity duration-300 ${
          isSwiping ? 'opacity-100' : ''
        }`}>
          <div className="h-full flex items-center justify-center text-white/50">
            <i className="fas fa-chevron-left"></i>
          </div>
        </div>
        
        <div className={`absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/20 to-transparent opacity-0 transition-opacity duration-300 ${
          isSwiping ? 'opacity-100' : ''
        }`}>
          <div className="h-full flex items-center justify-center text-white/50">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-12 max-w-3xl">
          <h1 className="text-5xl font-bold text-white mb-4">{currentMovie.title}</h1>
          
          {currentMovie.releaseDate && (
            <p className="text-gray-300 text-sm mb-2">
              {new Date(currentMovie.releaseDate).getFullYear()}
              {currentMovie.rating && ` • ${currentMovie.rating}`}
              {currentMovie.duration && ` • ${currentMovie.duration}`}
            </p>
          )}
          
          <p className="text-gray-200 text-lg mb-6 line-clamp-3">
            {currentMovie.overview || currentMovie.description || ''}
          </p>
          
          <div className="flex space-x-4">
            <Link
              to={`/watch/${currentMovie._id || currentMovie.id || 'preview'}`}
              className="bg-netflix-red hover:bg-netflix-red-hover text-white py-3 px-8 rounded flex items-center"
            >
              <i className="fas fa-play mr-2"></i> Play
            </Link>
            
            <button 
              onClick={() => setShowDetailsModal(true)}
              className="bg-gray-600/80 hover:bg-gray-700 text-white py-3 px-8 rounded flex items-center"
            >
              <i className="fas fa-info-circle mr-2"></i> More Info
            </button>
          </div>
        </div>
        
        {/* Pagination dots */}
        {movies.length > 1 && (
          <div className="absolute bottom-8 right-8 flex space-x-2">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex % movies.length 
                    ? 'bg-white' 
                    : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={currentMovie}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </>
  );
};

export default Banner; 