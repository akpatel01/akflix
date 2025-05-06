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
        `flex items-center justify-center transition-all duration-200 relative group
         ${isActive 
          ? 'text-white' 
          : 'text-gray-500 hover:text-white'}`
      }
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <i className={`${icon} text-xl group-hover:text-white transition-colors
                      ${isActive ? 'text-white' : ''}`}></i>
        {showTooltip && (
          <span className="absolute left-full ml-4 whitespace-nowrap text-xs font-medium opacity-0 group-hover:opacity-100 
                         pointer-events-none bg-black/90 py-1.5 px-3 rounded-sm transition-opacity duration-200 z-50">
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

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
  
  // Define navigation items
  const navigationItems = [
    { to: "/", icon: "fas fa-home", label: "Home" },
    { to: "/search", icon: "fas fa-search", label: "Search" },
    { to: "/movies", icon: "fas fa-play", label: "Movies" },
    { to: "/tv-shows", icon: "fas fa-tv", label: "TV Shows" },
    { to: "/categories", icon: "fas fa-th-large", label: "Categories" }
  ];

  // Add conditional items
  if (currentUser) {
    navigationItems.push({ to: "/watchlist", icon: "fas fa-plus", label: "My List" });
    navigationItems.push({ to: "/profile", icon: "fas fa-user", label: "Profile" });
  }
  if (isAdmin) {
    navigationItems.push({ to: "/admin", icon: "fas fa-cog", label: "Admin" });
  }
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-16 py-0 z-[900] bg-black hidden lg:flex flex-col items-center">
        <div className="flex flex-col items-center w-full h-full pt-0 pb-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center h-16 w-full">
            <div className="text-white flex items-center justify-center font-bold text-2xl">
              A
            </div>
          </Link>
          
          {/* Main Navigation */}
          <div className="w-full flex flex-col items-center space-y-5 mt-8">
            {navigationItems.map((item) => (
              <MenuItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                onClick={handleMenuItemClick}
              >
                {item.label}
              </MenuItem>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black z-[900] lg:hidden">
        <div className="grid grid-cols-8 h-full">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleMenuItemClick}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center text-center px-0.5
                 ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`
              }
            >
              <i className={`${item.icon} text-[16px] mb-0.5`}></i>
              <span className="text-[8px] leading-tight truncate w-full">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;