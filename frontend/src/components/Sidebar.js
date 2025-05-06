import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import movieService from '../services/movieService';
import apiUtils from '../utils/apiUtils';

// Simplified MenuItem component with icon-focused design
const MenuItem = ({ to, icon, children, onClick, isActive, showTooltip = true }) => {
  return (
    <NavLink 
      to={to}
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center justify-center transition-all duration-300 relative group w-full h-12
         ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`
      }
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <i className={`${icon} text-xl group-hover:text-white transition-colors duration-300
                      ${isActive ? 'text-white' : ''}`}></i>
        {showTooltip && (
          <span className="absolute left-full ml-4 whitespace-nowrap text-xs font-medium opacity-0 group-hover:opacity-100 
                         pointer-events-none bg-black/90 py-2 px-4 rounded transition-opacity duration-300 z-50">
            {children}
          </span>
        )}
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

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
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
  
  // Get icon for a genre
  const getGenreIcon = (genreName) => {
    return genreIcons[genreName] || defaultIcon;
  };
  
  // Define main navigation items
  const navigationItems = [
    { to: "/", icon: "fas fa-home", label: "Home" },
    { to: "/search", icon: "fas fa-search", label: "Search" },
    { to: "/movies", icon: "fas fa-play", label: "Movies" },
    { to: "/tv-shows", icon: "fas fa-tv", label: "TV Shows" },
    { to: "/categories", icon: "fas fa-th-large", label: "Categories" }
  ];

  // Add My List to main navigation if user is logged in
  if (currentUser) {
    navigationItems.push({ to: "/watchlist", icon: "fas fa-plus", label: "My List" });
  }

  // Define bottom navigation items separately
  const bottomNavigationItems = [];
  if (currentUser) {
    bottomNavigationItems.push({ to: "/profile", icon: "fas fa-user", label: "Profile" });
  }
  if (isAdmin) {
    bottomNavigationItems.push({ to: "/admin", icon: "fas fa-cog", label: "Admin" });
  }
  
  return (
    <aside className="fixed top-0 left-0 h-full w-16 pb-4 z-[900] bg-black hidden lg:flex flex-col items-center">
      <div className="flex flex-col items-center w-full h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center h-16 w-full mb-8">
          <div className="text-white flex items-center justify-center font-bold text-2xl">
            A
          </div>
        </Link>
        
        {/* Main Navigation */}
        <nav className="w-full flex-1 flex flex-col items-center">
          {/* Top Navigation Items */}
          <div className="w-full flex flex-col items-center space-y-8">
            {navigationItems.map((item, index) => (
              <MenuItem key={index} to={item.to} icon={item.icon}>{item.label}</MenuItem>
            ))}
          </div>

          {/* Bottom Navigation Items (Profile & Admin) */}
          <div className="w-full flex flex-col items-center space-y-8 mt-auto mb-8">
            {bottomNavigationItems.map((item, index) => (
              <MenuItem key={index} to={item.to} icon={item.icon}>{item.label}</MenuItem>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;