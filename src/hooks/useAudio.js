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
import {
  isSpotifyAuthenticated,
  spotifyPlay,
  spotifyPause,
  spotifyNext,
  spotifyPrevious,
  spotifySeek,
  spotifySetShuffle,
  spotifySetRepeat,
  spotifyGetPlayback,
  spotifyStartGiftPlaylist,
} from '../services/spotify';

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
  const [isCrackleEnabled, setIsCrackleEnabled] = useState(false);
  const [isUsingProceduralFallback, setIsUsingProceduralFallback] = useState(false);
  const [isSpotifyLive, setIsSpotifyLive] = useState(false);

  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);

  const currentPlaylist = activeSide === 'A' ? playlistSideA : playlistSideB;
  const currentTrack = currentPlaylist[currentTrackIndex] || currentPlaylist[0];

  // Helper to get effective volume
  const effectiveVolume = isMuted ? 0 : volume;

  // Continuous smooth progress ticker whenever playing so lyrics advance in real time
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const ticker = setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTime((prev) => {
        if (duration > 0 && prev >= duration) {
          return prev;
        }
        return prev + deltaSec;
      });
    }, 100);

    return () => clearInterval(ticker);
  }, [isPlaying, duration]);

  // Poll Spotify playback state when authenticated
  useEffect(() => {
    if (!isSpotifyAuthenticated()) {
      setIsSpotifyLive(false);
      return;
    }

    let isSubscribed = true;

    async function checkSpotifyPlayback() {
      const fetchStart = performance.now();
      try {
        const playback = await spotifyGetPlayback();
        if (!isSubscribed) return;

        if (playback && playback.item) {
          const latencySec = (performance.now() - fetchStart) / 2000;
          const item = playback.item;
          const trackDuration = (item.duration_ms || 180000) / 1000;
          const baseProgress = (playback.progress_ms || 0) / 1000;
          const trackProgress = playback.is_playing ? baseProgress + latencySec : baseProgress;

          // Match Spotify playback with our playlist
          const idxA = playlistSideA.findIndex(
            (t) => t.uri === item.uri || (t.title && t.title.toLowerCase() === item.name.toLowerCase())
          );
          const idxB = playlistSideB.findIndex(
            (t) => t.uri === item.uri || (t.title && t.title.toLowerCase() === item.name.toLowerCase())
          );

          let trackChanged = false;
          if (idxA !== -1) {
            setActiveSide((curr) => {
              if (curr !== 'A') {
                trackChanged = true;
                return 'A';
              }
              return curr;
            });
            setCurrentTrackIndex((curr) => {
              if (curr !== idxA) {
                trackChanged = true;
                return idxA;
              }
              return curr;
            });
          } else if (idxB !== -1) {
            setActiveSide((curr) => {
              if (curr !== 'B') {
                trackChanged = true;
                return 'B';
              }
              return curr;
            });
            setCurrentTrackIndex((curr) => {
              if (curr !== idxB) {
                trackChanged = true;
                return idxB;
              }
              return curr;
            });
          }

          setIsSpotifyLive(true);
          setIsPlaying(Boolean(playback.is_playing));
          setDuration(trackDuration);

          // Update currentTime without backward jitter
          setCurrentTime((curr) => {
            if (trackChanged) return trackProgress;
            // Large manual seek (> 2s), synchronize immediately
            if (Math.abs(trackProgress - curr) > 2.0) {
              return trackProgress;
            }
            // During playback, if Spotify network packet is slightly behind local time, do not jump backward!
            if (playback.is_playing && trackProgress < curr) {
              return curr;
            }
            return Math.max(curr, trackProgress);
          });

          if (playback.is_playing && audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
          }
        } else {
          setIsSpotifyLive(false);
        }
      } catch (err) {
        // Silently continue
      }
    }

    checkSpotifyPlayback();
    const interval = setInterval(checkSpotifyPlayback, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [playlistSideA, playlistSideB]);

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

  const playAudio = useCallback((forceTrackUri = null) => {
    getAudioContext();
    playNeedleDropSFX();

    stopVinylCrackle();

    if (isSpotifyAuthenticated()) {
      const targetUri = forceTrackUri || currentTrack?.uri;
      spotifyStartGiftPlaylist(targetUri).catch((err) =>
        console.log('Spotify start playlist notice:', err)
      );
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
    if (isSpotifyAuthenticated()) {
      spotifyPause().catch((err) => console.log('Spotify playback notice:', err));
    }
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
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * list.length);
      if (list.length > 1 && nextIdx === currentTrackIndex) {
        nextIdx = (nextIdx + 1) % list.length;
      }
    } else {
      nextIdx = (currentTrackIndex + 1) % list.length;
    }
    setCurrentTrackIndex(nextIdx);
    const targetTrack = list[nextIdx];
    if (isSpotifyAuthenticated() && targetTrack?.uri) {
      spotifyStartGiftPlaylist(targetTrack.uri).catch(() => {});
    }
  }, [activeSide, playlistSideA, playlistSideB, isShuffle, currentTrackIndex]);

  const prevTrack = useCallback(() => {
    const list = activeSide === 'A' ? playlistSideA : playlistSideB;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isSpotifyAuthenticated()) {
        spotifySeek(0).catch(() => {});
      }
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + list.length) % list.length;
    setCurrentTrackIndex(prevIdx);
    const targetTrack = list[prevIdx];
    if (isSpotifyAuthenticated() && targetTrack?.uri) {
      spotifyStartGiftPlaylist(targetTrack.uri).catch(() => {});
    }
  }, [activeSide, playlistSideA, playlistSideB, currentTime, currentTrackIndex]);

  const seek = useCallback(
    (fractionOrSeconds) => {
      let targetSec = fractionOrSeconds;
      if (fractionOrSeconds >= 0 && fractionOrSeconds <= 1) {
        targetSec = fractionOrSeconds * duration;
      }
      targetSec = Math.max(0, Math.min(targetSec, duration));

      if (isSpotifyAuthenticated()) {
        spotifySeek(targetSec * 1000).catch((err) => console.log('Spotify seek notice:', err));
      }

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
    const targetList = nextSide === 'A' ? playlistSideA : playlistSideB;
    const targetTrack = targetList[0];
    if (isSpotifyAuthenticated() && targetTrack?.uri) {
      spotifyStartGiftPlaylist(targetTrack.uri).catch(() => {});
    }
  }, [activeSide, playlistSideA, playlistSideB]);

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
    setIsLooping((prev) => {
      const next = !prev;
      if (isSpotifyAuthenticated()) {
        spotifySetRepeat(next).catch(() => {});
      }
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      if (isSpotifyAuthenticated()) {
        spotifySetShuffle(next).catch(() => {});
      }
      return next;
    });
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
    isSpotifyLive,
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
