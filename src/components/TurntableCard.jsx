import React from 'react';
import { motion } from 'framer-motion';
import Vinyl3D from './Vinyl3D';
import TurntableArm from './TurntableArm';
import CustomControls from './CustomControls';
import { Disc, Sparkles } from 'lucide-react';

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
  volume,
  onChangeVolume,
  isMuted,
  onToggleMute,
  isCrackleEnabled,
  onToggleCrackle,
  onFlipSide,
  className = '',
}) {
  const progressFraction = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      className={`relative w-full max-w-[540px] rounded-3xl p-5 sm:p-7 flex flex-col items-center bg-gradient-to-b from-[#141b24] via-[#0f161f] to-[#090d13] border-2 border-[#2b3c50]/75 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(35,55,80,0.25)] ${className}`}
    >
      {/* Decorative brass corner screws & subtle blue-tinted inner glow */}
      <div className="absolute inset-2.5 rounded-2xl border border-[#4a6b8c]/25 pointer-events-none" />
      <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#916b39] to-[#edd19c] border border-[#523d20] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-0.5 bg-[#2b1b11] rotate-45" />
      </div>
      <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#916b39] to-[#edd19c] border border-[#523d20] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-0.5 bg-[#2b1b11] -rotate-12" />
      </div>
      <div className="absolute bottom-4 left-4 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#916b39] to-[#edd19c] border border-[#523d20] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-0.5 bg-[#2b1b11] rotate-90" />
      </div>
      <div className="absolute bottom-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#916b39] to-[#edd19c] border border-[#523d20] shadow-md flex items-center justify-center pointer-events-none">
        <div className="w-2 h-0.5 bg-[#2b1b11] -rotate-45" />
      </div>

      {/* ================= 1. TURNTABLE PLATTER & OVERLAID ARM ================= */}
      <div className="relative w-full max-w-[420px] aspect-square rounded-full bg-gradient-to-br from-[#0c1117] to-[#05070a] border-4 border-[#1c2734] shadow-[inset_0_15px_30px_rgba(0,0,0,0.95),0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center mb-3">
        {/* Felt Slipmat Pattern */}
        <div className="absolute inset-4 rounded-full border border-[#4a6b8c]/15 pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-[#8f1d2c]/15 pointer-events-none" />

        {/* 3D Vinyl Record */}
        <div className="w-full h-full p-2">
          <Vinyl3D
            activeSide={activeSide}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            onFlip={onFlipSide}
            className="w-full h-full"
          />
        </div>

        {/* Hand-painted Tonearm (aguja.png) overlaid on turntable */}
        <TurntableArm
          isPlaying={isPlaying}
          progress={progressFraction}
        />

        {/* Small speed indicator badge */}
        <div className="absolute bottom-2 left-6 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0e141c]/90 border border-[#2b3d52]/50 text-[9px] font-mono text-[#8fa7c4] pointer-events-none shadow-sm">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]' : 'bg-[#3b4c5e]'}`} />
          <span>33 ⅓ RPM</span>
        </div>
      </div>

      {/* ================= 2. TITLE & ARTIST DIRECTLY BENEATH TURNTABLE ================= */}
      <div className="text-center my-1 z-10 select-none">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#182330] text-[#a5c4e8] border border-[#2c4056]/60">
            Lado {activeSide} • {currentTrack?.trackNumber || 'Pista'}
          </span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-[10px] font-serif-vintage tracking-wider text-[#edd19c] animate-pulse">
              <Sparkles className="w-3 h-3 text-[#d4a366]" /> En reproducción
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-serif-vintage font-bold tracking-wide text-[#f5ebe2] leading-tight drop-shadow-md">
          {currentTrack?.title}
        </h2>
        <p className="font-butterfly text-2xl sm:text-3xl text-[#edd19c] leading-none mt-0.5">
          {currentTrack?.artist}
        </p>
      </div>

      {/* ================= 3. PROGRESS BAR (AVANCE.PNG) & CONTROLS ================= */}
      <div className="w-full mt-1">
        <CustomControls
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onNext={onNext}
          onPrev={onPrev}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          isLooping={isLooping}
          onToggleLoop={onToggleLoop}
          isShuffle={isShuffle}
          onToggleShuffle={onToggleShuffle}
          volume={volume}
          onChangeVolume={onChangeVolume}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          isCrackleEnabled={isCrackleEnabled}
          onToggleCrackle={onToggleCrackle}
          activeSide={activeSide}
          onFlipSide={onFlipSide}
        />
      </div>
    </div>
  );
}
