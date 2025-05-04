// Initial users data
const USERS = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123', // In a real app, this would be hashed
    profilePic: 'https://i.pravatar.cc/150?img=1',
    watchlist: [1, 4, 7],
    watched: [2, 5, 9],
    preferences: {
      favGenres: ['action', 'sci-fi'],
      recommendationSettings: 'all'
    }
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    profilePic: 'https://i.pravatar.cc/150?img=10',
    watchlist: [],
    watched: [],
    role: 'admin',
    preferences: {
      favGenres: [],
      recommendationSettings: 'all'
    }
  }
];

// User-related utility functions
export const authenticateUser = (email, password) => {
  const user = USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  }
  return { success: false, message: 'Invalid email or password' };
};

export const registerUser = (userData) => {
  // Check if email already exists
  if (USERS.some(u => u.email === userData.email)) {
    return { success: false, message: 'Email already in use' };
  }
  
  // Create new user
  const newUser = {
    id: USERS.length + 1,
    username: userData.username,
    email: userData.email,
    password: userData.password, // In a real app, this would be hashed
    profilePic: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    watchlist: [],
    watched: [],
    preferences: {
      favGenres: [],
      recommendationSettings: 'all'
    }
  };
  
  // Add to users array (in a real app, this would persist to a database)
  USERS.push(newUser);
  
  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
};

export const getUserById = (id) => {
  const user = USERS.find(u => u.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const updateUserProfile = (id, updates) => {
  const userIndex = USERS.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    // Update user data
    USERS[userIndex] = {
      ...USERS[userIndex],
      ...updates
    };
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = USERS[userIndex];
    return { success: true, user: userWithoutPassword };
  }
  return { success: false, message: 'User not found' };
};

export const toggleWatchlistItem = (userId, movieId) => {
  const userIndex = USERS.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const user = USERS[userIndex];
    const isInWatchlist = user.watchlist.includes(movieId);
    
    if (isInWatchlist) {
      // Remove from watchlist
      user.watchlist = user.watchlist.filter(id => id !== movieId);
    } else {
      // Add to watchlist
      user.watchlist = [...user.watchlist, movieId];
    }
    
    return { success: true, watchlist: user.watchlist };
  }
  return { success: false, message: 'User not found' };
};

export const toggleWatchedItem = (userId, movieId) => {
  const userIndex = USERS.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const user = USERS[userIndex];
    const isInWatched = user.watched.includes(movieId);
    
    if (isInWatched) {
      // Remove from watched
      user.watched = user.watched.filter(id => id !== movieId);
    } else {
      // Add to watched
      user.watched = [...user.watched, movieId];
    }
    
    return { success: true, watched: user.watched };
  }
  return { success: false, message: 'User not found' };
};

export default USERS; 