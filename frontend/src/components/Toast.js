import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Get background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };
  
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };
  
  return createPortal(
    <div 
      className={`fixed top-4 right-4 z-[2100] shadow-lg rounded-md max-w-xs transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className={`flex items-center p-4 ${getBackgroundColor()} text-white rounded-md`}>
        <div className="mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          {message}
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>,
    document.body
  );
};

// Toast container component for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-[2100] space-y-3">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`shadow-lg rounded-md max-w-xs transform transition-all duration-300 animate-slideUp`}
        >
          <div className={`flex items-center p-4 ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
          } text-white rounded-md`}>
            <div className="mr-3">
              {toast.type === 'success' ? <i className="fas fa-check-circle"></i> :
              toast.type === 'error' ? <i className="fas fa-exclamation-circle"></i> :
              toast.type === 'warning' ? <i className="fas fa-exclamation-triangle"></i> :
              <i className="fas fa-info-circle"></i>}
            </div>
            <div className="flex-1">
              {toast.message}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Toast; 