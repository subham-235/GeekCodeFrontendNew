import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Maximize, Minimize } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format seconds to MM:SS, guarding against NaN/undefined
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = (e) => {
    e.stopPropagation(); // prevent click bubbling
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Video play error:', err);
            }
          });
      } else {
        setIsPlaying(true);
      }
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Sync state tracking for playback and system fullscreen changes
  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (video) video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // No video available for this problem yet (Brutalist Matrix System Fallback)
  if (!secureUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 text-center border-4 border-dashed border-neutral-700/30 bg-neutral-900/5 font-mono rounded-none">
        <p className="text-base sm:text-lg font-black text-red-500 uppercase tracking-widest mb-1">
          ⚠️ [ERR] NO_EDITORIAL_STREAM_FOUND
        </p>
        <p className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-tight">
          No instructional multimedia record has been compiled for this matrix node yet.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl mx-auto border-2 border-neutral-900 dark:border-neutral-100 bg-black font-mono overflow-hidden transition-all duration-200 transform ${
        isFullscreen 
          ? 'max-w-none h-screen flex items-center justify-center border-0 rounded-none shadow-none' 
          : 'hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_0px_#171717] dark:shadow-[4px_4px_0px_0px_#f5f5f5] hover:shadow-[8px_8px_0px_0px_#171717] dark:hover:shadow-[8px_8px_0px_0px_#f5f5f5]'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`w-full bg-black cursor-pointer display-block ${
          isFullscreen ? 'h-full object-contain' : 'aspect-video'
        }`}
      />

      {/* Video Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-200 z-50 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          {/* Action Trigger Node Core Group */}
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center w-10 h-10 border-2 border-neutral-100 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 focus:outline-none transition-none shadow-[2px_2px_0px_0px_#f5f5f5]"
              aria-label={isPlaying ? "Pause Stream" : "Execute Stream"}
            >
              {isPlaying ? (
                <Pause size={18} strokeWidth={2.5} />
              ) : (
                <Play size={18} strokeWidth={2.5} fill="currentColor" />
              )}
            </button>

            {/* Fullscreen System Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-10 h-10 border-2 border-neutral-100 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 focus:outline-none transition-none shadow-[2px_2px_0px_0px_#f5f5f5]"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Maximize Screen"}
            >
              {isFullscreen ? (
                <Minimize size={18} strokeWidth={2.5} />
              ) : (
                <Maximize size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>

          {/* Core Stream Matrix Status Label */}
          <div className="text-right hidden sm:block">
            <span className={`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-widest border-2 transition-all duration-150 ${
              isPlaying 
                ? 'bg-emerald-500 text-neutral-950 border-neutral-100 shadow-[2px_2px_0px_0px_#f5f5f5]' 
                : 'bg-neutral-950 text-amber-500 border-amber-500 shadow-[2px_2px_0px_0px_#d97706]'
            }`}>
              {isPlaying ? "STATUS: STREAM_PLAYING" : "STATUS: CORE_PAUSED"}
            </span>
          </div>
        </div>

        {/* Dynamic Telemetry Progress Tracker Bar */}
        <div className="flex items-center w-full gap-3 bg-black/40 border border-neutral-800/80 p-2">
          {/* Boosted Live Timestamp */}
          <span className="text-emerald-500 text-sm sm:text-base font-black tracking-wider min-w-[45px]">
            {formatTime(currentTime)}
          </span>
          
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="flex-1 accent-emerald-500 bg-neutral-800 h-2 cursor-pointer border border-neutral-700 appearance-none outline-none"
          />
          
          {/* Boosted Target Duration Timestamp */}
          <span className="text-neutral-400 text-sm sm:text-base font-black tracking-wider min-w-[45px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Editorial;