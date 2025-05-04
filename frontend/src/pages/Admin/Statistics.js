import React, { useState, useEffect } from 'react';
import movieService from '../../services/movieService';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const Statistics = () => {
  const [stats, setStats] = useState({
    movies: {
      total: 0,
      featured: 0,
      byGenre: [],
      mostViewed: [],
      loading: true,
      error: null
    },
    users: {
      total: 0,
      admins: 0,
      topWatchlists: [],
      loading: true,
      error: null
    }
  });
  
  const toast = useToast();
  
  useEffect(() => {
    fetchMovieStats();
    fetchUserStats();
  }, []);
  
  const fetchMovieStats = async () => {
    try {
      const response = await movieService.getStats();
      if (response.success) {
        setStats(prev => ({
          ...prev,
          movies: {
            ...response.data,
            loading: false,
            error: null
          }
        }));
      } else {
        setStats(prev => ({
          ...prev,
          movies: {
            ...prev.movies,
            loading: false,
            error: response.message || 'Failed to load movie statistics'
          }
        }));
      }
    } catch (err) {
      setStats(prev => ({
        ...prev,
        movies: {
          ...prev.movies,
          loading: false,
          error: err.message || 'An error occurred'
        }
      }));
      console.error(err);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      const response = await userService.getStats();
      if (response.success) {
        setStats(prev => ({
          ...prev,
          users: {
            ...response.data,
            loading: false,
            error: null
          }
        }));
      } else {
        setStats(prev => ({
          ...prev,
          users: {
            ...prev.users,
            loading: false,
            error: response.message || 'Failed to load user statistics'
          }
        }));
      }
    } catch (err) {
      setStats(prev => ({
        ...prev,
        users: {
          ...prev.users,
          loading: false,
          error: err.message || 'An error occurred'
        }
      }));
      console.error(err);
    }
  };
  
  const refreshStats = () => {
    setStats(prev => ({
      movies: {
        ...prev.movies,
        loading: true,
        error: null
      },
      users: {
        ...prev.users,
        loading: true,
        error: null
      }
    }));
    
    fetchMovieStats();
    fetchUserStats();
    toast.success('Statistics refreshed');
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard Statistics</h1>
        <button 
          onClick={refreshStats} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={stats.movies.loading || stats.users.loading}
        >
          {stats.movies.loading || stats.users.loading ? 'Loading...' : 'Refresh Stats'}
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Movie Stats */}
        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Movie Statistics</h2>
          
          {stats.movies.error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {stats.movies.error}
            </div>
          )}
          
          {stats.movies.loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-netflix-red"></div>
              <p className="mt-2 text-gray-400">Loading movie stats...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Total Movies</h3>
                  <p className="text-white text-2xl font-bold">{stats.movies.total}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Featured Movies</h3>
                  <p className="text-white text-2xl font-bold">{stats.movies.featured}</p>
                </div>
              </div>
              
              {/* Genres Distribution */}
              <div>
                <h3 className="text-white text-lg mb-3">Genres Distribution</h3>
                {stats.movies.byGenre && stats.movies.byGenre.length > 0 ? (
                  <div className="space-y-2">
                    {stats.movies.byGenre.map(genre => (
                      <div key={genre.name} className="flex items-center">
                        <div className="w-32 text-sm text-gray-300">{genre.name}</div>
                        <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-netflix-red"
                            style={{ width: `${(genre.count / stats.movies.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-sm text-gray-300 ml-2">{genre.count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No genre data available</p>
                )}
              </div>
              
              {/* Most Viewed Movies */}
              <div>
                <h3 className="text-white text-lg mb-3">Most Viewed Movies</h3>
                {stats.movies.mostViewed && stats.movies.mostViewed.length > 0 ? (
                  <div className="space-y-2">
                    {stats.movies.mostViewed.map(movie => (
                      <div key={movie._id} className="flex items-center bg-gray-800 p-2 rounded">
                        <div className="h-10 w-16 overflow-hidden rounded flex-shrink-0 mr-3">
                          <img 
                            src={movie.poster} 
                            alt={movie.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{movie.title}</p>
                          <p className="text-gray-400 text-xs">{movie.year}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">{movie.viewCount}</p>
                          <p className="text-gray-400 text-xs">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No view data available</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Stats */}
        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">User Statistics</h2>
          
          {stats.users.error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {stats.users.error}
            </div>
          )}
          
          {stats.users.loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-netflix-red"></div>
              <p className="mt-2 text-gray-400">Loading user stats...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Total Users</h3>
                  <p className="text-white text-2xl font-bold">{stats.users.total}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Admin Users</h3>
                  <p className="text-white text-2xl font-bold">{stats.users.admins}</p>
                </div>
              </div>
              
              {/* Users with Largest Watchlists */}
              <div>
                <h3 className="text-white text-lg mb-3">Top User Watchlists</h3>
                {stats.users.topWatchlists && stats.users.topWatchlists.length > 0 ? (
                  <div className="space-y-2">
                    {stats.users.topWatchlists.map(user => (
                      <div key={user._id} className="flex items-center bg-gray-800 p-2 rounded">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0 mr-3">
                          {user.profilePic ? (
                            <img 
                              src={user.profilePic} 
                              alt={user.username} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{user.username}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">{user.watchlistCount}</p>
                          <p className="text-gray-400 text-xs">items</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No watchlist data available</p>
                )}
              </div>
              
              {/* Recent User Activity */}
              <div>
                <h3 className="text-white text-lg mb-3">Recently Active Users</h3>
                {stats.users.recentlyActive && stats.users.recentlyActive.length > 0 ? (
                  <div className="space-y-2">
                    {stats.users.recentlyActive.map(user => (
                      <div key={user._id} className="flex items-center bg-gray-800 p-2 rounded">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0 mr-3">
                          {user.profilePic ? (
                            <img 
                              src={user.profilePic} 
                              alt={user.username} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{user.username}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-xs">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No recent activity data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics; 