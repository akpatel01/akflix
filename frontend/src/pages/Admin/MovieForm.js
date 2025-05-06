import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import movieService from '../../services/movieService';

const initialFormState = {
  title: '',
  description: '',
  year: new Date().getFullYear(),
  duration: '',
  rating: 7.0,
  genres: [],
  director: '',
  actors: [],
  poster: '',
  backdrop: '',
  videoUrl: ''
};

const MovieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [newActor, setNewActor] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [posterPreview, setPosterPreview] = useState('');
  const [backdropPreview, setBackdropPreview] = useState('');
  const [allGenres, setAllGenres] = useState([]);

  // Fetch all available genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await movieService.getGenres();
        setAllGenres(genres);
      } catch (error) {
        // Fallback to empty array if fetch fails
        setAllGenres([]);
      }
    };
    
    fetchGenres();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      
      const fetchMovie = async () => {
        setLoading(true);
        try {
          const response = await movieService.getMovie(id);
          
          if (response.success) {
            const movie = response.data;
            setFormData({
              ...movie,
              actors: movie.actors || [],
            });
            setPosterPreview(movie.poster);
            setBackdropPreview(movie.backdrop);
          } else {
            toast.error('Movie not found');
            navigate('/admin/movies');
          }
        } catch (error) {
          toast.error('Failed to fetch movie: ' + (error.message || 'Unknown error'));
          navigate('/admin/movies');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMovie();
    }
  }, [id, navigate, toast]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || !formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description || !formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.duration || !formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (formData.genres.length === 0) newErrors.genres = 'At least one genre is required';
    if (!formData.poster || !formData.poster.trim()) newErrors.poster = 'Poster URL is required';
    if (!formData.backdrop || !formData.backdrop.trim()) newErrors.backdrop = 'Backdrop URL is required';
    
    // Validate URLs for poster and backdrop
    if (formData.poster && !isValidUrl(formData.poster)) {
      newErrors.poster = 'Please enter a valid URL for the poster image';
    }
    
    if (formData.backdrop && !isValidUrl(formData.backdrop)) {
      newErrors.backdrop = 'Please enter a valid URL for the backdrop image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Preview for image URLs
    if (name === 'poster') setPosterPreview(value);
    if (name === 'backdrop') setBackdropPreview(value);
  };

  const handleGenreChange = (e) => {
    const genre = e.target.value;
    if (genre && !formData.genres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
  };

  const handleAddCustomGenre = () => {
    if (newGenre && newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const handleAddActor = () => {
    if (newActor && newActor.trim() && !formData.actors.includes(newActor.trim())) {
      setFormData(prev => ({
        ...prev,
        actors: [...prev.actors, newActor.trim()]
      }));
      setNewActor('');
    }
  };

  const handleRemoveActor = (actor) => {
    setFormData(prev => ({
      ...prev,
      actors: prev.actors.filter(a => a !== actor)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await movieService.updateMovie(id, formData);
        if (response.success) {
          toast.success('Movie updated successfully');
          navigate('/admin/movies');
        } else {
          toast.error(response.message || 'Failed to update movie');
        }
      } else {
        response = await movieService.createMovie(formData);
        if (response.success) {
          toast.success('Movie added successfully');
          navigate('/admin/movies');
        } else {
          toast.error(response.message || 'Failed to add movie');
        }
      }
    } catch (error) {
      toast.error('An error occurred: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{isEditMode ? 'Edit Movie' : 'Add New Movie'}</h2>
        <button
          onClick={() => navigate('/admin/movies')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red ${errors.title ? 'border border-red-500' : ''}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max="2099"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red ${errors.year ? 'border border-red-500' : ''}`}
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  placeholder="e.g. 120 min"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red ${errors.duration ? 'border border-red-500' : ''}`}
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="director" className="block text-sm font-medium text-gray-300 mb-1">
                Director
              </label>
              <input
                id="director"
                name="director"
                type="text"
                value={formData.director}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>
            
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
                Rating
              </label>
              <div className="flex items-center">
                <input
                  id="rating"
                  name="rating"
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                />
                <span className="ml-2 w-12 text-center text-white font-semibold">
                  {parseFloat(formData.rating).toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className={`w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red ${errors.description ? 'border border-red-500' : ''}`}
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Genres <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <select
                    onChange={handleGenreChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    value=""
                  >
                    <option value="" disabled>Select genre</option>
                    {allGenres.filter(genre => !formData.genres.includes(genre)).map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Custom genre"
                    className="w-full bg-gray-800 text-white rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGenre}
                    className="bg-gray-700 hover:bg-gray-600 px-3 rounded-r"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.genres.map(genre => (
                  <div key={genre} className="bg-gray-800 text-white rounded-full px-3 py-1 text-sm flex items-center">
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(genre)}
                      className="ml-1.5 text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              {errors.genres && <p className="text-red-500 text-xs mt-1">{errors.genres}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cast
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  placeholder="Actor name"
                  className="w-full bg-gray-800 text-white rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                />
                <button
                  type="button"
                  onClick={handleAddActor}
                  className="bg-gray-700 hover:bg-gray-600 px-3 rounded-r"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.actors.map(actor => (
                  <div key={actor} className="bg-gray-800 text-white rounded-full px-3 py-1 text-sm flex items-center">
                    {actor}
                    <button
                      type="button"
                      onClick={() => handleRemoveActor(actor)}
                      className="ml-1.5 text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="poster" className="block text-sm font-medium text-gray-300 mb-1">
                Poster URL <span className="text-red-500">*</span>
              </label>
              <input
                id="poster"
                name="poster"
                type="text"
                value={formData.poster}
                onChange={handleChange}
                className={`w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red ${errors.poster ? 'border border-red-500' : ''}`}
              />
              {errors.poster && <p className="text-red-500 text-xs mt-1">{errors.poster}</p>}
              {posterPreview && (
                <div className="mt-2">
                  <img src={posterPreview} alt="Poster preview" className="h-24 rounded shadow-sm" />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="backdrop" className="block text-sm font-medium text-gray-300 mb-1">
                Backdrop URL <span className="text-red-500">*</span>
              </label>
              <input
                id="backdrop"
                name="backdrop"
                type="text"
                value={formData.backdrop}
                onChange={handleChange}
                className={`w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red ${errors.backdrop ? 'border border-red-500' : ''}`}
              />
              {errors.backdrop && <p className="text-red-500 text-xs mt-1">{errors.backdrop}</p>}
              {backdropPreview && (
                <div className="mt-2">
                  <img src={backdropPreview} alt="Backdrop preview" className="h-16 w-full object-cover rounded shadow-sm" />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-1">
                Video URL
              </label>
              <input
                id="videoUrl"
                name="videoUrl"
                type="text"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/admin/movies')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-netflix-red hover:bg-netflix-red-hover text-white px-6 py-2 rounded font-medium transition-colors ${loading ? 'opacity-75 cursor-wait' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </span>
              ) : (
                isEditMode ? 'Update Movie' : 'Add Movie'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm; 