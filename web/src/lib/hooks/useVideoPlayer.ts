/**
 * Video Player Hook
 * Manages video playback state and controls
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface VideoState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  buffered: number;
  seeking: boolean;
  ended: boolean;
  error: string | null;
}

export interface VideoControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  skipForward: (seconds: number) => void;
  skipBackward: (seconds: number) => void;
}

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<VideoState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    buffered: 0,
    seeking: false,
    ended: false,
    error: null,
  });

  // Update state handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        currentTime: videoRef.current!.currentTime,
      }));
    }
  }, []);

  const handleDurationChange = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        duration: videoRef.current!.duration,
      }));
    }
  }, []);

  const handlePlay = useCallback(() => {
    setState((prev) => ({ ...prev, playing: true, ended: false }));
  }, []);

  const handlePause = useCallback(() => {
    setState((prev) => ({ ...prev, playing: false }));
  }, []);

  const handleEnded = useCallback(() => {
    setState((prev) => ({ ...prev, playing: false, ended: true }));
  }, []);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        volume: videoRef.current!.volume,
        muted: videoRef.current!.muted,
      }));
    }
  }, []);

  const handleProgress = useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const buffered =
        videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setState((prev) => ({
        ...prev,
        buffered: (buffered / videoRef.current!.duration) * 100,
      }));
    }
  }, []);

  const handleError = useCallback(() => {
    if (videoRef.current?.error) {
      setState((prev) => ({
        ...prev,
        error: videoRef.current!.error!.message,
      }));
    }
  }, []);

  // Control methods
  const controls: VideoControls = {
    play: () => {
      videoRef.current?.play();
    },
    pause: () => {
      videoRef.current?.pause();
    },
    togglePlay: () => {
      if (state.playing) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play();
      }
    },
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    setVolume: (volume: number) => {
      if (videoRef.current) {
        videoRef.current.volume = Math.max(0, Math.min(1, volume));
      }
    },
    toggleMute: () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
      }
    },
    setPlaybackRate: (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setState((prev) => ({ ...prev, playbackRate: rate }));
      }
    },
    toggleFullscreen: () => {
      if (!document.fullscreenElement && containerRef.current) {
        containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    },
    skipForward: (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          videoRef.current.duration,
          videoRef.current.currentTime + seconds
        );
      }
    },
    skipBackward: (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          videoRef.current.currentTime - seconds
        );
      }
    },
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if video is focused or container is active
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          controls.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          controls.skipBackward(5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          controls.skipForward(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          controls.setVolume(state.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          controls.setVolume(state.volume - 0.1);
          break;
        case 'f':
          e.preventDefault();
          controls.toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          controls.toggleMute();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          controls.seek(state.duration * percent);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.volume, state.duration]);

  // Attach event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return {
    videoRef,
    containerRef,
    state,
    controls,
  };
}
