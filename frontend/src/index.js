import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import backdropUtils from './utils/updateBackdrops';
import movieImportUtils from './utils/importMoviesData';
import backdropChecker from './utils/checkBackdropUrls';

// Make util functions available in the console for debugging
if (process.env.NODE_ENV !== 'production') {
  // These are already added to window object in the utils file
  
  // Log help message
  console.log(`
  AKFLIX Development Utilities Available:
  • checkBackdrops() - Find movies with missing backdrop URLs
  • updateMovieBackdrop(movieId, backdropUrl) - Update a specific movie's backdrop
  • batchUpdateBackdrops(idUrlMap) - Update multiple movie backdrops at once
  • importMoviesFromJson() - Import movies from JSON data file
  • updateExistingMovies() - Update existing movies with data from JSON file
  • moviesData - Access the raw movies data object
  • checkBackdropUrls() - Check if backdrop URLs in the JSON file are valid
  `);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 