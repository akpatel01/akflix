import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import movieService from '../../services/movieService';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [allGenres, setAllGenres] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies();
        const moviesData = response.data || [];
        setMovies(moviesData);
        
        // Extract genres and years
        const genres = [...new Set(moviesData.flatMap(movie => movie.genres || []))].sort();
        setAllGenres(genres);
        
        const years = [...new Set(moviesData.map(movie => movie.year))].sort((a, b) => b - a);
        setAllYears(years);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [toast]);

  useEffect(() => {
    let result = [...movies];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply genre filter
    if (genreFilter !== 'all') {
      result = result.filter(movie => 
        movie.genres && movie.genres.includes(genreFilter)
      );
    }
    
    // Apply year filter
    if (yearFilter !== 'all') {
      result = result.filter(movie => movie.year.toString() === yearFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredMovies(result);
  }, [movies, searchQuery, sortField, sortDirection, genreFilter, yearFilter]);

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleDelete = async (movieId) => {
    try {
      await movieService.deleteMovie(movieId);
      setMovies(movies.filter(movie => movie._id !== movieId));
      toast.success('Movie deleted successfully');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Failed to delete movie: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Movie Management</h2>
        <Link 
          to="/admin/movies/new" 
          className="bg-netflix-red hover:bg-netflix-red-hover text-white px-4 py-2 rounded font-medium transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Add New Movie
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>
          
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-400 mb-1">
              Genre
            </label>
            <select
              id="genre"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              <option value="all">All Genres</option>
              {allGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-400 mb-1">
              Year
            </label>
            <select
              id="year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              <option value="all">All Years</option>
              {allYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setGenreFilter('all');
                setYearFilter('all');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Movie Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="text-left py-3 px-4 font-medium text-sm">
                  <button 
                    onClick={() => handleSort('title')}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    Title
                    {sortField === 'title' && (
                      <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm">
                  <button 
                    onClick={() => handleSort('year')}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    Year
                    {sortField === 'year' && (
                      <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm">
                  <button 
                    onClick={() => handleSort('rating')}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    Rating
                    {sortField === 'rating' && (
                      <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ml-1`}></i>
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-300">Genres</th>
                <th className="text-center py-3 px-4 font-medium text-sm text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded mr-3"
                        />
                        <span>{movie.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{movie.year}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-800 text-yellow-400 py-1 px-2 rounded text-xs font-medium">
                        {movie.rating}/10
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {movie.genres?.map(genre => (
                          <span key={genre} className="bg-gray-800 text-gray-300 py-1 px-2 rounded-full text-xs">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/admin/movies/edit/${movie._id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this movie?')) {
                              handleDelete(movie._id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        <Link
                          to={`/admin/movies/view/${movie._id}`}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    {searchQuery || genreFilter !== 'all' || yearFilter !== 'all' ? 
                      'No movies match your filters' : 
                      'No movies found. Add some movies to get started.'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovieManagement; 