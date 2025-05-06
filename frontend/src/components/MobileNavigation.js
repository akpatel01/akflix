import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileNavigation = () => {
  const { currentUser } = useAuth();

  // Define navigation items
  const navigationItems = [
    { to: "/", icon: "fas fa-home", label: "Home" },
    { to: "/search", icon: "fas fa-search", label: "Search" },
    { to: "/movies", icon: "fas fa-play", label: "Movies" },
    { to: "/tv-shows", icon: "fas fa-tv", label: "TV Shows" },
    { to: "/categories", icon: "fas fa-th-large", label: "Categories" },
    ...(currentUser ? [{ to: "/watchlist", icon: "fas fa-plus", label: "My List" }] : [])
  ].filter(Boolean);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black z-[900] border-t border-zinc-800">
      <div className={`grid grid-cols-${navigationItems.length} h-full`}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center text-center px-1 relative
               ${isActive 
                 ? 'text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-netflix-red' 
                 : 'text-gray-500 hover:text-white'}`
            }
          >
            <i className={`${item.icon} text-xl mb-1`}></i>
            <span className="text-[10px] leading-none truncate w-full">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation; 