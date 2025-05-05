import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import AlertModal from './AlertModal';
import LoginModal from './LoginModal';
import AddToWatchlistModal from './AddToWatchlistModal';
import { useToast } from '../context/ToastContext';

const MovieCard = ({ movie }) => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLikeConfirm, setShowLikeConfirm] = useState(false);
  const [showAddToWatchlistModal, setShowAddToWatchlistModal] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // Ensure movie has a valid ID
  const movieId = movie._id || movie.id || `movie-${movie.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  
  useEffect(() => {
    if (currentUser && currentUser.watchlist) {
      setIsInWatchlist(userService.isInWatchlist(movieId));
    } else {
      setIsInWatchlist(false);
    }
  }, [currentUser, movieId]);
  
  const handlePlayClick = (e) => {
    e.preventDefault();
    console.log('Play clicked for movie:', movie.title, 'with ID:', movieId);
    navigate(`/watch/${movieId}`);
  };
  
  const handleWatchlistClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    // Show the watchlist modal
    setShowAddToWatchlistModal(true);
  };
  
  const handleRemoveFromWatchlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const response = await userService.toggleWatchlist(movieId);
      
      if (response.success) {
        setIsInWatchlist(false);
        toast.info(`Removed "${movie.title}" from your watchlist`);
        
        // Update AuthContext with new watchlist
        if (updateUser) {
          updateUser({
            ...currentUser,
            watchlist: response.watchlist
          });
        }
      } else {
        toast.error(response.message || 'Failed to update watchlist');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      console.error(err);
    }
  };
  
  const handleLikeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    // Like functionality would be implemented here
    setShowLikeConfirm(true);
  };
  
  const confirmLike = () => {
    toast.success(`You liked "${movie.title}"`);
  };
  
  return (
    <>
      <div className="relative w-full h-full rounded overflow-hidden transition-all duration-300 bg-[#222] group hover:scale-[1.03] hover:shadow-lg hover:z-10">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-full object-cover block"
          loading="lazy"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 transition-opacity duration-300 flex flex-col justify-end h-1/2 group-hover:opacity-100">
          <h3 className="text-base font-semibold mb-1 line-clamp-1">{movie.title}</h3>
          
          <div className="flex items-center mb-1">
            <i className="fas fa-star text-netflix-red mr-1"></i>
            {movie.rating}/10
          </div>
          
          <div className="text-sm">{movie.year} • {movie.duration}</div>
          
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={handlePlayClick}
              className="bg-netflix-red border-none rounded px-3 py-1 flex items-center justify-center text-white text-sm font-medium mr-auto transition-colors hover:bg-netflix-red-hover"
            >
              <i className="fas fa-play mr-1"></i> Play
            </button>
            
            <button 
              onClick={isInWatchlist ? handleRemoveFromWatchlist : handleWatchlistClick}
              className="bg-white/20 border-none rounded-full w-[30px] h-[30px] flex items-center justify-center text-white text-xs transition-colors hover:bg-white/30"
              title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              <i className={`fas fa-${isInWatchlist ? 'check' : 'plus'}`}></i>
            </button>
            
            <button 
              onClick={handleLikeClick}
              className="bg-white/20 border-none rounded-full w-[30px] h-[30px] flex items-center justify-center text-white text-xs transition-colors hover:bg-white/30"
              title="Like this title"
            >
              <i className="fas fa-thumbs-up"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {/* Add to Watchlist Modal */}
      <AddToWatchlistModal
        isOpen={showAddToWatchlistModal}
        onClose={() => setShowAddToWatchlistModal(false)}
        movie={{...movie, _id: movieId}}
      />
      
      {/* Like Confirmation */}
      <AlertModal
        isOpen={showLikeConfirm}
        onClose={() => setShowLikeConfirm(false)}
        title="Like this title"
        message={`Did you enjoy watching "${movie.title}"?`}
        type="success"
        confirmLabel="I liked it!"
        showCancel={true}
        onConfirm={confirmLike}
      />
    </>
  );
};

export default MovieCard; 