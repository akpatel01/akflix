import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movieService from '../services/movieService';

// Component to display a list of movie categories/genres
const CategoryList = ({ title = 'Categories', compact = false, maxCategories = 0, showMoreLink = true }) => {
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await movieService.getCategories();
        
        if (response.success && Array.isArray(response.data)) {
          const sortedCategories = [...response.data].sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sortedCategories);
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('An error occurred while fetching categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Set visible categories when categories change or maxCategories prop changes
  useEffect(() => {
    if (maxCategories > 0 && categories.length > maxCategories) {
      setVisibleCategories(categories.slice(0, maxCategories));
    } else {
      setVisibleCategories(categories);
    }
  }, [categories, maxCategories]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse rounded-md bg-gray-700 h-8 w-24 mb-4"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-md bg-gray-700 h-8 w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-400">No categories found</p>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'p-2' : 'p-4'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-medium`}>{title}</h3>
        
        {showMoreLink && maxCategories > 0 && categories.length > maxCategories && (
          <Link 
            to="/categories"
            className="text-sm text-netflix-red hover:text-netflix-red-hover transition-colors"
          >
            Show More
          </Link>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {visibleCategories.map((category, index) => (
          <Link 
            key={index} 
            to={`/genre/${category.name}`}
            className="px-3 py-1 bg-gray-800 hover:bg-netflix-red rounded-md text-sm transition-colors duration-200"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList; 