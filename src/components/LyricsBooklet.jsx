import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LyricsBooklet({
  track,
  currentTime = 0,
  onSeek,
  className = '',
}) {
  const scrollContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  const timedLyrics = track?.timedLyrics || [
    { time: 0, text: 'esta letra ya pasó' },
    { time: 10, text: 'esta aun no' },
  ];

  // Determine active index
  let activeIndex = 0;
  for (let i = 0; i < timedLyrics.length; i++) {
    if (currentTime >= timedLyrics[i].time) {
      activeIndex = i;
    }
  }

  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  return (
    <div className={`w-full max-w-[500px] flex flex-col justify-start text-left select-none ${className}`}>
      {/* ================= 1. HEADER (MATCHING FIGMA FRAME 1 EXACTLY) ================= */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wide leading-tight drop-shadow-sm font-butterfly">
          {track?.title || 'Ojos color sol'} <span className="mx-1 font-light text-white/70">•</span> {track?.artist || 'Calle 13 - Silvio Rodríguez'}
        </h1>
      </div>

      {/* ================= 2. SYNCHRONIZED LYRICS (MATCHING FIGMA COLORS & BUTTERFLY KIDS FONT) ================= */}
      <div
        ref={scrollContainerRef}
        className="w-full space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar pr-2"
      >
        {timedLyrics.map((line, idx) => {
          const isPast = activeIndex > idx;
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={idx}
              ref={isActive ? activeLineRef : null}
              onClick={() => onSeek && onSeek(line.time)}
              whileHover={{ x: 4 }}
              className={`cursor-pointer transition-all duration-200 select-text font-butterfly ${
                isActive
                  ? 'text-white text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                  : isPast
                  ? 'text-white text-2xl sm:text-3xl opacity-90'
                  : 'text-[#c26d6d] text-2xl sm:text-3xl opacity-80 hover:opacity-100'
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
