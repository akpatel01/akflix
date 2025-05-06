import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Player from './pages/Player';
import GenrePage from './pages/GenrePage';
import Watchlist from './pages/Watchlist';
import Watched from './pages/Watched';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminSetup from './pages/AdminSetup';
import Dashboard from './pages/Admin/Dashboard';
import MovieManagement from './pages/Admin/MovieManagement';
import MovieForm from './pages/Admin/MovieForm';
import MovieDetail from './pages/Admin/MovieDetail';
import ImportMovies from './pages/Admin/ImportMovies';
import UserManagement from './pages/Admin/UserManagement';
import Statistics from './pages/Admin/Statistics';
import GenreManagement from './pages/Admin/GenreManagement';
import CategoriesPage from './pages/CategoriesPage';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';

// Admin route wrapper that checks for admin access
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser || !isAdmin) {
    return <Home />;
  }
  
  return children;
};

// Simple page layout component that hides header and sidebar
const CleanLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <>
      {/* Regular Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv-shows" element={<TVShows />} />
        <Route path="/watch/:id" element={<Player />} />
        <Route path="/genre/:genreId" element={<GenrePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/watchlist" element={currentUser ? <Watchlist /> : <Navigate to="/login" />} />
        <Route path="/watched" element={currentUser ? <Watched /> : <Navigate to="/login" />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <Routes>
                <Route path="/" element={<Dashboard />}>
                  <Route index element={<Navigate to="/admin/movies" replace />} />
                  <Route path="movies" element={<MovieManagement />} />
                  <Route path="movies/new" element={<MovieForm />} />
                  <Route path="movies/edit/:id" element={<MovieForm />} />
                  <Route path="movies/view/:id" element={<MovieDetail />} />
                  <Route path="movies/import" element={<ImportMovies />} />
                  <Route path="tv-shows" element={<div className="p-6 text-center text-gray-400">TV Show management coming soon</div>} />
                  <Route path="genres" element={<GenreManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="stats" element={<Statistics />} />
                </Route>
              </Routes>
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdminSetupRoute = window.location.pathname === '/admin-setup';
  const location = useLocation();

  // Close sidebar when route changes (especially on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <AuthProvider>
      <ToastProvider>
        {isAdminSetupRoute ? (
          <CleanLayout>
            <AdminSetup />
          </CleanLayout>
        ) : (
          <>
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex h-screen">
              {/* Sidebar - hidden on mobile, visible on desktop */}
              <Sidebar />
              
              {/* Main content */}
              <main className="w-full flex-1 pt-16 pb-20 lg:ml-16 lg:pb-0 overflow-y-auto bg-black">
                <div className="w-full">
                  <AppContent />
                </div>
              </main>
            </div>
            
            {/* Mobile Navigation */}
            <MobileNavigation />
          </>
        )}
      </ToastProvider>
    </AuthProvider>
  );
}

export default App; 