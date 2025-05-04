import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for saved login on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        // Get user from local storage first
        setCurrentUser(authService.getUser());
        
        try {
          // Verify token validity and get fresh user data
          const response = await authService.getCurrentUser();
          if (response.success) {
            setCurrentUser(response.user);
          } else {
            // If token is invalid, log user out
            authService.logout();
            setCurrentUser(null);
          }
        } catch (err) {
          console.error('Auth check error:', err);
          // If there's an error, log user out
          authService.logout();
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      setCurrentUser(response.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
      return false;
    }
  };

  // Register function
  const signup = async (userData) => {
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authService.register(userData);
      setCurrentUser(response.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Update profile function
  const updateProfile = async (updates) => {
    if (!currentUser) return false;
    
    try {
      const response = await userService.updateProfile(updates);
      if (response.success) {
        setCurrentUser(response.data);
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError(err.message || 'Profile update failed');
      return false;
    }
  };

  // Direct user data update function (for watchlist, etc.)
  const updateUser = (userData) => {
    if (!userData) return;
    setCurrentUser(userData);
    
    // Update local storage user data
    localStorage.setItem('akflix_user', JSON.stringify(userData));
  };

  // Check if user is an admin
  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    updateUser,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 