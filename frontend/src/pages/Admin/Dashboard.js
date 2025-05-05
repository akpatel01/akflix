import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('movies');

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/');
    }
  }, [currentUser, isAdmin, navigate]);

  // Redirect to movies tab if directly accessing /admin/
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/movies');
    }
  }, [location.pathname, navigate]);

  if (!currentUser || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-netflix-black min-h-screen text-white">
      {/* Admin Header */}
      <div className="bg-black py-4 px-6 flex justify-between items-center shadow-md mb-6">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">{currentUser.email}</span>
          <Link
            to="/"
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
          >
            Exit Dashboard
          </Link>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6">
        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex space-x-4">
            <Link
              to="/admin/movies"
              onClick={() => setActiveTab('movies')}
              className={`py-3 px-4 font-medium transition-colors ${activeTab === 'movies'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              Movies
            </Link>
            <Link
              to="/admin/tv-shows"
              onClick={() => setActiveTab('tv-shows')}
              className={`py-3 px-4 font-medium transition-colors ${activeTab === 'tv-shows'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              TV Shows
            </Link>
            <Link
              to="/admin/genres"
              onClick={() => setActiveTab('genres')}
              className={`py-3 px-4 font-medium transition-colors ${activeTab === 'genres'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              Genres
            </Link>
            <Link
              to="/admin/users"
              onClick={() => setActiveTab('users')}
              className={`py-3 px-4 font-medium transition-colors ${activeTab === 'users'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              Users
            </Link>
            <Link
              to="/admin/stats"
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 font-medium transition-colors ${activeTab === 'stats'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              Statistics
            </Link>
          </div>
        </div>

        {/* Nested Routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard; 