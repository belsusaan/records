import React from 'react';
import { motion } from 'framer-motion';
import CircularText from './CircularText';

export default function Vinyl3D({
  activeSide = 'A',
  isPlaying = false,
  currentTrack,
  onFlip,
  className = '',
}) {
  const isFlipped = activeSide === 'B';

  return (
    <div className={`relative perspective-1000 select-none ${className}`}>
      {/* 3D Flip Container */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.9,
          ease: [0.34, 1.3, 0.64, 1], // bouncy nostalgic flip
        }}
        className="w-full h-full relative transform-style-preserve-3d"
      >
        {/* ================= SIDE A (FRONT) ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center">
          {/* Continuous Vinyl Spin Container */}
          <div
            className={`w-full h-full relative rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
              isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin animate-vinyl-spin-paused'
            }`}
          >
            {/* Hand-painted Record Image */}
            <img
              src="/img/record.png"
              alt="Vinilo Artesanal - Lado A"
              className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
              draggable={false}
            />

            {/* Vinyl Groove Sheen Highlights */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_35%,rgba(255,255,255,0.09)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_65%_65%,rgba(255,255,255,0.06)_0%,transparent_50%)] pointer-events-none" />

            {/* Center Label / Galleta (Side A) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[44%] h-[44%] rounded-full bg-gradient-to-br from-[#8a1928] via-[#61101b] to-[#3a060e] border-[3px] border-[#d4a366]/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_4px_14px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center overflow-hidden">
                {/* Concentric rings on label */}
                <div className="absolute inset-2 rounded-full border border-[#d4a366]/25" />
                <div className="absolute inset-5 rounded-full border border-[#d4a366]/20" />

                {/* ReactBits Circular Text - Side A */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <CircularText
                    text="• SIDE A • CANCIONES ESPECIALES •"
                    spinDuration={16}
                    radius={58}
                    fontSize={10.5}
                    letterSpacing="3.5px"
                    color="#edd19c"
                  />
                </div>

                {/* Center Hole Spindle */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-[#0c0709] border-2 border-[#d4a366] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1e1316]" />
                </div>

                {/* Center Subtext */}
                <div className="relative z-10 mt-1 text-center px-2">
                  <span className="block text-[8px] sm:text-[9px] font-serif-vintage tracking-widest text-[#edd19c]/90 uppercase font-semibold">
                    LADO A
                  </span>
                  <span className="block text-[7px] text-[#f7ede2]/75 font-mono tracking-tighter truncate max-w-[80px]">
                    33 ⅓ RPM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SIDE B (REVERSE) ================= */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex items-center justify-center"
        >
          {/* Continuous Vinyl Spin Container */}
          <div
            className={`w-full h-full relative rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
              isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin animate-vinyl-spin-paused'
            }`}
          >
            {/* Hand-painted Record Image with alternate Amber-Sepia vintage hue */}
            <img
              src="/img/record.png"
              alt="Vinilo Artesanal - Lado B"
              className="w-full h-full object-contain pointer-events-none drop-shadow-2xl filter sepia-[0.35] brightness-[0.92] contrast-[1.1]"
              draggable={false}
            />

            {/* Vinyl Groove Sheen Highlights */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_35%,rgba(212,163,102,0.12)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_65%_65%,rgba(212,163,102,0.08)_0%,transparent_50%)] pointer-events-none" />

            {/* Center Label / Galleta (Side B) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[44%] h-[44%] rounded-full bg-gradient-to-br from-[#382618] via-[#24170d] to-[#140b06] border-[3px] border-[#d4a366]/70 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_4px_14px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center overflow-hidden">
                {/* Concentric rings on label */}
                <div className="absolute inset-2 rounded-full border border-[#d4a366]/30" />
                <div className="absolute inset-5 rounded-full border border-[#d4a366]/20" />

                {/* ReactBits Circular Text - Side B */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <CircularText
                    text="• SIDE B • LADO B Y RECUERDOS •"
                    spinDuration={16}
                    radius={58}
                    fontSize={10.5}
                    letterSpacing="3.5px"
                    color="#edd19c"
                  />
                </div>

                {/* Center Hole Spindle */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-[#0e0a07] border-2 border-[#d4a366] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#2a1a10]" />
                </div>

                {/* Center Subtext */}
                <div className="relative z-10 mt-1 text-center px-2">
                  <span className="block text-[8px] sm:text-[9px] font-serif-vintage tracking-widest text-[#edd19c] uppercase font-semibold">
                    LADO B
                  </span>
                  <span className="block text-[7px] text-[#f7ede2]/75 font-mono tracking-tighter truncate max-w-[80px]">
                    33 ⅓ RPM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
