import React, { useState, useEffect } from 'react';
import movieService from '../../services/movieService';

const GenreManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieCounts, setMovieCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoriesResponse = await movieService.getCategories();
        
        if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
          
          // Fetch statistics to get movie counts by genre
          const statsResponse = await movieService.getStats();
          
          if (statsResponse.success && statsResponse.data && statsResponse.data.byGenre) {
            // Create a map of genre name to count
            const countMap = {};
            statsResponse.data.byGenre.forEach(item => {
              countMap[item.name] = item.count;
            });
            
            setMovieCounts(countMap);
          }
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Genre Management</h2>
      </div>

      {isLoading ? (
        <div className="bg-netflix-dark-gray p-8 rounded-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-netflix-dark-gray p-8 rounded-md">
          <div className="text-red-500 text-center">
            <p className="text-lg mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-netflix-dark-gray rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-black bg-opacity-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Movies Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categories.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white">
                          {category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {movieCounts[category.name] || 0}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-400">
                      No genres found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-netflix-dark-gray p-6 rounded-md">
        <h3 className="text-xl font-medium mb-4">About Genres</h3>
        <p className="text-gray-300 mb-3">
          Genres are automatically created when you add movies with new genres. They are derived from the movies in your database.
        </p>
        <p className="text-gray-300">
          To add a new genre, simply add it to a movie when creating or editing movie details.
        </p>
      </div>
    </div>
  );
};

export default GenreManagement; 