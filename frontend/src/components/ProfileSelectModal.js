import React from 'react';
import Modal from './Modal';

const ProfileSelectModal = ({ isOpen, onClose, onSelectProfile }) => {
  // Sample profiles - in a real app, this would come from context or props
  const profiles = [
    { id: 1, name: 'User 1', avatar: 'https://i.pravatar.cc/150?img=1', isKids: false },
    { id: 2, name: 'User 2', avatar: 'https://i.pravatar.cc/150?img=2', isKids: false },
    { id: 3, name: 'Kids', avatar: 'https://i.pravatar.cc/150?img=3', isKids: true },
  ];
  
  const handleProfileSelect = (profile) => {
    onSelectProfile(profile);
    onClose();
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Who's watching?"
      className="max-w-2xl"
    >
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleProfileSelect(profile)}
            >
              <div className="relative mb-2">
                <div className="w-[120px] h-[120px] overflow-hidden rounded-md border-2 border-transparent group-hover:border-white transition-all duration-200">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-netflix-red flex items-center justify-center text-white text-4xl font-bold">
                      {profile.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {profile.isKids && (
                  <div className="absolute bottom-1 right-1 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                    KIDS
                  </div>
                )}
              </div>
              <span className="text-gray-400 group-hover:text-white">{profile.name}</span>
            </div>
          ))}
          
          {/* Add profile option */}
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="w-[120px] h-[120px] rounded-md border-2 border-gray-600 group-hover:border-white flex items-center justify-center mb-2 transition-all duration-200">
              <div className="text-gray-600 group-hover:text-white text-5xl">
                <i className="fas fa-plus"></i>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-white">Add Profile</span>
          </div>
        </div>
        
        <button
          className="px-6 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-white rounded font-medium transition-colors"
        >
          Manage Profiles
        </button>
      </div>
    </Modal>
  );
};

export default ProfileSelectModal; 