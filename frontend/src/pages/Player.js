import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import movieService from '../services/movieService';
import LoginModal from '../components/LoginModal';
import AlertModal from '../components/AlertModal';
import { useToast } from '../context/ToastContext';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, updateUser } = useAuth();
  const toast = useToast();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWatchlistConfirm, setShowWatchlistConfirm] = useState(false);
  const [hasMarkedAsWatched, setHasMarkedAsWatched] = useState(false);
  
  const handleUpdateWatched = useCallback(async (movieId, movieTitle) => {
    if (!currentUser) return;
    
    const isWatched = userService.isWatched(movieId);
    
    if (!isWatched) {
      try {
        const watchedResponse = await userService.toggleWatched(movieId);
        
        if (watchedResponse.success) {
          // Update user context with new watched list
          if (updateUser) {
            updateUser({
              ...currentUser,
              watched: watchedResponse.watched
            });
          }
          
          // Show toast notification
          toast.info(`"${movieTitle}" added to your watch history`, { autoClose: 2000 });
        }
      } catch (err) {
        console.error('Error updating watched status:', err);
      }
    }
  }, [currentUser, updateUser, toast]);
  
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await movieService.getMovie(id);
        
        if (response.success) {
          setContent(response.data);
          
          // Increment view count via the API
          await movieService.incrementViewCount(id);
          
          // Mark as watched if user is logged in (will be handled in a separate effect)
          setHasMarkedAsWatched(false);
        } else {
          setError(response.message || 'Failed to load content');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id]); // Only re-fetch when the ID changes
  
  // Separate effect for updating watched status
  useEffect(() => {
    if (content && currentUser && !hasMarkedAsWatched) {
      handleUpdateWatched(id, content.title);
      setHasMarkedAsWatched(true);
    }
  }, [content, currentUser, id, hasMarkedAsWatched, handleUpdateWatched]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleAddToWatchlist = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const response = await userService.toggleWatchlist(id);
      
      if (response.success) {
        const isAdded = response.watchlist.includes(id);
        
        // Update user context with new watchlist
        if (updateUser) {
          updateUser({
            ...currentUser,
            watchlist: response.watchlist
          });
        }
        
        // Show toast notification
        if (isAdded) {
          toast.success(`"${content.title}" added to your watchlist`);
        } else {
          toast.info(`"${content.title}" removed from your watchlist`);
        }
      } else {
        toast.error(response.message || 'Failed to update watchlist');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      console.error(err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-red-500 mb-4">Error loading content</p>
        <p className="text-gray-400">{error}</p>
        <button 
          onClick={handleBack}
          className="mt-4 bg-netflix-red text-white px-5 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-400">Content not found</p>
        <button 
          onClick={handleBack}
          className="mt-4 bg-netflix-red text-white px-5 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="relative bg-black">
      {/* Video Player */}
      <div className="min-h-screen flex flex-col">
        <div className="relative w-full aspect-video bg-gray-900">
          <VideoPlayer 
            src={content.videoUrl} 
            poster={content.backdrop} 
            title={content.title}
          />
          
          <button 
            onClick={handleBack}
            className="absolute top-4 left-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 z-20"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:w-1/4">
                <img 
                  src={content.poster} 
                  alt={content.title} 
                  className="w-full rounded shadow-lg"
                />
              </div>
              
              <div className="md:w-3/4">
                <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-gray-400">{content.year}</span>
                  <span className="text-gray-400">{content.duration}</span>
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-500 mr-1"></i>
                    <span>{content.rating}/10</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {content.genres.map(genre => (
                    <span 
                      key={genre} 
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6">{content.description}</p>
                
                <div className="mb-6">
                  {content.director && (
                    <p className="mb-1">
                      <span className="text-gray-400">Director: </span>
                      <span>{content.director}</span>
                    </p>
                  )}
                  
                  {content.actors && content.actors.length > 0 && (
                    <p>
                      <span className="text-gray-400">Cast: </span>
                      <span>{content.actors.join(', ')}</span>
                    </p>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToWatchlist}
                    className="bg-white text-black px-5 py-2 rounded flex items-center"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add to My List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default Player; 