import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import movieService from '../services/movieService';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  // Clear search query when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchQuery('');
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      
      // If already on search page and query becomes empty, navigate to home
      if (location.pathname === '/search') {
        navigate('/');
      }
      return;
    }
    
    // Cancel any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await movieService.searchMovies(query);
        if (response.success) {
          // Limit to 5 suggestions
          setSuggestions((response.data || []).slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      } finally {
        setIsSearching(false);
      }
      
      // Navigate to search page as user types
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }, 300);
  };
  
  const handleSuggestionClick = (id) => {
    navigate(`/watch/${id}`);
    setShowSuggestions(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };
  
  const handleImageError = () => {
    setImgError(true);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close suggestions dropdown
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      
      // Close user menu dropdown
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset image error if user changes
  useEffect(() => {
    setImgError(false);
  }, [currentUser?.profilePic]);

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-netflix-dark flex items-center justify-between px-[50px] z-[1000] shadow-md">
      <Link to="/" className="text-netflix-red text-[28px] font-bold tracking-wider">AKFLIX</Link>

      <nav className="flex items-center">
        <div className="relative mr-5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="py-2 px-3 pr-9 bg-white/10 border border-white/20 rounded text-white w-[200px] transition-all duration-300 focus:outline-none focus:w-[250px] focus:bg-white/20"
          />
          {isSearching ? (
            <i className="fas fa-spinner fa-spin absolute right-[10px] top-1/2 transform -translate-y-1/2 text-white/70"></i>
          ) : (
            <i className="fas fa-search absolute right-[10px] top-1/2 transform -translate-y-1/2 text-white/70"></i>
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 w-[300px] mt-1 bg-netflix-dark border border-white/20 rounded shadow-lg z-50"
            >
              <ul>
                {suggestions.map((item) => (
                  <li 
                    key={item._id} 
                    className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3"
                    onClick={() => handleSuggestionClick(item._id)}
                  >
                    <img 
                      src={item.poster} 
                      alt={item.title} 
                      className="w-8 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="text-white font-medium">{item.title}</div>
                      <div className="text-gray-400 text-xs">{item.year} • {item.genres[0]}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center">
          {currentUser ? (
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {(currentUser.profilePic && !imgError) ? (
                  <img 
                    src={currentUser.profilePic}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-700"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-netflix-red text-white flex items-center justify-center font-bold mr-2">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-white mr-1">{currentUser.username}</span>
                <i className={`fas fa-caret-${showUserMenu ? 'up' : 'down'} text-white/70`}></i>
              </div>
              
              {/* User dropdown menu */}
              {showUserMenu && (
                <div 
                  ref={userMenuRef}
                  className="absolute top-full right-0 mt-2 w-[200px] bg-netflix-dark border border-white/20 rounded shadow-lg z-50"
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center">
                      {(currentUser.profilePic && !imgError) ? (
                        <img 
                          src={currentUser.profilePic}
                          alt={currentUser.username}
                          className="w-12 h-12 rounded-full mr-3 object-cover border border-gray-700"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-netflix-red text-white flex items-center justify-center text-xl font-bold mr-3">
                          {currentUser.username[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{currentUser.username}</div>
                        <div className="text-gray-400 text-xs">{currentUser.email}</div>
                      </div>
                    </div>
                  </div>
                  <ul>
                    <li>
                      <Link 
                        to="/profile" 
                        className="px-4 py-3 hover:bg-white/10 flex items-center text-white"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fas fa-user mr-3"></i> Profile
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/profile?tab=watchlist" 
                        className="px-4 py-3 hover:bg-white/10 flex items-center text-white"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fas fa-bookmark mr-3"></i> My Watchlist
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/profile?tab=watched" 
                        className="px-4 py-3 hover:bg-white/10 flex items-center text-white"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fas fa-history mr-3"></i> Watch History
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center text-white"
                      >
                        <i className="fas fa-sign-out-alt mr-3"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <Link 
                to="/login" 
                className="text-white mr-4 hover:text-netflix-red"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-netflix-red text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header; 