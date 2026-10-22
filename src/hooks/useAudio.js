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
  const spotifyAnchorRef = useRef({
    spotifyTime: 0,
    clientTimestamp: performance.now(),
    isPlaying: false,
  });
  const manualTrackChangeRef = useRef(null);

  const currentPlaylist = activeSide === 'A' ? playlistSideA : playlistSideB;
  const currentTrack = currentPlaylist[currentTrackIndex] || currentPlaylist[0];

  // Helper to get effective volume
  const effectiveVolume = isMuted ? 0 : volume;

  // Continuous smooth progress ticker
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

        // If Spotify is live, calculate from calibrated anchor with monotonic forward guarantee
        if (isSpotifyLive && spotifyAnchorRef.current.isPlaying) {
          const anchor = spotifyAnchorRef.current;
          const elapsed = (now - anchor.clientTimestamp) / 1000;
          const currentEst = anchor.spotifyTime + elapsed;

          // Prevent backward rubberbanding:
          // If Spotify's packet was slightly delayed and currentEst is behind client's current time (< 4s diff),
          // DO NOT jump backwards! Advance smoothly forward at normal 1x speed:
          if (currentEst < prev && (prev - currentEst) < 4.0) {
            return prev + deltaSec;
          }
          return currentEst;
        } else {
          return prev + deltaSec;
        }
      });
    }, 100);

    return () => clearInterval(ticker);
  }, [isPlaying, isSpotifyLive, duration]);

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
          const arrivalTime = performance.now();
          const latencySec = (arrivalTime - fetchStart) / 2000;
          const item = playback.item;
          const trackDuration = (item.duration_ms || 180000) / 1000;
          const baseProgress = (playback.progress_ms || 0) / 1000;
          const exactSpotifyProgress = playback.is_playing ? baseProgress + latencySec : baseProgress;

          // If the user recently changed track or flipped side manually,
          // Spotify API might still report the stale previous track for 1-3 seconds.
          // Guard against reverting the user's manual choice:
          if (manualTrackChangeRef.current) {
            const pending = manualTrackChangeRef.current;
            const elapsed = performance.now() - pending.timestamp;
            const matchesPending =
              (item.uri && pending.uri && item.uri === pending.uri) ||
              (item.name && pending.title && item.name.toLowerCase() === pending.title.toLowerCase());

            if (matchesPending) {
              // Spotify has successfully transitioned to our target track!
              manualTrackChangeRef.current = null;
            } else if (elapsed < 3500) {
              // Spotify is still returning the previous track before catching up.
              // Ignore this stale poll to prevent jumping back to the previous song or side!
              return;
            } else {
              // 3.5s timeout expired; release the guard
              manualTrackChangeRef.current = null;
            }
          }

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

          // Calibrate anchor smoothly without jumps
          const prevAnchor = spotifyAnchorRef.current;
          let calibratedProgress = exactSpotifyProgress;

          if (!trackChanged && prevAnchor.isPlaying && playback.is_playing) {
            const prevEstimated =
              prevAnchor.spotifyTime + (arrivalTime - prevAnchor.clientTimestamp) / 1000;
            const diff = exactSpotifyProgress - prevEstimated;

            // Spotify API progress packets are often delayed by 0.3s - 1.5s due to server latency.
            // If the packet is slightly behind our estimated playback time (diff < 0),
            // NEVER pull the anchor backwards! Keep it at prevEstimated:
            if (diff < 0 && Math.abs(diff) < 4.0) {
              calibratedProgress = prevEstimated;
            } else if (diff > 0 && diff < 2.5) {
              // Slightly ahead: softly catch up forward without a sudden jump
              calibratedProgress = prevEstimated + diff * 0.35;
            } else {
              // Large deliberate seek (> 4s): sync directly
              calibratedProgress = exactSpotifyProgress;
            }
          }

          spotifyAnchorRef.current = {
            spotifyTime: calibratedProgress,
            clientTimestamp: arrivalTime,
            isPlaying: Boolean(playback.is_playing),
          };

          if (trackChanged || !playback.is_playing) {
            setCurrentTime(calibratedProgress);
          }

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

    // Only auto-play if playing, not in a manual transition (already dispatched),
    // and not when Spotify live playback already triggered the state change
    if (isPlaying && !manualTrackChangeRef.current && !isSpotifyLive) {
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
          const next = prev + 0.1;
          if (next >= duration) {
            handleTrackEnd();
            return 0;
          }
          return next;
        });
      }, 100);
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
    const targetTrack = list[nextIdx];

    manualTrackChangeRef.current = {
      uri: targetTrack?.uri,
      title: targetTrack?.title,
      side: activeSide,
      index: nextIdx,
      timestamp: performance.now(),
    };

    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    setDuration(targetTrack?.duration || 180);

    spotifyAnchorRef.current = {
      spotifyTime: 0,
      clientTimestamp: performance.now(),
      isPlaying: true,
    };

    setIsPlaying(true);
    playNeedleDropSFX();

    if (isSpotifyAuthenticated() && targetTrack?.uri) {
      spotifyStartGiftPlaylist(targetTrack.uri).catch((err) =>
        console.log('Spotify next track notice:', err)
      );
    }

    if (audioRef.current && targetTrack?.audioSrc && !isUsingProceduralFallback) {
      audioRef.current.src = targetTrack.audioSrc;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (!isSpotifyAuthenticated()) {
      startProceduralMusic(targetTrack?.synthPreset, effectiveVolume);
    }
  }, [activeSide, playlistSideA, playlistSideB, isShuffle, currentTrackIndex, effectiveVolume, isUsingProceduralFallback]);

  const prevTrack = useCallback(() => {
    const list = activeSide === 'A' ? playlistSideA : playlistSideB;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      spotifyAnchorRef.current = {
        spotifyTime: 0,
        clientTimestamp: performance.now(),
        isPlaying: isPlaying,
      };
      if (isSpotifyAuthenticated()) {
        spotifySeek(0).catch(() => {});
      }
      return;
    }

    const prevIdx = (currentTrackIndex - 1 + list.length) % list.length;
    const targetTrack = list[prevIdx];

    manualTrackChangeRef.current = {
      uri: targetTrack?.uri,
      title: targetTrack?.title,
      side: activeSide,
      index: prevIdx,
      timestamp: performance.now(),
    };

    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    setDuration(targetTrack?.duration || 180);

    spotifyAnchorRef.current = {
      spotifyTime: 0,
      clientTimestamp: performance.now(),
      isPlaying: true,
    };

    setIsPlaying(true);
    playNeedleDropSFX();

    if (isSpotifyAuthenticated() && targetTrack?.uri) {
      spotifyStartGiftPlaylist(targetTrack.uri).catch((err) =>
        console.log('Spotify prev track notice:', err)
      );
    }

    if (audioRef.current && targetTrack?.audioSrc && !isUsingProceduralFallback) {
      audioRef.current.src = targetTrack.audioSrc;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (!isSpotifyAuthenticated()) {
      startProceduralMusic(targetTrack?.synthPreset, effectiveVolume);
    }
  }, [activeSide, playlistSideA, playlistSideB, currentTime, currentTrackIndex, isPlaying, effectiveVolume, isUsingProceduralFallback]);

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
  }, [isLooping, nextTrack]);

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
      spotifyAnchorRef.current = {
        spotifyTime: targetSec,
        clientTimestamp: performance.now(),
        isPlaying: isPlaying,
      };
      if (audioRef.current && !isUsingProceduralFallback) {
        audioRef.current.currentTime = targetSec;
      }
    },
    [duration, isUsingProceduralFallback, isPlaying]
  );

  const flipSide = useCallback(() => {
    const nextSide = activeSide === 'A' ? 'B' : 'A';
    const targetList = nextSide === 'A' ? playlistSideA : playlistSideB;
    const targetTrack = targetList[0];

    manualTrackChangeRef.current = {
      uri: targetTrack?.uri,
      title: targetTrack?.title,
      side: nextSide,
      index: 0,
      timestamp: performance.now(),
    };

    setActiveSide(nextSide);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setDuration(targetTrack?.duration || 180);

    spotifyAnchorRef.current = {
      spotifyTime: 0,
      clientTimestamp: performance.now(),
      isPlaying: isPlaying,
    };

    playNeedleDropSFX();

    if (isPlaying) {
      if (isSpotifyAuthenticated() && targetTrack?.uri) {
        spotifyStartGiftPlaylist(targetTrack.uri).catch((err) =>
          console.log('Spotify flip side notice:', err)
        );
      }
      if (audioRef.current && targetTrack?.audioSrc && !isUsingProceduralFallback) {
        audioRef.current.src = targetTrack.audioSrc;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } else if (!isSpotifyAuthenticated()) {
        startProceduralMusic(targetTrack?.synthPreset, effectiveVolume);
      }
    }
  }, [activeSide, playlistSideA, playlistSideB, isPlaying, effectiveVolume, isUsingProceduralFallback]);

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
