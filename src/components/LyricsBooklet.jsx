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

  const [activeIdx, setActiveIdx] = useState(0);
  const lastTrackTitleRef = useRef(track?.title);

  // Reset active line when track changes
  useEffect(() => {
    if (lastTrackTitleRef.current !== track?.title) {
      lastTrackTitleRef.current = track?.title;
      setActiveIdx(0);
    }
  }, [track?.title]);

  // Determine active lyric index with anti-jitter hysteresis
  useEffect(() => {
    if (!lyricsToDisplay || lyricsToDisplay.length === 0) return;

    let computedIndex = 0;
    for (let i = 0; i < lyricsToDisplay.length; i++) {
      if (currentTime >= lyricsToDisplay[i].time) {
        computedIndex = i;
      }
    }

    setActiveIdx((prevIdx) => {
      // Advance immediately when playback moves forward
      if (computedIndex > prevIdx) {
        return computedIndex;
      }
      // If time went backwards: only jump back on true rewinds/seeks (> 1.2s or track reset)
      if (computedIndex < prevIdx) {
        const currentLineTime = lyricsToDisplay[prevIdx]?.time ?? 0;
        if (currentTime < currentLineTime - 1.2 || currentTime < 1.0) {
          return computedIndex;
        }
        // Suppress millisecond boundary jitter
        return prevIdx;
      }
      return prevIdx;
    });
  }, [currentTime, lyricsToDisplay]);

  // Smooth scroll active line into middle of container
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      const activeEl = document.getElementById(`lyric-line-${activeIdx}`);
      if (activeEl && container) {
        const targetScroll =
          activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [activeIdx, lyricsToDisplay]);

  return (
    <div
      className={`w-full max-w-[520px] flex flex-col justify-start text-left select-none overflow-x-hidden ${className}`}
    >
      {/* ================= 1. HEADER (TITLE & ARTIST) ================= */}
      <div className="mb-4 pl-4 sm:pl-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#37000A] tracking-wide leading-tight drop-shadow-sm font-butterfly">
          {track?.title || 'En Un Sólo Día'}{' '}
          <span className="mx-2 font-light text-[#92374D]/50">•</span>{' '}
          <span className="font-dongle text-3xl sm:text-4xl text-[#92374D] font-bold">{track?.artist || 'Morat'}</span>
        </h1>
      </div>

      {/* ================= 2. SYNCHRONIZED LYRICS LIST ================= */}
      <div
        ref={scrollContainerRef}
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
        className="relative w-full space-y-4 overflow-y-auto overflow-x-hidden h-[430px] custom-scrollbar pl-4 sm:pl-6 pr-4 pt-36 pb-52"
      >
        {lyricsToDisplay.map((line, idx) => {
          const isPast = activeIdx > idx;
          const isActive = activeIdx === idx;

          return (
            <motion.div
              id={`lyric-line-${idx}`}
              key={`${idx}-${line.time}`}
              onClick={() => onSeek && onSeek(line.time)}
              whileHover={{ x: 4 }}
              className={`cursor-pointer transition-all duration-300 font-butterfly select-text leading-snug break-words ${
                isActive
                  ? 'text-[#37000A] text-3xl sm:text-4xl font-bold drop-shadow-[0_0_18px_rgba(255,255,255,0.95)] opacity-100 scale-[1.02] origin-left'
                  : isPast
                  ? 'text-[#37000A]/70 text-2xl sm:text-3xl hover:text-[#37000A]'
                  : 'text-[#92374D]/60 text-2xl sm:text-3xl opacity-70 hover:opacity-100 hover:text-[#92374D]'
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
