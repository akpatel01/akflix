import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import movieService from '../services/movieService';
import LoginModal from '../components/LoginModal';
import AlertModal from '../components/AlertModal';
import { useToast } from '../context/ToastContext';
import fallbackMovies from '../data/movies.json'; // Import sample data as fallback
import apiUtils from '../utils/apiUtils';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
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
      try {
        setLoading(true);
        
        // Attempt to fetch from API first
        const response = await apiUtils.get(`/movies/${id}`);
        
        if (response.success && response.data) {
          setContent(response.data);
        } else {
          // If API fails, look for the content in our fallback data
          findInFallbackData();
          setUsingFallbackData(true);
        }
      } catch (error) {
        // On error, look for the content in our fallback data
        findInFallbackData();
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    const findInFallbackData = () => {
      // First try an exact match by ID
      const fallbackMovie = fallbackMovies.find(item => 
        item._id === id || item.id === id
      );
      
      if (fallbackMovie) {
        setContent(fallbackMovie);
      } else {
        // If no direct match, try to find something similar
        // For example, first movie of the same genre or just the first movie in the fallback data
        if (fallbackMovies.length > 0) {
          setContent(fallbackMovies[0]);
        } else {
          setError('Content not found');
        }
      }
    };
    
    fetchContent();
  }, [id]);
  
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
  
  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col justify-center items-center text-white">
        <p className="text-2xl mb-4">{error}</p>
        <button 
          onClick={handleBack}
          className="px-6 py-2 rounded bg-netflix-red hover:bg-netflix-red-hover"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col justify-center items-center text-white">
        <p className="text-2xl mb-4">Content not found</p>
        <button 
          onClick={handleBack}
          className="px-6 py-2 rounded bg-netflix-red hover:bg-netflix-red-hover"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Get video source (if available)
  const videoSource = content.videoUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
  
  return (
    <div className="relative bg-black">
      {usingFallbackData && (
        <div className="bg-yellow-500/20 text-yellow-300 py-2 px-4 text-center">
          <i className="fas fa-info-circle mr-2"></i>
          Using preview data. Some features may be limited.
        </div>
      )}
      
      {/* Video Player */}
      <div className="min-h-screen flex flex-col">
        <div className="relative w-full aspect-video bg-gray-900">
          <VideoPlayer 
            src={videoSource} 
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
                  {content.genres && content.genres.map(genre => (
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
                  
                  {content.trailerUrl && (
                    <a 
                      href={content.trailerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-transparent border border-white text-white px-5 py-2 rounded flex items-center hover:bg-white/10"
                    >
                      <i className="fas fa-film mr-2"></i>
                      Watch Trailer
                    </a>
                  )}
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