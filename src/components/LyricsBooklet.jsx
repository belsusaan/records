import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music } from 'lucide-react';
import { getSynchronizedLyrics } from '../services/lyricsService';

export default function LyricsBooklet({
  track,
  currentTime = 0,
  onSeek,
  className = '',
}) {
  const scrollContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  const [dynamicLyrics, setDynamicLyrics] = useState(null);
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  // Fetch or update lyrics whenever track changes
  useEffect(() => {
    let isCancelled = false;

    async function loadLyrics() {
      // If track has embedded detailed timedLyrics, use them immediately
      if (track?.timedLyrics && track.timedLyrics.length > 2) {
        setDynamicLyrics(track.timedLyrics);
        setIsSynced(true);
      }

      if (!track?.title) return;

      setIsFetchingLyrics(true);
      try {
        const result = await getSynchronizedLyrics(
          track.title,
          track.artist,
          track.duration
        );

        if (!isCancelled && result && result.lyrics && result.lyrics.length > 0) {
          setDynamicLyrics(result.lyrics);
          setIsSynced(Boolean(result.synced));
        }
      } catch (err) {
        console.warn('Error loading dynamic lyrics:', err);
      } finally {
        if (!isCancelled) {
          setIsFetchingLyrics(false);
        }
      }
    }

    loadLyrics();

    return () => {
      isCancelled = true;
    };
  }, [track?.title, track?.artist, track?.duration]);

  const lyricsToDisplay = dynamicLyrics || track?.timedLyrics || [
    { time: 0, text: 'Cargando letras...' },
  ];

  // Determine active lyric index
  let activeIndex = 0;
  for (let i = 0; i < lyricsToDisplay.length; i++) {
    if (currentTime >= lyricsToDisplay[i].time) {
      activeIndex = i;
    }
  }

  // Smooth scroll active line into middle of container
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div
      className={`w-full max-w-[520px] flex flex-col justify-start text-left select-none ${className}`}
    >
      {/* ================= 1. HEADER (TITLE & ARTIST) ================= */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 text-[#a7f3d0] text-[11px] font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
            <Sparkles className="w-3 h-3 text-[#1db954]" />
            <span>{isSynced ? 'Letras sincronizadas en vivo' : 'Letras de la canción'}</span>
          </div>
          {isFetchingLyrics && (
            <span className="text-[11px] text-white/40 italic">Buscando...</span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wide leading-tight drop-shadow-sm font-butterfly">
          {track?.title || 'Ojos color sol'}{' '}
          <span className="mx-1 font-light text-white/70">•</span>{' '}
          {track?.artist || 'Calle 13 - Silvio Rodríguez'}
        </h1>
      </div>

      {/* ================= 2. SYNCHRONIZED LYRICS LIST ================= */}
      <div
        ref={scrollContainerRef}
        className="w-full space-y-3.5 overflow-y-auto max-h-[400px] custom-scrollbar pr-3 py-2 scroll-smooth"
      >
        {lyricsToDisplay.map((line, idx) => {
          const isPast = activeIndex > idx;
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={`${idx}-${line.time}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => onSeek && onSeek(line.time)}
              whileHover={{ x: 5 }}
              className={`cursor-pointer transition-all duration-300 font-butterfly select-text ${
                isActive
                  ? 'text-white text-2xl sm:text-3xl font-semibold scale-[1.02] origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] opacity-100'
                  : isPast
                  ? 'text-white/85 text-xl sm:text-2xl hover:text-white'
                  : 'text-[#c26d6d] text-xl sm:text-2xl opacity-75 hover:opacity-100'
              }`}
            >
              <span>{line.text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
