import React, { useRef } from 'react';
import MovieCard from './MovieCard';

const MovieSlider = ({ title, movies }) => {
  const sliderTrackRef = useRef(null);
  
  const scroll = (direction) => {
    const container = sliderTrackRef.current;
    const scrollAmount = 220 * 3 + 15 * 3; // 3 cards + 3 gaps
    
    if (container) {
      if (direction === 'left') {
        container.style.transform = `translateX(${Math.min(0, container.style.transform === '' ? 0 : parseInt(container.style.transform.match(/-?\d+/)[0]) + scrollAmount)}px)`;
      } else {
        container.style.transform = `translateX(${container.style.transform === '' ? -scrollAmount : parseInt(container.style.transform.match(/-?\d+/)[0]) - scrollAmount}px)`;
      }
    }
  };

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex gap-2.5">
          <button 
            onClick={() => scroll('left')}
            className="bg-white/10 border-none rounded-full w-9 h-9 flex items-center justify-center text-white text-sm transition-colors hover:bg-white/20"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="bg-white/10 border-none rounded-full w-9 h-9 flex items-center justify-center text-white text-sm transition-colors hover:bg-white/20"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          ref={sliderTrackRef} 
          className="flex gap-2 sm:gap-4 transition-transform duration-500 ease-in-out p-1"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-[160px] sm:w-[220px] aspect-[2/3]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieSlider; 