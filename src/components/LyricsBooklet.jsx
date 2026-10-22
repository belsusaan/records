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
          <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-[#1C3041] border border-[#92374D]/50 text-[#EEABC4] text-xl font-dongle shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#EEABC4] animate-pulse" />
            <Sparkles className="w-4 h-4 text-[#EEABC4]" />
            <span className="leading-none">{isSynced ? 'Letras sincronizadas en vivo' : 'Letras de la canción'}</span>
          </div>
          {isFetchingLyrics && (
            <span className="text-lg text-[#EEABC4]/60 font-dongle italic">Buscando...</span>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#F4F1DE] tracking-wide leading-tight drop-shadow-sm font-butterfly">
          {track?.title || 'En Un Sólo Día'}{' '}
          <span className="mx-2 font-light text-[#EEABC4]/50">•</span>{' '}
          <span className="font-dongle text-3xl sm:text-4xl text-[#EEABC4] font-normal">{track?.artist || 'Morat'}</span>
        </h1>
      </div>

      {/* ================= 2. SYNCHRONIZED LYRICS LIST ================= */}
      <div
        ref={scrollContainerRef}
        className="w-full space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-3 py-2 scroll-smooth"
      >
        {lyricsToDisplay.map((line, idx) => {
          const isPast = activeIndex > idx;
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={`${idx}-${line.time}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => onSeek && onSeek(line.time)}
              whileHover={{ x: 6 }}
              className={`cursor-pointer transition-all duration-300 font-butterfly select-text leading-snug ${
                isActive
                  ? 'text-[#F4F1DE] text-3xl sm:text-4xl font-semibold scale-[1.03] origin-left drop-shadow-[0_0_15px_rgba(244,241,222,0.9)] opacity-100'
                  : isPast
                  ? 'text-[#F4F1DE]/75 text-2xl sm:text-3xl hover:text-[#F4F1DE]'
                  : 'text-[#EEABC4]/75 text-2xl sm:text-3xl opacity-75 hover:opacity-100 hover:text-[#EEABC4]'
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
