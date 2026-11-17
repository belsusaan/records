import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Disc3, ArrowRightLeft, Music } from 'lucide-react';

/**
 * SideAEndedModal — Modal que aparece al terminar todas las canciones del Lado A.
 * Detiene la música e invita a dar la vuelta al vinilo para escuchar el Lado B.
 *
 * Paleta: #92374D (Vintage Berry), #EEABC4 (Soft Blush), #37000A (Deep Wine), #F4F1DE (Vanilla Cream)
 * Tipografías: Butterfly Kids & Dongle
 */
export default function SideAEndedModal({ isOpen, onClose, onFlipToSideB }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none">
        {/* ── Ambient glow ── */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] pointer-events-none rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(146,55,77,0.4) 0%, rgba(238,171,196,0.12) 50%, transparent 75%)',
            filter: 'blur(50px)',
          }}
        />

        {/* ── Modal Card ── */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md sm:max-w-lg rounded-3xl sm:rounded-[40px] bg-[#92374D] border-2 border-[#37000A]/40 shadow-[0_25px_60px_rgba(55,0,10,0.6),0_0_50px_rgba(146,55,77,0.35)] p-6 sm:p-8 text-center text-[#F4F1DE] overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#37000A]/50 text-[#EEABC4] hover:text-[#F4F1DE] transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── Animated Vinyl Disc that can be tapped to flip ── */}
          <div
            onClick={onFlipToSideB}
            className="relative mx-auto mb-3 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center cursor-pointer group"
            title="Toca el disco para voltear al Lado B"
          >
            {/* Pulsing halo */}
            <div className="absolute inset-0 rounded-full bg-[#EEABC4]/20 blur-md group-hover:bg-[#EEABC4]/40 transition-all duration-300" />

            {/* Rotating Record */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#0a0a0a] border-2 border-[#37000A]/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300"
            >
              {/* Organic record image */}
              <img
                src="/img/record.png"
                alt="Vinilo"
                className="w-full h-full object-contain pointer-events-none drop-shadow"
                draggable={false}
              />
            </motion.div>

            {/* Flip badge over record */}
            <div className="absolute -bottom-1 -right-1 px-3 py-1 rounded-full bg-[#37000A] border-2 border-[#EEABC4]/60 text-[#EEABC4] font-dongle text-xl font-bold flex items-center gap-1.5 shadow-lg group-hover:scale-110 group-hover:bg-[#EEABC4] group-hover:text-[#37000A] transition-all">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Lado B</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#EEABC4] animate-pulse" />
            <h2 className="text-4xl sm:text-5xl font-butterfly tracking-wide text-[#F4F1DE] drop-shadow-sm leading-tight">
              Lado A terminado
            </h2>
            <Sparkles className="w-5 h-5 text-[#EEABC4] animate-pulse" />
          </div>

          <p className="font-dongle text-2xl sm:text-3xl text-[#EEABC4] leading-snug">
            Has completado las primeras 16 canciones de tu vinilo.
          </p>

          {/* Main instruction box */}
          <div
            onClick={onFlipToSideB}
            className="p-4 sm:p-5 rounded-2xl bg-[#37000A]/75 border border-[#EEABC4]/25 text-center my-4 shadow-inner cursor-pointer hover:border-[#EEABC4]/60 transition-all group"
          >
            <p className="font-dongle text-3xl sm:text-4xl text-[#F4F1DE] font-bold leading-tight tracking-wide group-hover:text-[#EEABC4] transition-colors">
              Toca el disco para cambiar al Lado B
            </p>
            <p className="font-dongle text-xl sm:text-2xl text-[#EEABC4]/90 leading-tight mt-1">
              Dale la vuelta para descubrir las 15 canciones de la otra mitad.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(238,171,196,0.5)' }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onFlipToSideB}
              className="w-full flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl bg-[#EEABC4] hover:bg-[#F4F1DE] text-[#37000A] font-dongle text-3xl font-bold tracking-wide transition-all duration-200 shadow-[0_10px_25px_rgba(55,0,10,0.4)] cursor-pointer leading-none"
            >
              <ArrowRightLeft className="w-5 h-5 stroke-[2.5]" />
              <span>Voltear al Lado B</span>
            </motion.button>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-2xl font-dongle text-[#EEABC4] hover:text-[#F4F1DE] cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
