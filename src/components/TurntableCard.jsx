import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Vinyl3D from './Vinyl3D';
import TurntableArm from './TurntableArm';

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
  const [isDragging, setIsDragging] = useState(false);

  // Painted line bounds on avance.png: ~4% to ~96%
  const minPct = 4;
  const maxPct = 96;
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const sliderPositionPct = minPct + progressRatio * (maxPct - minPct);

  const calculateSeekFraction = (clientX) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const rawPct = (clickX / rect.width) * 100;
    const normalized = (rawPct - minPct) / (maxPct - minPct);
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
      className={`relative w-full max-w-[490px] sm:max-w-[530px] rounded-[48px] sm:rounded-[56px] p-6 sm:p-9 flex flex-col items-center bg-[#92374D] border-2 border-[#37000A]/35 shadow-[0_25px_60px_rgba(55,0,10,0.45),0_0_40px_rgba(146,55,77,0.3)] select-none ${className}`}
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

      {/* ================= 3. AVANCE.PNG PROGRESS BAR ================= */}
      <div className="w-full px-1 my-1">
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          className="relative w-full h-10 sm:h-11 cursor-pointer select-none flex items-center group"
          role="slider"
          aria-label="Barra de avance de la canción"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Hand-painted avance.png brush stroke */}
          <img
            src="/img/avance.png"
            alt="Barra de avance"
            className="w-full h-full object-fill pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
            draggable={false}
          />

          {/* Progress Fill Line along painted line (#EEABC4 blush glow) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-[4%] h-[3px] bg-[#EEABC4] rounded-full pointer-events-none shadow-[0_0_8px_#EEABC4]"
            style={{ width: `${progressRatio * (maxPct - minPct)}%` }}
          />

          {/* Slider Stylus Head (Sliding directly on painted stroke) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-75 pointer-events-none z-10"
            style={{ left: `${sliderPositionPct}%` }}
          >
            <div className="relative group-hover:scale-125 transition-transform">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F4F1DE] shadow-[0_0_8px_rgba(244,241,222,0.9),0_2px_4px_rgba(0,0,0,0.5)] border border-[#37000A] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#92374D]" />
              </div>
            </div>
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
