import React from 'react';
import Modal from './Modal';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = 'Notification', 
  message, 
  type = 'info', 
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  showCancel = false
}) => {
  
  // Get icon based on alert type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle text-green-500 text-4xl"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle text-red-500 text-4xl"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl"></i>;
      case 'confirm':
        return <i className="fas fa-question-circle text-blue-400 text-4xl"></i>;
      default:
        return <i className="fas fa-info-circle text-blue-400 text-4xl"></i>;
    }
  };

  // Get button color based on alert type
  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-netflix-red hover:bg-red-700';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center">
        <div className="mb-4">
          {getIcon()}
        </div>
        <p className="text-white text-center mb-6">{message}</p>
        <div className="flex justify-center space-x-3 w-full">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 rounded text-white transition-colors ${getButtonClass()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal; 