import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Vinyl3D from './Vinyl3D';
import TurntableArm from './TurntableArm';

// Curved midline mathematically extracted from avance.png
const AVANCE_CURVE_PATH =
  'M 60 225 C 92 225, 92 220, 124 220 S 156 219, 188 219 S 220 214, 252 214 S 284 215, 316 215 S 348 213, 379 213 S 411 216, 443 216 S 475 223, 507 223 S 539 230, 571 230 S 603 226, 635 226 S 667 222, 699 222 S 731 219, 763 219 S 795 222, 827 222 S 859 226, 891 226 S 923 228, 954 228 S 986 229, 1018 229 S 1050 231, 1082 231 S 1114 235, 1146 235 S 1178 238, 1210 238';

export default function TurntableCard({
  activeSide,
  isPlaying,
  currentTrack,
  currentTime,
  duration,
  onSeek,
  onTogglePlay,
  onNext,
  onPrev,
  isLooping,
  onToggleLoop,
  isShuffle,
  onToggleShuffle,
  onFlipSide,
  className = '',
}) {
  const progressBarRef = useRef(null);
  const svgPathRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 60, y: 225 });

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  // Track position along the exact drawn curve in real-time
  useEffect(() => {
    if (svgPathRef.current) {
      try {
        const total = svgPathRef.current.getTotalLength();
        const p = svgPathRef.current.getPointAtLength(progressRatio * total);
        if (p && !Number.isNaN(p.x) && !Number.isNaN(p.y)) {
          setKnobPos({ x: p.x, y: p.y });
        }
      } catch {
        setKnobPos({ x: 60 + progressRatio * (1210 - 60), y: 225 });
      }
    }
  }, [progressRatio]);

  // Click & Drag seeking along the bar
  const calculateSeekFraction = (clientX) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = clickX / rect.width;
    // Map between drawing bounds (approx 4.7% to 94.5%)
    const normalized = (ratio - 0.047) / (0.945 - 0.047);
    return Math.max(0, Math.min(1, normalized));
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const fraction = calculateSeekFraction(e.clientX);
    onSeek(fraction);

    const handlePointerMove = (moveEvent) => {
      const moveFraction = calculateSeekFraction(moveEvent.clientX);
      onSeek(moveFraction);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      className={`relative w-full max-w-[490px] sm:max-w-[530px] rounded-[48px] sm:rounded-[56px] p-6 sm:p-9 flex flex-col items-center bg-[#92374D] shadow-[0_25px_60px_rgba(55,0,10,0.45),0_0_40px_rgba(146,55,77,0.3)] select-none ${className}`}
    >
      {/* ================= 1. VINYL RECORD WITH REACTBITS FLIPCARD & HAND-PAINTED TONEARM ================= */}
      <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-square flex items-center justify-center mt-1 mb-2">
        {/* 3D Vinyl Record (FlipCard micro-interaction: clicking the vinyl flips it) */}
        <div className="w-full h-full">
          <Vinyl3D
            activeSide={activeSide}
            isPlaying={isPlaying}
            onFlip={onFlipSide}
            className="w-full h-full"
          />
        </div>

        {/* Hand-painted Tonearm (aguja.png) */}
        <TurntableArm
          isPlaying={isPlaying}
          progress={progressRatio}
        />
      </div>

      {/* ================= 2. TITLE & ARTIST (BUTTERFLY KIDS + DONGLE) ================= */}
      <div className="w-full px-3 text-left mt-2 mb-1">
        <h2 className="text-4xl sm:text-5xl font-bold text-[#F4F1DE] tracking-wide leading-tight drop-shadow-sm font-butterfly truncate">
          {currentTrack?.title || 'En Un Sólo Día'}
        </h2>
        <p className="text-2xl sm:text-3xl text-[#EEABC4] tracking-wide leading-none font-dongle mt-0.5">
          {currentTrack?.artist || 'Morat'}
        </p>
      </div>

      {/* ================= 3. AVANCE.SVG PROGRESS BAR WITH COLOR CHANGE & PINKHEART ================= */}
      <div className="w-full px-1 my-1">
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          className="relative w-full h-11 sm:h-12 cursor-pointer select-none flex items-center group"
          role="slider"
          aria-label="Barra de avance de la canción"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Layer 1: Base avance.svg (Unplayed groove in subtle dark tone) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            style={{
              WebkitMaskImage: "url('/img/avance.svg')",
              maskImage: "url('/img/avance.svg')",
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              backgroundColor: '#40000B',
            }}
          />

          {/* Layer 2: Dynamic Played Progress avance.svg in EXACT background pink (#EEABC4) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
            style={{
              clipPath:
                progressRatio <= 0
                  ? 'inset(0 100% 0 0)'
                  : `inset(0 ${Math.max(0, (1 - (0.047 + progressRatio * (0.945 - 0.047))) * 100)}% 0 0)`,
            }}
          >
            <div
              className="w-full h-full bg-[#EEABC4] drop-shadow-[0_0_12px_rgba(238,171,196,0.9)]"
              style={{
                WebkitMaskImage: "url('/img/avance.svg')",
                maskImage: "url('/img/avance.svg')",
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Hidden reference SVG to compute exact (knobPos.x, knobPos.y) along the natural wave */}
          <svg
            viewBox="0 0 1280 394"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-0 invisible"
            aria-hidden="true"
          >
            <path ref={svgPathRef} d={AVANCE_CURVE_PATH} fill="none" />
          </svg>

          {/* Hand-painted Pink Heart Scrubber (pinkheart.png) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 select-none z-20 flex items-center justify-center"
            style={{
              left: `${(knobPos.x / 1280) * 100}%`,
              top: `${(knobPos.y / 394) * 100}%`,
            }}
          >
            <img
              src="/img/pinkheart.png"
              alt="Marcador de avance"
              className={`h-9 sm:h-11 w-auto object-contain pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] drop-shadow-[0_0_10px_rgba(255,117,151,0.7)] transition-transform duration-100 ${
                isDragging ? 'scale-125 brightness-110' : 'group-hover:scale-115'
              }`}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* ================= 4. THE 5 HAND-PAINTED BUTTONS (EXACTLY AS FIGMA) ================= */}
      <div className="w-full flex items-center justify-between px-2 sm:px-4 mt-1 mb-1">
        {/* Shuffle Button */}
        <button
          type="button"
          onClick={onToggleShuffle}
          className={`relative p-1 transition-all duration-150 cursor-pointer active:scale-90 ${
            isShuffle ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' : 'hover:scale-105 opacity-95 hover:opacity-100'
          }`}
          title={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
        >
          <img
            src="/img/shuffle.png"
            alt="Shuffle"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow"
            draggable={false}
          />
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onPrev}
          className="relative p-1 transition-all duration-150 cursor-pointer hover:scale-105 active:scale-90"
          title="Pista anterior"
        >
          <img
            src="/img/back.png"
            alt="Anterior"
            className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow"
            draggable={false}
          />
        </button>

        {/* Play / Pause Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onTogglePlay}
          className="relative p-1 cursor-pointer focus:outline-none"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          <img
            src={isPlaying ? '/img/pause.png' : '/img/play.png'}
            alt={isPlaying ? 'Pausar' : 'Reproducir'}
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
            draggable={false}
          />
        </motion.button>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          className="relative p-1 transition-all duration-150 cursor-pointer hover:scale-105 active:scale-90"
          title="Pista siguiente"
        >
          <img
            src="/img/next.png"
            alt="Siguiente"
            className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow"
            draggable={false}
          />
        </button>

        {/* Loop Button */}
        <button
          type="button"
          onClick={onToggleLoop}
          className={`relative p-1 transition-all duration-150 cursor-pointer active:scale-90 ${
            isLooping ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' : 'hover:scale-105 opacity-95 hover:opacity-100'
          }`}
          title={isLooping ? 'Repetir activado' : 'Activar repetición'}
        >
          <img
            src="/img/loop.png"
            alt="Loop"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
}
