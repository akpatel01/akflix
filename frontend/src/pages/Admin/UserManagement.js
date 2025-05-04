import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const response = await userService.updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(`User role updated to ${newRole}`);
        // Update local state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        toast.error(response.message || 'Failed to update user role');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      console.error(err);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-6">
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <button 
            onClick={fetchUsers} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-netflix-red"></div>
            <p className="mt-2 text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.username} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-800 text-red-100' : 'bg-green-800 text-green-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRoleToggle(user._id, user.role)}
                          className={`${
                            user.role === 'admin' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'
                          }`}
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button
                onClick={closeUserDetails}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-600 mx-auto">
                  {selectedUser.profilePic ? (
                    <img src={selectedUser.profilePic} alt={selectedUser.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white text-4xl">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium text-white">{selectedUser.username}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedUser.role === 'admin' ? 'bg-red-800 text-red-100' : 'bg-green-800 text-green-100'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Account Information</h4>
                  <div className="bg-gray-800 rounded p-3">
                    <p className="text-sm flex justify-between">
                      <span className="text-gray-400">Joined:</span>
                      <span className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="text-sm flex justify-between mt-2">
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white">{new Date(selectedUser.updatedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Watchlist</h4>
                  <div className="bg-gray-800 rounded p-3">
                    <p className="text-sm">
                      {selectedUser.watchlist && selectedUser.watchlist.length > 0 ? (
                        <span className="text-white">{selectedUser.watchlist.length} items</span>
                      ) : (
                        <span className="text-gray-400">No items in watchlist</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Watched</h4>
                  <div className="bg-gray-800 rounded p-3">
                    <p className="text-sm">
                      {selectedUser.watched && selectedUser.watched.length > 0 ? (
                        <span className="text-white">{selectedUser.watched.length} items</span>
                      ) : (
                        <span className="text-gray-400">No watched items</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeUserDetails}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => handleRoleToggle(selectedUser._id, selectedUser.role)}
                className={`px-4 py-2 rounded ${
                  selectedUser.role === 'admin' 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {selectedUser.role === 'admin' ? 'Make User' : 'Make Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 