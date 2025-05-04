import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import MovieSlider from '../components/MovieSlider';
import movieService from '../services/movieService';

const Home = () => {
  const [movies, setMovies] = useState({
    featured: [],
    trending: [],
    topRated: [],
    newReleases: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        console.log('Fetching movies for Home page...');
        
        // Fetch featured movies
        const featuredResponse = await movieService.getFeaturedMovies();
        console.log('Featured movies response:', featuredResponse);
        
        // Fetch trending movies (using a sort parameter)
        const trendingResponse = await movieService.getMovies({ 
          sort: 'viewCount:desc',
          limit: 8
        });
        
        // Fetch top rated movies
        const topRatedResponse = await movieService.getMovies({ 
          sort: 'rating:desc',
          limit: 8
        });
        
        // Fetch new releases (most recently added)
        const newReleasesResponse = await movieService.getMovies({ 
          sort: 'createdAt:desc',
          limit: 8
        });

        // Make sure we have valid data arrays
        const featured = featuredResponse.success && Array.isArray(featuredResponse.data) 
          ? featuredResponse.data 
          : [];
          
        // Log the first featured movie to check its structure
        if (featured.length > 0) {
          console.log('First featured movie:', featured[0]);
          console.log('Backdrop URL:', featured[0].backdrop);
        }

        setMovies({
          featured,
          trending: trendingResponse.success ? trendingResponse.data : [],
          topRated: topRatedResponse.success ? topRatedResponse.data : [],
          newReleases: newReleasesResponse.success ? newReleasesResponse.data : [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading movies:', error);
        setMovies(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load movies'
        }));
      }
    };

    fetchMovies();
  }, []);

  if (movies.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  if (movies.error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-500 mb-4">Error loading content</p>
        <p className="text-gray-400">{movies.error}</p>
      </div>
    );
  }

  return (
    <div className="pb-[50px]">
      {movies.featured.length > 0 && <Banner featuredMovies={movies.featured} />}
      
      {movies.trending.length > 0 && <MovieSlider title="Trending Now" movies={movies.trending} />}
      {movies.topRated.length > 0 && <MovieSlider title="Top Rated" movies={movies.topRated} />}
      {movies.newReleases.length > 0 && <MovieSlider title="New Releases" movies={movies.newReleases} />}
    </div>
  );
};

export default Home; 