import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import movieService from '../services/movieService';
import apiUtils from '../utils/apiUtils';

// Simplified MenuItem component with icon-focused design
const MenuItem = ({ to, icon, children, onClick, isActive }) => {
  return (
    <NavLink 
      to={to}
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center justify-center h-14 transition-all duration-200 relative group
         ${isActive 
          ? 'text-white' 
          : 'text-gray-500 hover:text-white'}`
      }
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <i className={`${icon} text-xl group-hover:text-white transition-colors
                      ${isActive ? 'text-white' : ''}`}></i>
        <span className="absolute left-full ml-4 whitespace-nowrap text-xs font-medium opacity-0 group-hover:opacity-100 
                       pointer-events-none bg-black/90 py-1.5 px-3 rounded-sm transition-opacity duration-200 z-50">
          {children}
        </span>
      </div>
    </NavLink>
  );
};

// Map genre names to Font Awesome icons
const genreIcons = {
  'Action': 'fas fa-running',
  'Comedy': 'fas fa-laugh',
  'Drama': 'fas fa-theater-masks',
  'Horror': 'fas fa-ghost',
  'Sci-Fi': 'fas fa-robot',
  'Adventure': 'fas fa-mountain',
  'Fantasy': 'fas fa-dragon',
  'Romance': 'fas fa-heart',
  'Animation': 'fas fa-child',
  'Crime': 'fas fa-user-secret',
  'Documentary': 'fas fa-file-video',
  'Family': 'fas fa-users',
  'Thriller': 'fas fa-mask',
  'Mystery': 'fas fa-question-circle',
  'War': 'fas fa-fighter-jet',
  'Western': 'fas fa-hat-cowboy',
  'History': 'fas fa-landmark',
  'Music': 'fas fa-music',
  'Biography': 'fas fa-user-tie'
};

// Default icon for genres without a specific mapping
const defaultIcon = 'fas fa-film';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiUtils.get('/movies/categories');
        
        if (response.success && Array.isArray(response.data)) {
          // Limit to maximum 8 categories for sidebar
          setCategories(response.data.slice(0, 8));
        } else {
          setCategories([]);
        }
      } catch (error) {
        // Silently fail - sidebar will work without categories
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  const handleMenuItemClick = () => {
    // Close sidebar on mobile when a menu item is clicked
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };
  
  // Get icon for a genre
  const getGenreIcon = (genreName) => {
    return genreIcons[genreName] || defaultIcon;
  };
  
  return (
    <>
      <aside 
        className="fixed top-0 left-0 h-full w-16 py-0 z-[900] bg-black flex flex-col items-center"
      >
        <div className="flex flex-col items-center w-full h-full pt-0 pb-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center h-16 w-full">
            <div className="text-white flex items-center justify-center font-bold text-2xl">
              A
            </div>
          </Link>
          
          {/* Main Navigation */}
          <div className="w-full flex flex-col items-center space-y-5 mt-8">
            <MenuItem to="/" icon="fas fa-home" onClick={handleMenuItemClick}>
              Home
            </MenuItem>
            <MenuItem to="/search" icon="fas fa-search" onClick={handleMenuItemClick}>
              Search
            </MenuItem>
            <MenuItem to="/movies" icon="fas fa-play" onClick={handleMenuItemClick}>
              Movies
            </MenuItem>
            <MenuItem to="/tv-shows" icon="fas fa-tv" onClick={handleMenuItemClick}>
              TV Shows
            </MenuItem>
            <MenuItem to="/categories" icon="fas fa-th-large" onClick={handleMenuItemClick}>
              Categories
            </MenuItem>
            <MenuItem to="/watchlist" icon="fas fa-plus" onClick={handleMenuItemClick}>
              My List
            </MenuItem>
          </div>
          
          {/* User profile - at the bottom */}
          <div className="flex flex-col items-center w-full mt-auto">
            {currentUser && (
              <Link to="/profile" className="flex items-center justify-center h-14 w-full relative group">
                <div className="text-gray-500 flex items-center justify-center group-hover:text-white">
                  <i className="fas fa-user text-xl"></i>
                </div>
                <span className="absolute left-full ml-4 whitespace-nowrap text-xs font-medium opacity-0 group-hover:opacity-100 
                              pointer-events-none bg-black/90 py-1.5 px-3 rounded-sm transition-opacity duration-200">
                  {currentUser.displayName || currentUser.email || 'My Profile'}
                </span>
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin" className="flex items-center justify-center h-14 w-full relative group">
                <div className="text-gray-500 flex items-center justify-center group-hover:text-white">
                  <i className="fas fa-cog text-xl"></i>
                </div>
                <span className="absolute left-full ml-4 whitespace-nowrap text-xs font-medium opacity-0 group-hover:opacity-100 
                              pointer-events-none bg-black/90 py-1.5 px-3 rounded-sm transition-opacity duration-200">
                  Admin
                </span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;