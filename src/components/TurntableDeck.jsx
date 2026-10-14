import React from 'react';
import { motion } from 'framer-motion';
import Vinyl3D from './Vinyl3D';
import TurntableArm from './TurntableArm';

export default function TurntableDeck({
  activeSide,
  isPlaying,
  currentTrack,
  progress,
  onFlipSide,
  className = '',
}) {
  return (
    <div
      className={`relative w-full max-w-[480px] sm:max-w-[500px] aspect-[1/1] sm:aspect-[1.05/1] rounded-3xl p-5 sm:p-7 flex items-center justify-center bg-gradient-to-br from-[#1d1316] via-[#140b0e] to-[#0c0709] border-2 border-[#3d1a22] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_60px_rgba(143,29,44,0.18)] ${className}`}
    >
      {/* Wood / Leather Cabinet Bevel & Brass Corners */}
      <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-[#d4a366]/20 pointer-events-none" />
      
      {/* Brass Decorative Screws */}
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

      {/* Turntable Platter Base (Recessed circular well) */}
      <div className="relative w-[84%] aspect-square rounded-full bg-gradient-to-br from-[#120b0d] to-[#070405] border-4 border-[#241317] shadow-[inset_0_15px_30px_rgba(0,0,0,0.95),0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center">
        {/* Rubber / Felt Slipmat Pattern */}
        <div className="absolute inset-4 rounded-full border border-[#d4a366]/10 pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-[#8f1d2c]/10 pointer-events-none" />

        {/* 3D Vinyl Component */}
        <div className="w-full h-full p-2">
          <Vinyl3D
            activeSide={activeSide}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            onFlip={onFlipSide}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Tonearm Assembly (Positioned over platter) */}
      <TurntableArm
        isPlaying={isPlaying}
        progress={progress}
      />

      {/* Vintage Metal Nameplate at bottom left */}
      <div className="absolute bottom-4 left-7 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-gradient-to-r from-[#211417] to-[#170c0f] border border-[#d4a366]/30 shadow-inner pointer-events-none">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]' : 'bg-[#732a32]'}`} />
        <span className="text-[9px] font-serif-vintage tracking-widest text-[#edd19c] uppercase font-semibold">
          SERIES NOSTALGIA • 33 ⅓ RPM
        </span>
      </div>

      {/* Side Indicator Badge at bottom right */}
      <div className="absolute bottom-4 right-7 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#211417] border border-[#8f1d2c]/40 text-[10px] font-mono tracking-wider text-[#d4a366] pointer-events-none">
        <span>CARA ACTIVA:</span>
        <span className="font-bold text-[#fff0f2]">{activeSide}</span>
      </div>
    </div>
  );
}
