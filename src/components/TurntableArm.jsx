import React from 'react';
import { motion } from 'framer-motion';

export default function TurntableArm({
  isPlaying = false,
  progress = 0, // 0 to 1
  className = '',
}) {
  // Base pivot angle:
  // - Rest angle: 0deg (off record)
  // - Playing angle: smoothly drops needle onto groove (20deg to 26deg)
  const targetRotation = isPlaying ? 21 + progress * 5.5 : 0;

  return (
    <div
      className={`absolute pointer-events-none select-none z-30 ${className}`}
      style={{
        top: '-4%',
        right: '4%',
        width: '42%',
        height: '106%',
      }}
    >
      {/* Animated Rotating Arm (Directly using hand-painted aguja.png with authentic painted pivot) */}
      <motion.div
        animate={{
          rotate: targetRotation,
          y: isPlaying ? 2 : 0,
        }}
        transition={{
          rotate: {
            duration: isPlaying ? 1.1 : 0.8,
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
          className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.4)]"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
