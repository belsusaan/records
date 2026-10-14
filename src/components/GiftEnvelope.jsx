import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Music, Heart, Gift } from 'lucide-react';
import { playNeedleDropSFX } from '../audio/proceduralAudio';

export default function GiftEnvelope({ isOpen, onOpen, onReSeal }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleSealClick = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    // Play tactile sound
    playNeedleDropSFX();

    // Trigger celebratory nostalgic confetti burst
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8f1d2c', '#d4a366', '#f3d9b1', '#400c14', '#ffffff'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.1,
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    // Allow seal crack animation before full opening
    setTimeout(() => {
      onOpen();
      setIsOpening(false);
    }, 900);
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="envelope-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.08,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0607]/95 backdrop-blur-md"
        >
          {/* Subtle vintage vignette & grain background */}
          <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />

          {/* Main Album Gift Sleeve / Envelope Container */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="relative w-full max-w-[540px] aspect-[1/1] sm:aspect-[4/4] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_80px_rgba(143,29,44,0.25)] border border-[#3d1a21]/60 bg-gradient-to-br from-[#1a1114] via-[#120a0d] to-[#0c0709] overflow-hidden"
          >
            {/* Vintage textured borders and corner gold foil brackets */}
            <div className="absolute inset-3 rounded-xl border border-[#d4a366]/20 pointer-events-none" />
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#d4a366]/50 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#d4a366]/50 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#d4a366]/50 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#d4a366]/50 rounded-br-sm pointer-events-none" />

            {/* Album Header Foil Stamp */}
            <div className="relative text-center pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase bg-[#2e1217]/80 text-[#edd19c] border border-[#d4a366]/30 mb-2">
                <Gift className="w-3.5 h-3.5 text-[#d4a366]" />
                Edición de Colección • Para Ti
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-vintage tracking-wider text-[#f5eae3] drop-shadow-md">
                Un Vinilo Especial
              </h2>
              <p className="text-xs sm:text-sm text-[#b09e99] font-serif-vintage italic mt-0.5">
                Prensado a mano con recuerdos y melodías
              </p>
            </div>

            {/* Decorative Ribbon Cross */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 bg-gradient-to-r from-transparent via-[#450e17]/40 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-14 bg-gradient-to-b from-transparent via-[#450e17]/40 to-transparent pointer-events-none" />

            {/* Interactive Wax Seal / Sello de Lacre */}
            <div className="relative my-auto flex flex-col items-center z-10">
              <motion.button
                id="interactive-wax-seal"
                type="button"
                onClick={handleSealClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={
                  isOpening
                    ? { scale: [1, 1.25, 0.2], rotate: [0, -15, 45], opacity: [1, 1, 0] }
                    : isHovered
                    ? { scale: 1.08, rotate: [0, -3, 3, 0] }
                    : { scale: [1, 1.02, 1] }
                }
                transition={
                  isOpening
                    ? { duration: 0.8, ease: 'easeInOut' }
                    : { repeat: isHovered ? 0 : Infinity, duration: 3.5 }
                }
                className="relative group cursor-pointer focus:outline-none"
                aria-label="Abrir sello del regalo musical"
              >
                {/* Wax seal glow pulse */}
                <div className="absolute -inset-3 rounded-full bg-[#8f1d2c]/40 blur-xl group-hover:bg-[#b82d3e]/60 transition-all duration-500 animate-pulse" />

                {/* Wax stamp body */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#9c1e2f] via-[#751421] to-[#400810] shadow-[0_12px_30px_rgba(0,0,0,0.8),inset_0_4px_8px_rgba(255,255,255,0.2),inset_0_-6px_12px_rgba(0,0,0,0.6)] border-4 border-[#52111a] flex items-center justify-center p-2">
                  {/* Organic wax irregular edge simulation */}
                  <div className="absolute -inset-1 rounded-full border border-[#b82d3e]/30 pointer-events-none" />

                  {/* Inner stamped brass/wax coin */}
                  <div className="w-full h-full rounded-full border-2 border-dashed border-[#d4a366]/40 flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-[#7d1725] to-[#480a13] shadow-inner">
                    <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#f7d6a5] fill-[#f7d6a5]/30 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    <span className="text-[10px] sm:text-[11px] font-serif-vintage tracking-widest text-[#edd19c] font-bold mt-1 uppercase">
                      Abrir Regalo
                    </span>
                  </div>
                </div>

                {/* Ribbon tails hanging from seal */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 pointer-events-none">
                  <div className="w-3 h-8 bg-gradient-to-b from-[#751421] to-[#3a070f] -rotate-12 rounded-b-sm shadow-md" />
                  <div className="w-3 h-8 bg-gradient-to-b from-[#751421] to-[#3a070f] rotate-12 rounded-b-sm shadow-md" />
                </div>
              </motion.button>

              {/* Instructional label below seal */}
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="mt-8 text-center"
              >
                <p className="text-xs sm:text-sm font-handwriting text-[#edd19c] text-lg tracking-wider">
                  ✦ Toca el sello de cera para romper el lacre y reproducir ✦
                </p>
              </motion.div>
            </div>

            {/* Album Footer Note */}
            <div className="relative text-center pb-1">
              <p className="text-[11px] text-[#7d6f6c] tracking-widest uppercase">
                Hecho a mano con amor • Lado A & Lado B
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
