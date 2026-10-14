import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Feather, Check, Quote, Sparkles, Clock, Music } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function LyricsBooklet({
  track,
  currentTime = 0,
  onSeek,
  onSaveDedication,
  className = '',
}) {
  const scrollContainerRef = useRef(null);
  const activeLineRef = useRef(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const timedLyrics = track?.timedLyrics || [];
  const currentDedication = track?.dedication || 'Para alguien muy especial.';

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < timedLyrics.length; i++) {
    if (currentTime >= timedLyrics[i].time) {
      activeIndex = i;
    }
  }

  // Smooth scroll to active line
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  const handleStartEdit = () => {
    setNoteText(currentDedication);
    setIsEditingNote(true);
  };

  const handleSaveEdit = () => {
    if (onSaveDedication) {
      onSaveDedication(track.id, noteText);
    }
    setIsEditingNote(false);
  };

  return (
    <div
      className={`relative w-full rounded-3xl bg-gradient-to-b from-[#181114] via-[#120b0e] to-[#0a0607] border border-[#3d1c24]/70 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ${className}`}
    >
      {/* Vintage borders & grain */}
      <div className="absolute inset-2.5 rounded-2xl border border-[#d4a366]/20 pointer-events-none" />
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-20" />

      {/* Booklet Header */}
      <div className="relative px-5 py-4 border-b border-[#2d151b] flex items-center justify-between z-10 bg-[#160d10]/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#361117] border border-[#d4a366]/40 flex items-center justify-center text-[#edd19c] shadow-inner">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4a366]">
              {track?.date || `Lado ${track?.side}`}
            </span>
            <h3 className="text-base sm:text-lg font-serif-vintage tracking-wide text-[#f4ece7] leading-tight truncate max-w-[200px] sm:max-w-[280px]">
              {track?.title}
            </h3>
          </div>
        </div>

        {/* Dedication Edit Button */}
        <button
          type="button"
          onClick={handleStartEdit}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#241216] hover:bg-[#38161d] text-[#edd19c] border border-[#d4a366]/30 transition-all cursor-pointer shadow-sm"
          title="Personalizar dedicatoria"
        >
          <Feather className="w-3 h-3 text-[#d4a366]" />
          <span className="font-serif-vintage hidden sm:inline">Dedicatoria</span>
        </button>
      </div>

      {/* Dedication / Pensamientos Card with Google Font 'Butterfly Kids' */}
      <div className="relative mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#2b1016]/85 via-[#200c11]/85 to-[#16080c]/85 border border-[#8f1d2c]/40 shadow-md">
        <div className="flex items-start gap-2.5">
          <Quote className="w-4 h-4 text-[#d4a366] shrink-0 mt-1" />
          <div className="w-full">
            <p className="text-[11px] uppercase tracking-wider text-[#d4a366]/80 font-serif-vintage font-semibold">
              Pensamiento & Dedicatoria
            </p>

            <AnimatePresence mode="wait">
              {isEditingNote ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 space-y-2"
                >
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#12070a] text-[#edd19c] font-butterfly text-2xl p-2 rounded-lg border border-[#8f1d2c] focus:outline-none focus:ring-1 focus:ring-[#d4a366] resize-none"
                    placeholder="Escribe tu dedicatoria especial..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(false)}
                      className="px-2 py-0.5 text-xs text-[#a3928e] hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-3 py-1 rounded-md text-xs bg-[#8f1d2c] text-[#fff0f2] hover:bg-[#b82d3e]"
                    >
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-butterfly text-2xl sm:text-3xl text-[#f5dbb5] leading-snug mt-1 tracking-wide"
                >
                  "{currentDedication}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Subheader: Synchronized Status legend */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[10px] sm:text-[11px] text-[#8c7b77] uppercase tracking-widest font-mono">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#d4a366]" />
          Letras Sincronizadas
        </span>
        <span className="text-[#d4a366]/80 flex items-center gap-1 text-[10px]">
          <Sparkles className="w-3 h-3" /> Clic para saltar al verso
        </span>
      </div>

      {/* Synchronized Lyrics Container with Karaoke Opacity Highlight */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto custom-scrollbar px-6 py-4 max-h-[340px] sm:max-h-[380px] z-10 space-y-3"
      >
        {timedLyrics.length > 0 ? (
          timedLyrics.map((line, idx) => {
            const isPast = activeIndex > idx;
            const isActive = activeIndex === idx;
            const isFuture = activeIndex < idx;

            return (
              <motion.div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek && onSeek(line.time)}
                whileHover={{ x: 3 }}
                className={`transition-all duration-300 cursor-pointer select-text rounded-r-lg ${
                  isActive
                    ? 'opacity-100 text-[#fff5ea] font-medium text-lg leading-relaxed border-l-2 border-[#d4a366] pl-3 py-1.5 bg-[#2a131a]/60 shadow-[0_0_15px_rgba(212,163,102,0.15)]'
                    : isPast
                    ? 'opacity-35 text-[#8a7975] text-base leading-relaxed pl-3 hover:opacity-75'
                    : 'opacity-65 text-[#c4b5b0] text-base leading-relaxed pl-3 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-2">
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#edd19c] shadow-[0_0_6px_#edd19c] mt-2.5 shrink-0 animate-pulse" />
                  )}
                  <p className="font-serif-vintage tracking-wide">
                    {line.text}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <ScrollReveal
            content={track?.lyrics || 'Sin letra disponible.'}
            containerRef={scrollContainerRef}
            className="text-[#e2d5ce] select-text"
          />
        )}

        {/* Vintage Signoff at bottom */}
        <div className="mt-8 pt-4 border-t border-[#2d151b] text-center">
          <span className="font-butterfly text-3xl text-[#d4a366] block">
            ~ Fin del tema • Con cariño ~
          </span>
          <span className="text-[10px] tracking-widest text-[#736360] uppercase mt-1 block">
            Gira el disco para descubrir los recuerdos del Lado B
          </span>
        </div>
      </div>
    </div>
  );
}
