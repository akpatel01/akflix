import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Banner = ({ featuredMovies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [localFeaturedItems, setLocalFeaturedItems] = useState([]);
  
  // Update local state when featuredMovies prop changes
  useEffect(() => {
    if (Array.isArray(featuredMovies)) {
      // Filter out movies without valid backdrop URLs
      const validMovies = featuredMovies.filter(movie => 
        movie && movie.backdrop && typeof movie.backdrop === 'string' && movie.backdrop.trim() !== ''
      );
      console.log('Valid featured movies with backdrops:', validMovies);
      
      if (validMovies.length > 0) {
        setLocalFeaturedItems(validMovies);
        // Reset current index if it would be out of bounds with the new items
        if (currentIndex >= validMovies.length) {
          setCurrentIndex(0);
        }
      } else if (featuredMovies.length > 0) {
        // If we have featured movies but none with valid backdrops, use them anyway
        console.log('Using featured movies despite missing backdrops');
        setLocalFeaturedItems(featuredMovies);
      } else {
        setLocalFeaturedItems([]);
      }
    } else if (featuredMovies) {
      // Handle single movie case
      setLocalFeaturedItems([featuredMovies]);
    } else {
      setLocalFeaturedItems([]);
    }
  }, [featuredMovies, currentIndex]);
  
  const currentMovie = localFeaturedItems[currentIndex];
  console.log("Banner local featured items:", localFeaturedItems);
  console.log("Current movie:", currentMovie);

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoplay || localFeaturedItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % localFeaturedItems.length);
    }, 6000); // Change slide every 6 seconds
    
    return () => clearInterval(interval);
  }, [isAutoplay, localFeaturedItems.length]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setIsAutoplay(false);
  const handleMouseLeave = () => setIsAutoplay(true);
  
  // Navigation functions
  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    // Temporarily pause autoplay when manually navigating
    setIsAutoplay(false);
    setTimeout(() => setIsAutoplay(true), 4000);
  }, []);
  
  // Touch events for mobile swiping
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next slide
        const newIndex = (currentIndex + 1) % localFeaturedItems.length;
        goToSlide(newIndex);
      } else {
        // Swipe right - go to previous slide
        const newIndex = currentIndex === 0 ? localFeaturedItems.length - 1 : currentIndex - 1;
        goToSlide(newIndex);
      }
      setTouchStart(0);
    }
  };
  
  if (!currentMovie) return null;
  
  // Check if backdrop URL exists and is valid
  const backdropUrl = currentMovie.backdrop && typeof currentMovie.backdrop === 'string' 
    ? currentMovie.backdrop.trim() 
    : '';

  console.log('Current backdrop URL:', backdropUrl);
  
  return (
    <div 
      className="relative h-80vh w-full mb-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700"
        style={{ 
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundColor: backdropUrl ? 'transparent' : '#111',
        }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
      
      <div className="absolute top-0 left-0 w-full h-full flex items-center">
        <div className="px-[50px] w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">{currentMovie.title}</h1>
          
          <div className="mb-5">
            {currentMovie.genres && currentMovie.genres.map((genre, index) => (
              <span key={index} className="bg-white/10 py-1 px-3 rounded-full mr-2.5 text-sm">
                {genre}
              </span>
            ))}
          </div>
          
          <p className="text-lg mb-6 leading-relaxed text-shadow">
            {currentMovie.description}
          </p>
          
          <div className="flex gap-4">
            <Link
              to={`/watch/${currentMovie._id || currentMovie.id}`}
              className="bg-netflix-red text-white border-none rounded py-2.5 px-5 text-base font-semibold flex items-center transition-colors hover:bg-netflix-red-hover"
            >
              <i className="fas fa-play mr-2.5"></i> Play
            </Link>
            
            <button className="bg-white/20 text-white border-none rounded py-2.5 px-5 text-base font-semibold flex items-center transition-colors hover:bg-white/30">
              <i className="fas fa-info-circle mr-2.5"></i> More Info
            </button>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      {localFeaturedItems.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {localFeaturedItems.map((_, index) => (
            <button 
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner; 