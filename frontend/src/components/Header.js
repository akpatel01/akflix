import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import movieService from '../services/movieService';

const Header = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
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
      setShowSearchBar(false);
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
    setShowSearchBar(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };
  
  const handleImageError = () => {
    setImgError(true);
  };

  // Toggle search bar on mobile
  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close suggestions dropdown
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
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
    <header className="fixed top-0 left-0 lg:left-16 right-0 h-16 bg-black flex items-center justify-between px-4 sm:px-8 lg:px-12 z-[900]">
      <div className="flex items-center">
        <Link to="/" className="text-white text-[24px] sm:text-[28px] font-bold tracking-wider">
          AKFLIX
        </Link>
      </div>

      <nav className="flex items-center space-x-6">
        {/* Search bar - desktop always visible, mobile conditional */}
        <div className={`relative ${showSearchBar ? 'block absolute top-full left-0 right-0 p-2 bg-black border-t border-white/10' : 'hidden md:flex items-center'}`}>
          <div className="border border-white/30 flex items-center rounded-sm px-2 py-1 bg-black/40 hover:bg-black/80 focus-within:bg-black/80 focus-within:border-white/50 transition-all">
            <i className="fas fa-search text-white/70 text-sm"></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={handleSearch}
              className="py-1 px-2 bg-transparent border-none text-white text-sm focus:outline-none w-[180px]"
            />
            {isSearching && (
              <i className="fas fa-spinner fa-spin text-white/70 text-sm ml-1"></i>
            )}
          </div>
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full right-0 w-[320px] mt-1 bg-black border border-white/20 rounded-sm shadow-lg z-50"
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
                      <div className="text-white font-medium text-sm">{item.title}</div>
                      <div className="text-gray-400 text-xs">{item.year} • {item.genres[0]}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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
                  className="w-8 h-8 rounded-sm object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-8 h-8 rounded-sm bg-[#333] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.username[0].toUpperCase()}
                </div>
              )}
              <i className={`fas fa-caret-${showUserMenu ? 'up' : 'down'} text-white/70 ml-2 text-xs`}></i>
            </div>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div 
                ref={userMenuRef}
                className="absolute top-full right-0 mt-2 w-[200px] bg-black border border-white/20 rounded-sm shadow-lg z-50"
              >
                <ul>
                  <li>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="fas fa-user-circle mr-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/watchlist" 
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="fas fa-list mr-2"></i>
                      My List
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/profile?tab=settings" 
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="fas fa-cog mr-2"></i>
                      Account
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white text-sm"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="text-white bg-netflix-red hover:bg-netflix-red-hover px-4 py-1.5 rounded-sm text-sm font-medium">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header; 