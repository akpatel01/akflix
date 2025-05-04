const express = require('express');
const router = express.Router();
const {
  getMovies,
  getFeaturedMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getStats,
  incrementViewCount
} = require('../controllers/movieController');
const { protect, isAdmin } = require('../middlewares/auth');

// Public routes
router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/stats', protect, isAdmin, getStats);
router.get('/:id', getMovie);
router.post('/:id/view', incrementViewCount);

// Admin only routes
router.post('/', protect, isAdmin, createMovie);
router.put('/:id', protect, isAdmin, updateMovie);
router.delete('/:id', protect, isAdmin, deleteMovie);

module.exports = router; 