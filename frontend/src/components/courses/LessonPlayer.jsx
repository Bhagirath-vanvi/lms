import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";

const LessonPlayer = ({ lesson, onProgress, onComplete }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");

  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (showControls) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);
    }
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [showControls, playing]);

  const handleProgress = (state) => {
    setPlayed(state.played);
    onProgress?.(state.played);

    // Mark as complete when 90% watched
    if (state.played > 0.9) {
      onComplete?.(lesson._id);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTo = (e.clientX - rect.left) / rect.width;
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerRef.current?.getInternalPlayer()?.requestFullscreen?.();
    }
  };

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <ReactPlayer
        ref={playerRef}
        url={lesson.videoUrl}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={setDuration}
        onEnded={() => onComplete?.(lesson._id)}
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              controls: 0,
              modestbranding: 1,
              rel: 0,
            },
          },
        }}
      />

      {/* Custom Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"
      >
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
          >
            {playing ? (
              <FiPause className="text-white text-2xl" />
            ) : (
              <FiPlay className="text-white text-2xl ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          {/* Progress Bar */}
          <div
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-500 rounded-full relative"
              style={{ width: `${played * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-lg" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPlaying(!playing)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {playing ? <FiPause size={20} /> : <FiPlay size={20} />}
              </button>

              <button
                onClick={() => playerRef.current?.seekTo(played - 0.1)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <FiSkipBack size={20} />
              </button>

              <button
                onClick={() => playerRef.current?.seekTo(played + 0.1)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <FiSkipForward size={20} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMuted(!muted)}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(duration * played)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Playback Speed */}
              <select
                value={playbackRate}
                onChange={(e) =>
                  setPlaybackRate(Number.parseFloat(e.target.value))
                }
                className="bg-white/20 text-white text-sm rounded px-2 py-1 border-none outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <FiMaximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonPlayer;
