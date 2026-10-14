import React from 'react';
import { motion } from 'framer-motion';

/**
 * Vinyl3D with ReactBits FlipCard micro-interaction
 * (https://reactbits.dev/micro/flip-card)
 * Pure hand-painted record without artificial center label.
 * Clicking the vinyl triggers the smooth 3D flip card animation.
 */
export default function Vinyl3D({
  activeSide = 'A',
  isPlaying = false,
  onFlip,
  className = '',
}) {
  const isFlipped = activeSide === 'B';

  const handleClick = (e) => {
    e.stopPropagation();
    if (onFlip) {
      onFlip();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full h-full cursor-pointer select-none [perspective:1000px] group ${className}`}
      title="Haz clic para dar la vuelta al disco (Flip Card)"
    >
      {/* 3D Flip Card Container (ReactBits FlipCard pattern) */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.75,
          ease: [0.23, 1, 0.32, 1], // ReactBits smooth micro spring easing
        }}
        className="w-full h-full relative [transform-style:preserve-3d]"
      >
        {/* ================= FRONT (SIDE A) ================= */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex items-center justify-center">
          {/* Vinyl Continuous Spin Container */}
          <div
            className={`w-full h-full relative rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.4)] ${
              isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin animate-vinyl-spin-paused'
            }`}
          >
            {/* Pure Hand-Painted Record (No artificial center label) */}
            <img
              src="/img/record.png"
              alt="Vinilo Artesanal"
              className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
              draggable={false}
            />

            {/* Subtle natural groove sheen */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_35%,rgba(255,255,255,0.08)_0%,transparent_50%)] pointer-events-none" />
          </div>
        </div>

        {/* ================= BACK (SIDE B) ================= */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center">
          {/* Vinyl Continuous Spin Container */}
          <div
            className={`w-full h-full relative rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.4)] ${
              isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin animate-vinyl-spin-paused'
            }`}
          >
            {/* Pure Hand-Painted Record - Side B organic tint */}
            <img
              src="/img/record.png"
              alt="Vinilo Artesanal - Lado B"
              className="w-full h-full object-contain pointer-events-none drop-shadow-xl filter sepia-[0.3] hue-rotate-[320deg] brightness-[0.94]"
              draggable={false}
            />

            {/* Subtle natural groove sheen */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_35%,rgba(255,255,255,0.08)_0%,transparent_50%)] pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
