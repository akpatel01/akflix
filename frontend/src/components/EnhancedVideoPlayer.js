import React, { useState, useRef, useEffect } from 'react';
import './EnhancedVideoPlayer.css'; // We'll create this CSS file next

const EnhancedVideoPlayer = ({ src, poster, title, subtitle }) => {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showPlaybackAnimation, setShowPlaybackAnimation] = useState(false);
  
  // DOM references
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const volumeControlRef = useRef(null);
  const settingsMenuRef = useRef(null);
  
  // Check if video URL is available
  const isVideoAvailable = !!src && typeof src === 'string' && src.trim() !== '';
  
  // Format time helper function
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '0:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!playerRef.current || !playerRef.current.contains(document.activeElement)) {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.05);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.05);
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying, isMuted, volume]);
  
  // Setup video event listeners
  useEffect(() => {
    setHasError(false);
    
    const videoElement = videoRef.current;
    if (!videoElement || !isVideoAvailable) return;
    
    const hideControlsTimeout = () => {
      setShowControls(true);
      
      clearTimeout(controlsTimeoutRef.current);
      
      if (isPlaying && !isScrubbing && !showSettings) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    // Update progress and current time
    const handleTimeUpdate = () => {
      if (!videoElement || isNaN(videoElement.duration) || !isFinite(videoElement.duration)) return;
      
      const progressPercent = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(isFinite(progressPercent) ? progressPercent : 0);
      setCurrentTime(formatTime(videoElement.currentTime));
      
      // Update buffered progress
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / videoElement.duration) * 100;
        setBufferedProgress(bufferedPercent);
      }
    };
    
    // Set duration when metadata is loaded
    const handleLoadedMetadata = () => {
      if (!videoElement || isNaN(videoElement.duration) || !isFinite(videoElement.duration)) return;
      
      setDuration(formatTime(videoElement.duration));
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    // Handle video ended
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (videoElement) {
        videoElement.currentTime = 0;
      }
    };
    
    // Handle waiting/loading
    const handleWaiting = () => {
      setIsLoading(true);
    };
    
    // Handle playing again after waiting
    const handlePlaying = () => {
      setIsLoading(false);
    };
    
    // Set up event listeners
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);
    videoElement.volume = volume;
    
    // Mouse movement to show controls
    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener('mousemove', hideControlsTimeout);
      playerElement.addEventListener('mouseenter', hideControlsTimeout);
    }
    
    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Initialize controls visible
    hideControlsTimeout();
    
    // Clean up event listeners
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('waiting', handleWaiting);
        videoElement.removeEventListener('playing', handlePlaying);
      }
      
      if (playerElement) {
        playerElement.removeEventListener('mousemove', hideControlsTimeout);
        playerElement.removeEventListener('mouseenter', hideControlsTimeout);
      }
      
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, volume, src, isVideoAvailable, isScrubbing, showSettings]);
  
  // Handle clicks outside settings menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && 
          settingsMenuRef.current && 
          !settingsMenuRef.current.contains(event.target) &&
          event.target.className.indexOf('settings-button') === -1) {
        setShowSettings(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);
  
  // Play/Pause toggle
  const togglePlay = () => {
    if (!isVideoAvailable || hasError) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setHasError(true);
        });
      }
      
      // Show animation
      setShowPlaybackAnimation(true);
      setTimeout(() => setShowPlaybackAnimation(false), 500);
      
      setIsPlaying(!isPlaying);
    }
  };
  
  // Skip forward or backward
  const skip = (seconds) => {
    if (!isVideoAvailable || hasError || !videoRef.current || !isLoaded) return;
    
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    
    if (isFinite(newTime) && !isNaN(newTime)) {
      videoRef.current.currentTime = newTime;
    }
    
    // Show animation for skip
    setShowPlaybackAnimation(true);
    setTimeout(() => setShowPlaybackAnimation(false), 500);
  };
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!isVideoAvailable || hasError || !isLoaded) return;
    
    const progressBar = progressBarRef.current;
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * videoRef.current.duration;
    
    if (isFinite(newTime) && !isNaN(newTime)) {
      videoRef.current.currentTime = newTime;
      setProgress(clickPosition * 100);
    }
  };
  
  // Start scrubbing (dragging) on progress bar
  const startScrubbing = () => {
    setIsScrubbing(true);
  };
  
  // End scrubbing
  const endScrubbing = () => {
    setIsScrubbing(false);
  };
  
  // Adjust volume
  const adjustVolume = (change) => {
    if (!isVideoAvailable || hasError) return;
    
    const newVolume = Math.max(0, Math.min(1, volume + change));
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };
  
  // Handle volume slider change
  const handleVolumeChange = (e) => {
    if (!isVideoAvailable || hasError) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPreviousVolume(newVolume > 0 ? newVolume : previousVolume);
    setIsMuted(newVolume === 0);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!isVideoAvailable || hasError) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (videoRef.current) {
      if (newMuted) {
        setPreviousVolume(volume > 0 ? volume : 0.7);
        videoRef.current.volume = 0;
        setVolume(0);
      } else {
        const newVolume = previousVolume > 0 ? previousVolume : 0.7;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isVideoAvailable || hasError) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
      }
    }
  };
  
  // Change playback speed
  const changePlaybackRate = (rate) => {
    if (!isVideoAvailable || hasError) return;
    
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };
  
  // Error UI
  if (!isVideoAvailable || hasError) {
    return (
      <div className="enhanced-player error-container">
        <div className="error-message">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Video Not Available</h2>
          <p>{title ? `"${title}" is` : 'This content is'} currently unavailable for playback.</p>
          <p className="error-help">Please try again later or contact support if the issue persists.</p>
        </div>
        {poster && (
          <img 
            src={poster} 
            alt={title || "Content poster"} 
            className="error-poster"
          />
        )}
      </div>
    );
  }
  
  return (
    <div 
      ref={playerRef}
      className={`enhanced-player ${showControls ? 'controls-visible' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      onClick={() => togglePlay()}
      onMouseMove={() => {
        clearTimeout(controlsTimeoutRef.current);
        setShowControls(true);
        
        if (isPlaying && !isScrubbing && !showSettings) {
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        }
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="video-element"
        onClick={(e) => e.stopPropagation()}
        onError={() => setHasError(true)}
      />
      
      {/* Title/info overlay */}
      {showControls && (
        <div className="video-info-overlay" onClick={e => e.stopPropagation()}>
          <h2 className="video-title">{title}</h2>
          {subtitle && <p className="video-subtitle">{subtitle}</p>}
        </div>
      )}
      
      {/* Playback animation (play/pause icon) */}
      {showPlaybackAnimation && (
        <div className="playback-animation">
          <i className={isPlaying ? "fas fa-play" : "fas fa-pause"}></i>
        </div>
      )}
      
      {/* Loading spinner */}
      {isLoading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Controls overlay */}
      {showControls && (
        <div className="controls-container" onClick={e => e.stopPropagation()}>
          {/* Progress bar */}
          <div 
            ref={progressBarRef}
            className="progress-container"
            onClick={handleProgressClick}
            onMouseDown={startScrubbing}
            onMouseUp={endScrubbing}
            onMouseLeave={endScrubbing}
          >
            <div className="progress-bar">
              <div className="buffered-progress" style={{ width: `${bufferedProgress}%` }}></div>
              <div className="current-progress" style={{ width: `${progress}%` }}>
                <div className="progress-thumb"></div>
              </div>
            </div>
          </div>
          
          {/* Main controls */}
          <div className="main-controls">
            <div className="left-controls">
              <button className="control-button play-pause" onClick={togglePlay}>
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              
              <button className="control-button rewind" onClick={() => skip(-10)}>
                <i className="fas fa-undo"></i>
                <span className="skip-text">10</span>
              </button>
              
              <button className="control-button forward" onClick={() => skip(10)}>
                <i className="fas fa-redo"></i>
                <span className="skip-text">10</span>
              </button>
              
              <div className="volume-control" ref={volumeControlRef}>
                <button className="control-button volume" onClick={toggleMute}>
                  <i className={`fas ${isMuted ? 'fa-volume-mute' : volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down'}`}></i>
                </button>
                <div className="volume-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
              </div>
              
              <div className="time-display">
                <span className="current-time">{currentTime}</span>
                <span className="time-separator">/</span>
                <span className="duration">{duration}</span>
              </div>
            </div>
            
            <div className="right-controls">
              <button 
                className="control-button settings-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
              >
                <i className="fas fa-cog"></i>
              </button>
              
              <button className="control-button fullscreen" onClick={toggleFullscreen}>
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
              </button>
            </div>
          </div>
          
          {/* Settings menu */}
          {showSettings && (
            <div className="settings-menu" ref={settingsMenuRef} onClick={e => e.stopPropagation()}>
              <h3 className="settings-title">Playback Speed</h3>
              <ul className="playback-speeds">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <li 
                    key={rate} 
                    className={`speed-option ${playbackRate === rate ? 'active' : ''}`}
                    onClick={() => changePlaybackRate(rate)}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                    {playbackRate === rate && <i className="fas fa-check"></i>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPlayer; 