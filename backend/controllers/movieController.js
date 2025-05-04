const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const { genre, year, sort, limit = 20, page = 1, search } = req.query;
    
    // Build query
    const query = {};
    
    // Add search filters
    if (genre) {
      query.genres = genre;
    }
    
    if (year) {
      query.year = year;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Build sort options
    let sortOptions = {};
    if (sort) {
      // Handle sort format like "field:direction"
      const [field, direction] = sort.split(':');
      sortOptions[field] = direction === 'desc' ? -1 : 1;
    } else {
      // Default sort
      sortOptions = { createdAt: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const totalMovies = await Movie.countDocuments(query);
    const movies = await Movie
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: movies.length,
      total: totalMovies,
      page: parseInt(page),
      pages: Math.ceil(totalMovies / parseInt(limit)),
      data: movies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured movies
// @route   GET /api/movies/featured
// @access  Public
exports.getFeaturedMovies = async (req, res) => {
  try {
    const featuredMovies = await Movie.find({ isFeatured: true });
    
    res.status(200).json({
      success: true,
      count: featuredMovies.length,
      data: featuredMovies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get a single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    // Increment view count
    movie.viewCount += 1;
    await movie.save();
    
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error(error);
    
    // Handle invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error(error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error(error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    
    // Handle invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get movie statistics
// @route   GET /api/movies/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    // Total movies count
    const totalMovies = await Movie.countDocuments();
    
    // Featured movies count
    const featuredCount = await Movie.countDocuments({ isFeatured: true });
    
    // Movies by genre
    const genreCounts = await Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    
    // Most viewed movies
    const mostViewed = await Movie.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title poster year viewCount');
    
    // Latest additions
    const latestAdditions = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title poster year createdAt');
    
    res.status(200).json({
      success: true,
      data: {
        total: totalMovies,
        featured: featuredCount,
        byGenre: genreCounts,
        mostViewed,
        latestAdditions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Increment movie view count
// @route   POST /api/movies/:id/view
// @access  Public
exports.incrementViewCount = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    // Increment view count
    movie.viewCount += 1;
    await movie.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: movie._id,
        title: movie.title,
        viewCount: movie.viewCount
      }
    });
  } catch (error) {
    console.error(error);
    
    // Handle invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 