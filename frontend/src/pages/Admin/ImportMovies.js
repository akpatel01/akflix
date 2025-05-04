import React, { useState } from 'react';
import movieService from '../../services/movieService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ImportMovies = () => {
  const [movieData, setMovieData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();
  const toast = useToast();

  const handleImport = async () => {
    if (!isAdmin) {
      setError('You must be an admin to import movies');
      return;
    }

    if (!movieData.trim()) {
      setError('Please enter movie data in JSON format');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Parse the JSON data
      let parsedData;
      try {
        parsedData = JSON.parse(movieData);
      } catch (err) {
        throw new Error('Invalid JSON format. Please check your input.');
      }

      // If it's an array, import multiple movies
      if (Array.isArray(parsedData)) {
        const importResults = {
          total: parsedData.length,
          successful: 0,
          failed: 0,
          failures: []
        };

        for (const movie of parsedData) {
          try {
            const response = await movieService.createMovie(movie);
            if (response.success) {
              importResults.successful++;
            } else {
              importResults.failed++;
              importResults.failures.push({
                title: movie.title || 'Unknown movie',
                error: response.message
              });
            }
          } catch (err) {
            importResults.failed++;
            importResults.failures.push({
              title: movie.title || 'Unknown movie',
              error: err.message || 'Unknown error'
            });
          }
        }

        setResults(importResults);
        if (importResults.successful > 0) {
          toast.success(`Successfully imported ${importResults.successful} movies`);
        }
      } else {
        // It's a single movie
        const response = await movieService.createMovie(parsedData);
        if (response.success) {
          setResults({
            total: 1,
            successful: 1,
            failed: 0,
            failures: []
          });
          toast.success(`Successfully imported "${parsedData.title}"`);
        } else {
          setResults({
            total: 1,
            successful: 0,
            failed: 1,
            failures: [
              {
                title: parsedData.title || 'Unknown movie',
                error: response.message
              }
            ]
          });
          throw new Error(response.message || 'Failed to import movie');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while importing movies');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    const sampleData = [
      {
        title: "The Shawshank Redemption",
        description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
        year: 1994,
        duration: "142 min",
        rating: 9.3,
        genres: ["drama"],
        director: "Frank Darabont",
        actors: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
        poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
        backdrop: "https://www.teahub.io/photos/full/15-151508_the-shawshank-redemption-hope-is-a-good-thing.jpg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        isFeatured: false
      }
    ];
    
    setMovieData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="p-6">
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Import Movies</h1>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="movieData" className="text-lg text-white">
              Movie Data (JSON Format)
            </label>
            <button
              onClick={handleSampleData}
              className="text-blue-400 text-sm hover:text-blue-300"
            >
              Load Sample Data
            </button>
          </div>
          <textarea
            id="movieData"
            className="w-full h-64 bg-gray-800 text-white p-3 rounded focus:outline-none"
            value={movieData}
            onChange={(e) => setMovieData(e.target.value)}
            placeholder="Paste JSON data here..."
          ></textarea>
          <p className="text-sm text-gray-400 mt-2">
            You can import a single movie or an array of movies in JSON format.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleImport}
            disabled={isLoading}
            className="bg-netflix-red text-white px-4 py-2 rounded hover:bg-netflix-red-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import Movies'}
          </button>
        </div>
        
        {results && (
          <div className="mt-6 bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold text-white mb-2">Import Results</h2>
            <div className="flex space-x-4 mb-4">
              <div className="bg-gray-700 p-3 rounded flex-1 text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl text-white">{results.total}</p>
              </div>
              <div className="bg-green-900 p-3 rounded flex-1 text-center">
                <p className="text-sm text-gray-300">Successful</p>
                <p className="text-xl text-white">{results.successful}</p>
              </div>
              <div className="bg-red-900 p-3 rounded flex-1 text-center">
                <p className="text-sm text-gray-300">Failed</p>
                <p className="text-xl text-white">{results.failed}</p>
              </div>
            </div>
            
            {results.failures.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-2">Failures:</h3>
                <ul className="space-y-2">
                  {results.failures.map((failure, index) => (
                    <li key={index} className="bg-red-900/30 p-2 rounded">
                      <span className="font-medium">{failure.title}:</span> {failure.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportMovies; 