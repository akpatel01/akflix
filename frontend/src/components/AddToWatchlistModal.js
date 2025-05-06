import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { useToast } from '../context/ToastContext';

const AddToWatchlistModal = ({ isOpen, onClose, movie }) => {
  const { currentUser, updateUser } = useAuth();
  const toast = useToast();
  
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [remindMe, setRemindMe] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to add to watchlist');
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call API to add to watchlist
      const response = await userService.toggleWatchlist(movie._id);
      
      if (response.success) {
        toast.success(`Added "${movie.title}" to your watchlist`);
        
        // Update user context with new watchlist
        if (updateUser) {
          updateUser({
            ...currentUser,
            watchlist: response.watchlist
          });
        }
        
        // Clear form
        setRating(0);
        setNotes('');
        setRemindMe(false);
        setPriority('normal');
        onClose();
      } else {
        toast.error(response.message || 'Failed to add to watchlist');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-500'}`}
        >
          <i className="fas fa-star"></i>
        </button>
      );
    }
    
    return (
      <div className="flex space-x-2">{stars}</div>
    );
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add to Watchlist: ${movie?.title || 'Movie'}`}
    >
      <div className="flex mb-4">
        <div className="w-1/3">
          <img 
            src={movie?.poster} 
            alt={movie?.title} 
            className="w-full h-auto rounded shadow-lg"
          />
        </div>
        <div className="w-2/3 pl-4">
          <h3 className="text-xl font-bold text-white">{movie?.title}</h3>
          <p className="text-gray-400 mb-2">{movie?.year} • {movie?.genres?.join(', ')}</p>
          <div className="flex items-center mb-2">
            <i className="fas fa-star text-yellow-400 mr-1"></i>
            <span>{movie?.rating}/10</span>
          </div>
          <p className="text-sm text-gray-300 line-clamp-3">{movie?.description || 'No description available.'}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Your Rating</label>
          {renderStars()}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded focus:outline-none"
            rows={3}
            placeholder="Add your personal notes about this title..."
          ></textarea>
        </div>
        
        <div className="flex justify-between mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={remindMe}
              onChange={() => setRemindMe(!remindMe)}
              className="mr-2"
            />
            <span className="text-gray-300">Remind me later</span>
          </label>
          
          <div>
            <label className="text-gray-300 mr-2">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-gray-800 text-white p-1 rounded focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-netflix-red-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add to Watchlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddToWatchlistModal; 