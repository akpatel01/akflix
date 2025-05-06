import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Preset profile picture options
const profilePicOptions = [
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=48',
  'https://i.pravatar.cc/150?img=65'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePic: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup, currentUser, error: authError } = useAuth();
  const navigate = useNavigate();
  
  // Set a default profile pic on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      profilePic: profilePicOptions[0]
    }));
  }, []);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleProfilePicSelect = (picUrl) => {
    setFormData({
      ...formData,
      profilePic: picUrl
    });
  };
  
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.profilePic) {
      setError('Please select a profile picture');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await signup(formData);
      
      if (success) {
        navigate('/');
      } else {
        setError(authError || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black">
      <div className="w-full max-w-md p-8 bg-black bg-opacity-80 rounded shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Sign Up</h1>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-white mb-2">Choose your profile picture</label>
            <div className="flex justify-between items-center">
              {profilePicOptions.map((pic, index) => (
                <div 
                  key={index}
                  onClick={() => handleProfilePicSelect(pic)}
                  className={`
                    w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all
                    ${formData.profilePic === pic ? 'ring-4 ring-netflix-red scale-110' : 'opacity-70 hover:opacity-100'}
                  `}
                >
                  <img 
                    src={pic} 
                    alt={`Profile option ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-netflix-red text-white p-3 rounded font-bold ${
              isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 