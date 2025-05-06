import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ src, poster, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  // Check if video URL is available
  const isVideoAvailable = !!src && typeof src === 'string' && src.trim() !== '';
  
  useEffect(() => {
    // Reset error state when src changes
    setHasError(false);
    
    const hideControlsTimeout = () => {
      setIsControlsVisible(true);
      
      clearTimeout(controlsTimeoutRef.current);
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
      }
    };
    
    const videoElement = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (videoElement && !isNaN(videoElement.duration) && isFinite(videoElement.duration)) {
        const progressPercent = (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(isFinite(progressPercent) ? progressPercent : 0);
        
        // Format current time
        const currentMinutes = Math.floor(videoElement.currentTime / 60);
        const currentSeconds = Math.floor(videoElement.currentTime % 60);
        setCurrentTime(`${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (videoElement && !isNaN(videoElement.duration) && isFinite(videoElement.duration)) {
        // Format duration
        const durationMinutes = Math.floor(videoElement.duration / 60);
        const durationSeconds = Math.floor(videoElement.duration % 60);
        setDuration(`${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`);
        setIsVideoLoaded(true);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (videoElement) {
        videoElement.currentTime = 0;
      }
    };
    
    if (videoElement && isVideoAvailable) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('ended', handleEnded);
      videoElement.volume = volume;
    }
    
    const playerElement = playerRef.current;
    
    if (playerElement) {
      playerElement.addEventListener('mousemove', hideControlsTimeout);
    }
    
    document.addEventListener('fullscreenchange', () => {
      setIsFullscreen(!!document.fullscreenElement);
    });
    
    hideControlsTimeout();
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('ended', handleEnded);
      }
      
      if (playerElement) {
        playerElement.removeEventListener('mousemove', hideControlsTimeout);
      }
      
      document.removeEventListener('fullscreenchange', () => {
        setIsFullscreen(!!document.fullscreenElement);
      });
      
      clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, volume, src, isVideoAvailable]);
  
  const togglePlay = () => {
    if (!isVideoAvailable || hasError) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setHasError(true);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleProgressClick = (e) => {
    if (!isVideoAvailable || hasError) return;
    
    const videoElement = videoRef.current;
    if (!videoElement || !isVideoLoaded || isNaN(videoElement.duration) || !isFinite(videoElement.duration)) {
      return;
    }
    
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const newProgress = (clickPosition / progressBar.offsetWidth) * 100;
    
    // Make sure newProgress is a valid value between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    setProgress(clampedProgress);
    
    try {
      const newTime = (clampedProgress / 100) * videoElement.duration;
      
      // Ensure newTime is a valid, finite number
      if (isFinite(newTime) && !isNaN(newTime)) {
        videoElement.currentTime = newTime;
      }
    } catch (error) {
      // Silently handle error setting video time
    }
  };
  
  const handleVolumeChange = (e) => {
    if (!isVideoAvailable || hasError) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };
  
  const toggleMute = () => {
    if (!isVideoAvailable || hasError) return;
    
    setIsMuted(!isMuted);
    
    if (videoRef.current) {
      if (!isMuted) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume > 0 ? volume : 0.7;
      }
    }
  };
  
  const toggleFullscreen = () => {
    if (!isVideoAvailable || hasError) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen().catch(() => {
          // Silent error handling
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          // Silent error handling
        });
      }
    }
  };
  
  const rewind10s = () => {
    if (!isVideoAvailable || hasError) return;
    
    if (videoRef.current && isVideoLoaded) {
      const newTime = Math.max(0, videoRef.current.currentTime - 10);
      if (isFinite(newTime) && !isNaN(newTime)) {
        videoRef.current.currentTime = newTime;
      }
    }
  };
  
  const forward10s = () => {
    if (!isVideoAvailable || hasError) return;
    
    if (videoRef.current && isVideoLoaded && isFinite(videoRef.current.duration)) {
      const newTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
      if (isFinite(newTime) && !isNaN(newTime)) {
        videoRef.current.currentTime = newTime;
      }
    }
  };
  
  // If video is not available or has an error, show the unavailable message
  if (!isVideoAvailable || hasError) {
    return (
      <div 
        className="relative w-full h-0 pb-[56.25%] bg-black overflow-hidden flex items-center justify-center"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-black/80 p-8 rounded-lg text-center max-w-md">
            <i className="fas fa-exclamation-triangle text-netflix-red text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-white mb-2">Video Not Available</h2>
            <p className="text-gray-300 mb-4">
              {title ? `"${title}" is` : 'This content is'} currently unavailable for playback.
            </p>
            <p className="text-gray-400 text-sm">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        </div>
        {poster && (
          <img 
            src={poster} 
            alt={title || "Content poster"} 
            className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
          />
        )}
      </div>
    );
  }
  
  return (
    <div 
      ref={playerRef}
      className="relative w-full h-0 pb-[56.25%] bg-black overflow-hidden"
      onMouseEnter={() => setIsControlsVisible(true)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute top-0 left-0 w-full h-full object-contain"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => {
          setHasError(true);
        }}
      />
      
      <div 
        className={`absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="relative w-full h-[5px] bg-white/30 mb-4 cursor-pointer rounded"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-netflix-red rounded"
            style={{ width: `${progress}%` }}
          />
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-netflix-red rounded-full shadow-md transition-opacity duration-200 hover:opacity-100 ${isControlsVisible ? 'group-hover:opacity-100' : 'opacity-0'}`}
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button 
              onClick={togglePlay}
              className="bg-transparent border-none text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-netflix-red"
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            
            <button 
              onClick={rewind10s}
              className="bg-transparent border-none text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-netflix-red"
            >
              <i className="fas fa-undo-alt"></i>
            </button>
            
            <button 
              onClick={forward10s}
              className="bg-transparent border-none text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-netflix-red"
            >
              <i className="fas fa-redo-alt"></i>
            </button>
            
            <div className="flex items-center gap-2.5">
              <button 
                onClick={toggleMute}
                className="bg-transparent border-none text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-netflix-red"
              >
                <i className={`fas ${isMuted ? 'fa-volume-mute' : volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down'}`}></i>
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 appearance-none bg-white/30 rounded cursor-pointer"
                style={{
                  "--thumb-size": "12px",
                  "--thumb-color": "white",
                }}
              />
            </div>
            
            <div className="text-white text-sm font-mono min-w-[120px]">
              {currentTime} / {duration}
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleFullscreen}
              className="bg-transparent border-none text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-netflix-red"
            >
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 