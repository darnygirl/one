/**
 * Video Player Component
 * Custom video player with controls for e-learning
 * Features: playback speed, progress tracking, keyboard shortcuts
 */

'use client';

import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onProgress?: (progress: number, currentTime: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  className?: string;
}

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function VideoPlayer({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  autoPlay = false,
  className = '',
}: VideoPlayerProps) {
  const { videoRef, containerRef, state, controls } = useVideoPlayer();
  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Report progress
  useEffect(() => {
    if (onProgress && state.duration > 0) {
      const progress = (state.currentTime / state.duration) * 100;
      onProgress(progress, state.currentTime);
    }
  }, [state.currentTime, state.duration, onProgress]);

  // Report completion
  useEffect(() => {
    if (state.ended && onComplete) {
      onComplete();
    }
  }, [state.ended, onComplete]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    if (state.playing) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setHideTimeout(timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  const progressPercent = state.duration
    ? (state.currentTime / state.duration) * 100
    : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => state.playing && setShowControls(false)}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full"
        onClick={controls.togglePlay}
      />

      {/* Loading/Error State */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <div className="text-center">
            <p className="text-xl mb-2">⚠️ Error loading video</p>
            <p className="text-sm text-gray-400">{state.error}</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!state.playing && !state.ended && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={controls.play}
            size="lg"
            className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary"
          >
            <Play className="h-10 w-10 ml-1" />
          </Button>
        </div>
      )}

      {/* Replay Button (when ended) */}
      {state.ended && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Button
            onClick={() => {
              controls.seek(0);
              controls.play();
            }}
            size="lg"
            className="rounded-full"
          >
            <Play className="h-6 w-6 mr-2" />
            Replay
          </Button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls || !state.playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="px-4 pt-8 pb-2">
          <div className="relative group/progress">
            <div className="h-1 bg-gray-600 rounded-full cursor-pointer">
              {/* Buffered */}
              <div
                className="absolute h-full bg-gray-400 rounded-full"
                style={{ width: `${state.buffered}%` }}
              />
              {/* Progress */}
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Seek slider (invisible but interactive) */}
            <input
              type="range"
              min="0"
              max={state.duration || 0}
              value={state.currentTime}
              onChange={(e) => controls.seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-4 pb-4 text-white">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              onClick={controls.togglePlay}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              {state.playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Skip buttons */}
            <Button
              onClick={() => controls.skipBackward(10)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => controls.skipForward(10)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                onClick={controls.toggleMute}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                {state.muted || state.volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="w-20 hidden sm:block">
                <Slider
                  value={[state.muted ? 0 : state.volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => controls.setVolume(value / 100)}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <div className="text-sm font-medium">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-xs"
                >
                  {state.playbackRate}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => controls.setPlaybackRate(rate)}
                    className={state.playbackRate === rate ? 'bg-accent' : ''}
                  >
                    {rate}x {rate === 1 && '(Normal)'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings (placeholder) */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Fullscreen */}
            <Button
              onClick={controls.toggleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
            {title}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      {!state.playing && !state.ended && (
        <div className="absolute top-4 right-4 text-white/60 text-xs bg-black/40 px-3 py-2 rounded">
          <div className="font-semibold mb-1">Keyboard Shortcuts</div>
          <div className="space-y-0.5">
            <div>Space/K - Play/Pause</div>
            <div>←/→ - Skip 5s</div>
            <div>F - Fullscreen</div>
            <div>M - Mute</div>
            <div>0-9 - Jump to %</div>
          </div>
        </div>
      )}
    </div>
  );
}
