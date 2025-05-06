import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import movieService from '../services/movieService';
import { useToast } from '../context/ToastContext';
import AlertModal from '../components/AlertModal';

// Preset profile picture options
const profilePicOptions = [
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=48',
  'https://i.pravatar.cc/150?img=65'
];

const Profile = () => {
  const { currentUser, logout, updateProfile, updateUser, isAdmin } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profilePic: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [watchedItems, setWatchedItems] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // Populate form data from current user
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        profilePic: currentUser.profilePic || '',
      });
    }
  }, [currentUser]);
  
  // Fetch watchlist and watched content when activeTab changes or user changes
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!currentUser) return;
      
      if (activeTab === 'watchlist' || activeTab === 'watched') {
        setIsContentLoading(true);
        
        try {
          const idList = activeTab === 'watchlist' 
            ? currentUser.watchlist || [] 
            : currentUser.watched || [];
          
          if (idList.length === 0) {
            setWatchlistItems([]);
            setWatchedItems([]);
            setIsContentLoading(false);
            return;
          }
          
          // Fetch movie details for each ID
          const contentItems = [];
          
          for (const id of idList) {
            try {
              const response = await movieService.getMovie(id);
              if (response.success) {
                contentItems.push(response.data);
              }
            } catch (err) {
              console.error(`Error fetching movie ${id}:`, err);
            }
          }
          
          if (activeTab === 'watchlist') {
            setWatchlistItems(contentItems);
          } else {
            setWatchedItems(contentItems);
          }
        } catch (err) {
          console.error('Error fetching content:', err);
        } finally {
          setIsContentLoading(false);
        }
      }
    };
    
    fetchUserContent();
  }, [activeTab, currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleProfilePicSelect = (picUrl) => {
    setFormData({
      ...formData,
      profilePic: picUrl
    });
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const success = await updateProfile(formData);
      
      if (success) {
        setSuccessMessage('Profile updated successfully');
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await userService.changePassword(passwordData);
      
      if (response.success) {
        setSuccessMessage('Password updated successfully');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message || 'Failed to update password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveFromWatchlist = async (id) => {
    try {
      const response = await userService.toggleWatchlist(id);
      
      if (response.success) {
        // Remove from local state
        const updatedWatchlist = watchlistItems.filter(item => item._id !== id);
        setWatchlistItems(updatedWatchlist);
        
        // Find the removed item for the toast
        const removedItem = watchlistItems.find(item => item._id === id);
        
        // Update user context
        if (updateUser) {
          updateUser({
            ...currentUser,
            watchlist: response.watchlist
          });
        }
        
        if (removedItem) {
          toast.info(`Removed "${removedItem.title}" from your watchlist`);
        }
      } else {
        toast.error(response.message || 'Failed to update watchlist');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      console.error(err);
    }
  };
  
  const handleRemoveFromWatched = async (id) => {
    try {
      const response = await userService.toggleWatched(id);
      
      if (response.success) {
        // Remove from local state
        const updatedWatched = watchedItems.filter(item => item._id !== id);
        setWatchedItems(updatedWatched);
        
        // Find the removed item for the toast
        const removedItem = watchedItems.find(item => item._id === id);
        
        // Update user context
        if (updateUser) {
          updateUser({
            ...currentUser,
            watched: response.watched
          });
        }
        
        if (removedItem) {
          toast.info(`Removed "${removedItem.title}" from your watch history`);
        }
      } else {
        toast.error(response.message || 'Failed to update watch history');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      console.error(err);
    }
  };
  
  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!currentUser) {
    return null; // Or a loading spinner
  }
  
  return (
    <div className="min-h-screen bg-zinc-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-800 shadow rounded-lg">
          {/* Profile Navigation Tabs */}
          <div className="border-b border-zinc-700">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base flex-shrink-0`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base flex-shrink-0`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`${
                  activeTab === 'watchlist'
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base flex-shrink-0`}
              >
                My List
              </button>
              <button
                onClick={() => setActiveTab('watched')}
                className={`${
                  activeTab === 'watched'
                    ? 'border-netflix-red text-netflix-red'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base flex-shrink-0`}
              >
                Watch History
              </button>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300
                           whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base
                           flex items-center gap-2 flex-shrink-0"
                >
                  <i className="fas fa-cog"></i>
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-3">
                <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-4 border-netflix-red transition-all hover:scale-105">
                      {formData.profilePic ? (
                        <img 
                          src={formData.profilePic} 
                          alt={formData.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fas fa-user text-4xl"></i>
                        </div>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-bold">{formData.username}</h2>
                    <p className="text-gray-400">{formData.email}</p>
                    {currentUser.role === 'admin' && (
                      <span className="px-2 py-1 bg-netflix-red rounded text-xs mt-2">Admin</span>
                    )}
                  </div>
                  <div className="mt-6 space-y-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === 'profile' 
                          ? 'bg-netflix-red text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === 'security' 
                          ? 'bg-netflix-red text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      Security
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('watchlist')}
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === 'watchlist' 
                          ? 'bg-netflix-red text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      My Watchlist
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('watched')}
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === 'watched' 
                          ? 'bg-netflix-red text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      Watch History
                    </button>
                    
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-span-12 md:col-span-9">
                <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
                  {error && (
                    <div className="bg-red-600 text-white p-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="bg-green-600 text-white p-3 rounded mb-4">
                      {successMessage}
                    </div>
                  )}
                  
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                      <form onSubmit={handleProfileUpdate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="username" className="block text-gray-300 mb-1">Username</label>
                              <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 text-white p-3 rounded"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-gray-300 mb-1">Email</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800 text-white p-3 rounded"
                                required
                              />
                            </div>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-4">
                            <label className="block text-gray-300 mb-3 text-center">Choose Profile Picture</label>
                            <div className="grid grid-cols-4 gap-2 max-w-[200px] mx-auto">
                              {profilePicOptions.map((pic, index) => (
                                <div 
                                  key={index}
                                  onClick={() => handleProfilePicSelect(pic)}
                                  className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer transition-all ${
                                    formData.profilePic === pic ? 'ring-2 ring-netflix-red scale-110' : 'opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  {pic ? (
                                    <img 
                                      src={pic} 
                                      alt={`Profile option ${index + 1}`} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                                      <i className="fas fa-user"></i>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            type="submit"
                            className="bg-netflix-red text-white px-6 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Security</h2>
                      
                      <form onSubmit={handlePasswordUpdate}>
                        <div className="mb-4">
                          <label htmlFor="currentPassword" className="block text-gray-300 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full bg-gray-800 text-white p-3 rounded"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="newPassword" className="block text-gray-300 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full bg-gray-800 text-white p-3 rounded"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="confirmPassword" className="block text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full bg-gray-800 text-white p-3 rounded"
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="bg-netflix-red text-white px-6 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {activeTab === 'watchlist' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">My Watchlist</h2>
                      
                      {isContentLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
                        </div>
                      ) : watchlistItems.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400">Your watchlist is empty.</p>
                          <p className="text-gray-500 mt-2">
                            Add movies or TV shows by clicking the + button on any title.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {watchlistItems.map((item) => (
                            <div
                              key={item._id}
                              className="bg-gray-800 rounded-lg p-3 flex items-start"
                            >
                              <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden mr-3">
                                <img 
                                  src={item.poster} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-white font-bold">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.year} • {item.duration}</p>
                                <p className="text-gray-400 text-sm mb-2">{item.genres.join(', ')}</p>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => navigate(`/watch/${item._id}`)}
                                    className="text-white bg-netflix-red px-3 py-1 rounded text-sm hover:bg-red-700"
                                  >
                                    <i className="fas fa-play mr-1"></i> Play
                                  </button>
                                  
                                  <button
                                    onClick={() => handleRemoveFromWatchlist(item._id)}
                                    className="text-white bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
                                  >
                                    <i className="fas fa-times mr-1"></i> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'watched' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Watch History</h2>
                      
                      {isContentLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
                        </div>
                      ) : watchedItems.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400">Your watch history is empty.</p>
                          <p className="text-gray-500 mt-2">
                            Movies and TV shows you've watched will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {watchedItems.map((item) => (
                            <div
                              key={item._id}
                              className="bg-gray-800 rounded-lg p-3 flex items-start"
                            >
                              <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden mr-3">
                                <img 
                                  src={item.poster} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-white font-bold">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.year} • {item.duration}</p>
                                <p className="text-gray-400 text-sm mb-2">{item.genres.join(', ')}</p>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => navigate(`/watch/${item._id}`)}
                                    className="text-white bg-netflix-red px-3 py-1 rounded text-sm hover:bg-red-700"
                                  >
                                    <i className="fas fa-play mr-1"></i> Play Again
                                  </button>
                                  
                                  <button
                                    onClick={() => handleRemoveFromWatched(item._id)}
                                    className="text-white bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
                                  >
                                    <i className="fas fa-times mr-1"></i> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AlertModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutConfirm(false)}
        showCancel={true}
        type="warning"
      />
    </div>
  );
};

export default Profile; 