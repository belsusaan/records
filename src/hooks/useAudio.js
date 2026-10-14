import { useState, useEffect, useRef, useCallback } from 'react';
import { PLAYLIST_SIDE_A, PLAYLIST_SIDE_B } from '../data/playlist';
import {
  getAudioContext,
  playNeedleDropSFX,
  playNeedleLiftSFX,
  startVinylCrackle,
  stopVinylCrackle,
  setVinylCrackleVolume,
  startProceduralMusic,
  stopProceduralMusic,
} from '../audio/proceduralAudio';

export function useAudio() {
  const [activeSide, setActiveSide] = useState('A'); // 'A' or 'B'
  const [playlistSideA, setPlaylistSideA] = useState(PLAYLIST_SIDE_A);
  const [playlistSideB, setPlaylistSideB] = useState(PLAYLIST_SIDE_B);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isCrackleEnabled, setIsCrackleEnabled] = useState(true);
  const [isUsingProceduralFallback, setIsUsingProceduralFallback] = useState(false);

  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);

  const currentPlaylist = activeSide === 'A' ? playlistSideA : playlistSideB;
  const currentTrack = currentPlaylist[currentTrackIndex] || currentPlaylist[0];

  // Helper to get effective volume
  const effectiveVolume = isMuted ? 0 : volume;

  // Initialize track on index/side change
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack) return;

    // Reset progress
    setCurrentTime(0);
    setDuration(currentTrack.duration || 180);
    setIsUsingProceduralFallback(false);

    if (currentTrack.audioSrc) {
      audio.src = currentTrack.audioSrc;
      audio.volume = effectiveVolume;
      audio.preload = 'auto';
    }

    if (isPlaying) {
      playAudio();
    }
  }, [currentTrackIndex, activeSide]);

  // Handle HTML5 audio events
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (!isUsingProceduralFallback) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onAudioEnded = () => {
      handleTrackEnd();
    };

    const onError = () => {
      // If external audio source fails or CORS blocks it, switch smoothly to procedural harmonic synth
      console.warn('Falling back to warm procedural harmonic audio synthesis for track:', currentTrack?.title);
      setIsUsingProceduralFallback(true);
      if (isPlaying) {
        startProceduralMusic(currentTrack?.synthPreset, effectiveVolume);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onAudioEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onAudioEnded);
      audio.removeEventListener('error', onError);
    };
  }, [isPlaying, isUsingProceduralFallback, currentTrack, effectiveVolume]);

  // Procedural timer when using synthesized fallback
  useEffect(() => {
    if (isPlaying && isUsingProceduralFallback) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            handleTrackEnd();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isUsingProceduralFallback, duration]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
    if (isCrackleEnabled && isPlaying) {
      setVinylCrackleVolume(effectiveVolume * 0.25);
    }
  }, [effectiveVolume, isCrackleEnabled, isPlaying]);

  const playAudio = useCallback(() => {
    getAudioContext();
    playNeedleDropSFX();

    if (isCrackleEnabled) {
      startVinylCrackle(effectiveVolume * 0.25);
    }

    const audio = audioRef.current;
    if (audio.src && !isUsingProceduralFallback) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback to procedural synth
          setIsUsingProceduralFallback(true);
          startProceduralMusic(currentTrack?.synthPreset, effectiveVolume);
          setIsPlaying(true);
        });
    } else {
      setIsUsingProceduralFallback(true);
      startProceduralMusic(currentTrack?.synthPreset, effectiveVolume);
      setIsPlaying(true);
    }
  }, [effectiveVolume, isCrackleEnabled, isUsingProceduralFallback, currentTrack]);

  const pauseAudio = useCallback(() => {
    playNeedleLiftSFX();
    stopVinylCrackle();
    stopProceduralMusic();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  const handleTrackEnd = useCallback(() => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setCurrentTime(0);
    } else {
      nextTrack();
    }
  }, [isLooping]);

  const nextTrack = useCallback(() => {
    const list = activeSide === 'A' ? playlistSideA : playlistSideB;
    if (isShuffle) {
      let nextIdx = Math.floor(Math.random() * list.length);
      if (list.length > 1 && nextIdx === currentTrackIndex) {
        nextIdx = (nextIdx + 1) % list.length;
      }
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % list.length);
    }
  }, [activeSide, playlistSideA, playlistSideB, isShuffle, currentTrackIndex]);

  const prevTrack = useCallback(() => {
    const list = activeSide === 'A' ? playlistSideA : playlistSideB;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentTrackIndex((prev) => (prev - 1 + list.length) % list.length);
  }, [activeSide, playlistSideA, playlistSideB, currentTime]);

  const seek = useCallback(
    (fractionOrSeconds) => {
      let targetSec = fractionOrSeconds;
      if (fractionOrSeconds >= 0 && fractionOrSeconds <= 1) {
        targetSec = fractionOrSeconds * duration;
      }
      targetSec = Math.max(0, Math.min(targetSec, duration));

      setCurrentTime(targetSec);
      if (audioRef.current && !isUsingProceduralFallback) {
        audioRef.current.currentTime = targetSec;
      }
    },
    [duration, isUsingProceduralFallback]
  );

  const flipSide = useCallback(() => {
    const nextSide = activeSide === 'A' ? 'B' : 'A';
    setActiveSide(nextSide);
    setCurrentTrackIndex(0);
  }, [activeSide]);

  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleCrackle = useCallback(() => {
    setIsCrackleEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopVinylCrackle();
      } else if (isPlaying) {
        startVinylCrackle(effectiveVolume * 0.25);
      }
      return next;
    });
  }, [isPlaying, effectiveVolume]);

  const addCustomTrack = useCallback((file, title, dedication, lyrics) => {
    const objectUrl = URL.createObjectURL(file);
    const newTrack = {
      id: 'custom-' + Date.now(),
      side: activeSide,
      trackNumber: `${activeSide}*`,
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Canción Personalizada',
      duration: 180,
      lyrics: lyrics || 'Pista de audio personalizada dedicada con todo el corazón.',
      dedication: dedication || 'Dedicatoria especial.',
      date: `Lado ${activeSide} • Edición Especial`,
      audioSrc: objectUrl,
      synthPreset: 'rhodes-warm',
    };

    if (activeSide === 'A') {
      setPlaylistSideA((prev) => [newTrack, ...prev]);
    } else {
      setPlaylistSideB((prev) => [newTrack, ...prev]);
    }
    setCurrentTrackIndex(0);
  }, [activeSide]);

  return {
    activeSide,
    currentTrack,
    currentTrackIndex,
    currentPlaylist,
    isPlaying,
    currentTime,
    duration,
    volume,
    effectiveVolume,
    isMuted,
    isLooping,
    isShuffle,
    isCrackleEnabled,
    isUsingProceduralFallback,
    playAudio,
    pauseAudio,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    flipSide,
    setActiveSide,
    setCurrentTrackIndex,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    toggleCrackle,
    addCustomTrack,
  };
}
