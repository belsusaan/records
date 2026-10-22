import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, RotateCw, Radio } from 'lucide-react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CustomControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
  isLooping,
  onToggleLoop,
  isShuffle,
  onToggleShuffle,
  volume,
  onChangeVolume,
  isMuted,
  onToggleMute,
  isCrackleEnabled,
  onToggleCrackle,
  activeSide,
  onFlipSide,
  className = '',
}) {
  const progressBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Painted line on avance.svg: stretches from 3.8% to 95.5%
  const minPct = 3.8;
  const maxPct = 95.5;
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
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* ================= 1. AVANCE.PNG SEEK BAR ================= */}
      <div className="w-full max-w-[480px] px-2 sm:px-4 mb-2">
        {/* Time Indicators */}
        <div className="flex justify-between items-center text-xs text-[#b8a6a2] font-mono tracking-wider mb-1 px-1 select-none">
          <span className="font-semibold text-[#edd19c]">{formatTime(currentTime)}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#9c8985]">
            {isPlaying ? '• En Reproducción •' : 'En Pausa'}
          </span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Hand-painted Progress Line Container */}
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          className="relative w-full max-w-[460px] mx-auto h-10 cursor-pointer select-none flex items-center group"
          role="slider"
          aria-label="Barra de avance de la canción"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Base avance.svg */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            style={{
              WebkitMaskImage: "url('/img/avance.svg?v=3')",
              maskImage: "url('/img/avance.svg?v=3')",
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              backgroundColor: '#40000B',
            }}
          />

          {/* Dynamic Progress Fill avance.svg in EXACT background pink (#EEABC4) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
            style={{
              clipPath: `inset(0 ${Math.max(0, 100 - sliderPositionPct)}% 0 0)`,
              transition: isDragging ? 'none' : 'clip-path 0.2s linear',
            }}
          >
            <div
              className="w-full h-full bg-[#EEABC4] drop-shadow-[0_0_12px_rgba(238,171,196,0.9)]"
              style={{
                WebkitMaskImage: "url('/img/avance.svg?v=3')",
                maskImage: "url('/img/avance.svg?v=3')",
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Slider Pink Heart with beating pulse */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center select-none"
            style={{
              left: `${sliderPositionPct}%`,
              transition: isDragging ? 'none' : 'left 0.2s linear',
            }}
          >
            <motion.img
              src="/img/pinkheart.png"
              alt="Marcador de avance"
              animate={
                isPlaying
                  ? {
                      scale: [1, 1.2, 0.95, 1.12, 1],
                      rotate: [0, -3, 2, -1, 0],
                    }
                  : {
                      scale: 1,
                      rotate: 0,
                    }
              }
              transition={
                isPlaying
                  ? {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : { duration: 0.2 }
              }
              className={`h-8 w-auto object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] drop-shadow-[0_0_10px_rgba(238,171,196,0.9)] transition-transform select-none ${
                isDragging ? 'scale-125 brightness-110' : 'group-hover:scale-115'
              }`}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN HAND-PAINTED PLAYBACK BUTTONS ================= */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 my-1">
        {/* Shuffle Button */}
        <button
          type="button"
          onClick={onToggleShuffle}
          className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 ${
            isShuffle
              ? 'bg-[#401217]/70 shadow-[0_0_15px_rgba(143,29,44,0.6)] border border-[#b82d3e]/50'
              : 'hover:bg-[#201518]/50 opacity-70 hover:opacity-100'
          }`}
          title={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
          aria-label="Modo aleatorio"
        >
          <img
            src="/img/shuffle.png"
            alt="Shuffle"
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow"
            draggable={false}
          />
          {isShuffle && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#edd19c] shadow-[0_0_4px_#edd19c]" />
          )}
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onPrev}
          className="relative p-1.5 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer group"
          title="Pista anterior"
          aria-label="Pista anterior"
        >
          <img
            src="/img/back.png"
            alt="Anterior"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md group-hover:drop-shadow-[0_4px_8px_rgba(143,29,44,0.5)]"
            draggable={false}
          />
        </button>

        {/* Play / Pause Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          type="button"
          onClick={onTogglePlay}
          className="relative p-1.5 rounded-full cursor-pointer focus:outline-none"
          title={isPlaying ? 'Pausar música' : 'Reproducir música'}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          <div className="absolute inset-0 rounded-full bg-[#8f1d2c]/25 blur-lg pointer-events-none" />
          <img
            src={isPlaying ? '/img/pause.png' : '/img/play.png'}
            alt={isPlaying ? 'Pausar' : 'Reproducir'}
            className="relative w-13 h-13 sm:w-15 sm:h-15 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)]"
            draggable={false}
          />
        </motion.button>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          className="relative p-1.5 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer group"
          title="Pista siguiente"
          aria-label="Pista siguiente"
        >
          <img
            src="/img/next.png"
            alt="Siguiente"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md group-hover:drop-shadow-[0_4px_8px_rgba(143,29,44,0.5)]"
            draggable={false}
          />
        </button>

        {/* Loop / Repeat Button (Only Repeat Song) */}
        <button
          type="button"
          onClick={onToggleLoop}
          className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 ${
            isLooping
              ? 'bg-[#401217]/70 shadow-[0_0_15px_rgba(143,29,44,0.6)] border border-[#b82d3e]/50 opacity-100'
              : 'hover:bg-[#201518]/50 opacity-70 hover:opacity-100'
          }`}
          title={isLooping ? 'Repetir canción activado (1)' : 'Activar repetición de canción'}
          aria-label={isLooping ? 'Repetir canción activado' : 'Activar repetición de canción'}
        >
          <img
            src="/img/loop.png"
            alt="Repetir canción"
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow"
            draggable={false}
          />
          {isLooping && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[12px] h-[12px] px-0.5 rounded-full bg-[#EEABC4] text-[#37000A] text-[8px] font-bold font-mono leading-none shadow-[0_0_4px_#EEABC4]">
              1
            </span>
          )}
        </button>
      </div>

      {/* ================= 3. SECONDARY CONTROLS (FLIP DISCO, VOLUMEN, CRACKLE) ================= */}
      <div className="w-full max-w-[480px] flex flex-wrap items-center justify-between gap-2 px-3 pt-2 pb-1 border-t border-[#29171b]/60 mt-1 text-xs text-[#a3928e]">
        {/* Flip Record Floating Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onFlipSide}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#291419] to-[#1c0e11] hover:from-[#3d1a22] hover:to-[#261317] border border-[#d4a366]/40 text-[#edd19c] shadow-md cursor-pointer transition-colors"
          title="Dar vuelta al vinilo 3D"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#edd19c]" />
          <span className="font-serif-vintage tracking-wider text-xs font-semibold">
            Voltear a Cara {activeSide === 'A' ? 'B' : 'A'}
          </span>
        </motion.button>

        {/* Vinyl Crackle Ambience Toggle */}
        <button
          type="button"
          onClick={onToggleCrackle}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            isCrackleEnabled
              ? 'bg-[#3b151b]/70 border-[#b82d3e]/50 text-[#edd19c]'
              : 'bg-[#150d10] border-[#29191d] text-[#6b5c59] hover:text-[#998682]'
          }`}
          title="Efecto de aguja y crepitar de vinilo auténtico"
        >
          <Radio className="w-3 h-3" />
          <span className="text-[11px] tracking-wide">
            {isCrackleEnabled ? 'Crepitar Activo' : 'Crepitar Apagado'}
          </span>
        </button>

        {/* Volume Slider & Mute */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleMute}
            className="text-[#b09e99] hover:text-[#edd19c] transition-colors p-1"
            title={isMuted ? 'Desmutear' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#8f1d2c]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-[#8f1d2c] h-1 bg-[#251518] rounded-lg cursor-pointer"
            aria-label="Control de volumen"
          />
        </div>
      </div>
    </div>
  );
}
