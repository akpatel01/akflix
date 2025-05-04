import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MenuItem = ({ to, icon, children }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `flex items-center py-3 px-5 text-base text-netflix-light-gray transition-all duration-200 relative hover:bg-white/5 hover:text-white
        ${isActive ? 'bg-netflix-red/15 text-white before:content-[""] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-netflix-red' : ''}`
      }
    >
      <i className={`${icon} mr-[15px] w-5 text-center`}></i>
      {children}
    </NavLink>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  
  return (
    <aside className="fixed top-[60px] left-0 w-[240px] h-[calc(100vh-60px)] bg-netflix-dark border-r border-white/10 py-5 z-[900] overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm text-netflix-gray uppercase mb-2.5 px-5">Menu</h3>
        <MenuItem to="/" icon="fas fa-home">
          Home
        </MenuItem>
        <MenuItem to="/movies" icon="fas fa-film">
          Movies
        </MenuItem>
        <MenuItem to="/tv-shows" icon="fas fa-tv">
          TV Shows
        </MenuItem>
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-netflix-gray uppercase mb-2.5 px-5">Library</h3>
        <MenuItem to="/watchlist" icon="fas fa-list">
          My Watchlist
        </MenuItem>
        <MenuItem to="/watched" icon="fas fa-check-circle">
          Watched
        </MenuItem>
        {isAdmin && (
          <MenuItem to="/admin" icon="fas fa-user-shield">
            Admin Dashboard
          </MenuItem>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-netflix-gray uppercase mb-2.5 px-5">Categories</h3>
        <MenuItem to="/genre/action" icon="fas fa-running">
          Action
        </MenuItem>
        <MenuItem to="/genre/comedy" icon="fas fa-laugh">
          Comedy
        </MenuItem>
        <MenuItem to="/genre/drama" icon="fas fa-theater-masks">
          Drama
        </MenuItem>
        <MenuItem to="/genre/horror" icon="fas fa-ghost">
          Horror
        </MenuItem>
        <MenuItem to="/genre/sci-fi" icon="fas fa-robot">
          Sci-Fi
        </MenuItem>
      </div>
    </aside>
  );
};

export default Sidebar; 