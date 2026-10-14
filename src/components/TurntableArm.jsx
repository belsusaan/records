import React from 'react';
import { motion } from 'framer-motion';

export default function TurntableArm({
  isPlaying = false,
  progress = 0, // 0 to 1
  className = '',
}) {
  // Base pivot angle:
  // - Rest angle: 0deg (off record on arm rest)
  // - Playing angle: smoothly advances from 20deg to 26deg as track progresses
  const targetRotation = isPlaying ? 20 + progress * 6 : 0;

  return (
    <div
      className={`absolute pointer-events-none select-none z-30 ${className}`}
      style={{
        top: '2%',
        right: '2%',
        width: '36%',
        height: '96%',
      }}
    >
      {/* Tonearm Arm Rest Base Clip (holds the arm when paused) */}
      <div
        className="absolute w-3.5 h-6 rounded-sm bg-[#1e1316] border border-[#d4a366]/30 shadow-md"
        style={{
          top: '22%',
          left: '38%',
          transform: 'translate(-50%, -50%) rotate(4deg)',
        }}
      />

      {/* Animated Rotating Arm */}
      <motion.div
        animate={{
          rotate: targetRotation,
          y: isPlaying ? 2 : 0,
        }}
        transition={{
          rotate: {
            duration: isPlaying ? 1.2 : 0.85,
            ease: [0.25, 1, 0.5, 1],
          },
          y: { duration: 0.3 },
        }}
        style={{
          transformOrigin: '44% 8%',
          width: '100%',
          height: '100%',
        }}
        className="relative"
      >
        <img
          src="/img/aguja.png"
          alt="Aguja del tocadiscos"
          className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)]"
          draggable={false}
        />

        {/* Small ruby LED indicator on cartridge stylus */}
        <div
          className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-500 ${
            isPlaying
              ? 'bg-[#ff223e] shadow-[0_0_8px_#ff223e] opacity-95'
              : 'bg-[#5c1c24] opacity-25'
          }`}
          style={{
            bottom: '12%',
            left: '28%',
          }}
        />
      </motion.div>

      {/* Tonearm Tonearm Pivot Housing Base (Centered exactly over pivot 44% 8%) */}
      <div
        className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#2a1e22] via-[#1a1215] to-[#0c0809] border border-[#d4a366]/50 shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.15)] flex items-center justify-center pointer-events-none"
        style={{
          top: '8%',
          left: '44%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Brass gimbal pivot cap with screw detail */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#916b39] via-[#d4a366] to-[#edd19c] shadow-md border border-[#523d20] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1b120c]" />
        </div>
      </div>
    </div>
  );
}
