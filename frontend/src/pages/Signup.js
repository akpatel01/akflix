import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

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
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const { signup, currentUser, error: authError } = useAuth();
  const navigate = useNavigate();
  
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
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    setUploadedImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleImageUpload = async () => {
    if (!uploadedImage) {
      setError('Please select an image to upload');
      return;
    }
    
    setUploadLoading(true);
    setError('');
    
    try {
      const response = await authService.uploadProfileImage(uploadedImage);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          profilePic: response.file.url
        }));
        setError('');
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploadLoading(false);
    }
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
      setError('Please upload a profile picture');
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
            <label className="block text-white mb-2">Upload your profile picture</label>
            <div className="flex flex-col items-center mb-3">
              {imagePreview ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : formData.profilePic ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                  <img 
                    src={formData.profilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                  <span className="text-white text-5xl">?</span>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-upload"
              />
              <div className="flex space-x-2">
                <label
                  htmlFor="profile-image-upload"
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
                >
                  Select Image
                </label>
                {uploadedImage && !formData.profilePic && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadLoading}
                    className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700"
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
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