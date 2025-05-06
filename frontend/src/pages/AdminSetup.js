import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    setupKey: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate form
    if (!formData.username || !formData.email || !formData.password || !formData.setupKey) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/create-admin', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        setupKey: formData.setupKey
      });

      if (response.data.success) {
        setMessage(response.data.message);
        // Clear form on success
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          setupKey: ''
        });
        toast.success('Admin account created successfully!');
        
        // Auto login after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create admin account');
      }
    } catch (err) {
      // Silent error handling
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black">
      <div className="w-full max-w-md p-8 bg-black bg-opacity-80 rounded shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Setup</h1>
        
        {message && (
          <div className="bg-green-600 text-white p-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Setup Key</label>
            <input
              type="password"
              name="setupKey"
              value={formData.setupKey}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              placeholder="Enter the admin setup key"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This secret key is required to create admin accounts
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-netflix-red text-white p-3 rounded font-bold ${
              isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Creating Admin...' : 'Create Admin User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSetup; 