import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3, Smartphone, Laptop, Music2, AlertCircle } from 'lucide-react';

/**
 * InstructionsModal — Cuadro con el mismo UI del sitio para dar instrucciones
 * antes de entrar a la pantalla de inicio (la carta/imagen).
 *
 * Paleta: #92374D, #EEABC4, #1C3041, #F4F1DE, #37000A
 * Tipografías: Butterfly Kids & Dongle
 */
export default function InstructionsModal({ isOpen, onConfirm }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="instructions-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.35 } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-y-auto"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #fbe3eb 0%, #EEABC4 65%, #d98aa3 100%)',
        }}
      >
        {/* ── Ambient grain texture ── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* ── Vintage Berry center glow (#92374D) ── */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(146,55,77,0.25) 0%, rgba(238,171,196,0.08) 50%, transparent 75%)',
            filter: 'blur(60px)',
          }}
        />

        {/* ── Instructions Card (#92374D Vintage Berry Base) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md sm:max-w-lg rounded-3xl sm:rounded-[40px] bg-[#92374D]/95 p-7 sm:p-9 shadow-[0_25px_60px_rgba(55,0,10,0.5),0_0_50px_rgba(146,55,77,0.25)] text-center backdrop-blur-xl border border-[#37000A]/30"
        >
          {/* Animated Vinyl Icon with Device Badge */}
          <div className="relative mx-auto mb-4 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#0a0a0a] border-2 border-[#37000A]/50 shadow-[0_0_25px_rgba(146,55,77,0.3)] flex items-center justify-center p-2"
            >
              <div className="w-full h-full rounded-full border border-[#F4F1DE]/15 flex items-center justify-center bg-[radial-gradient(circle,#EEABC4_0%,#92374D_70%,#37000A_100%)] shadow-inner">
                <Disc3 className="w-9 h-9 sm:w-10 sm:h-10 text-[#F4F1DE]/90 animate-pulse" />
              </div>
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#37000A] text-[#EEABC4] flex items-center justify-center shadow-lg border-2 border-[#92374D]">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl text-[#F4F1DE] font-butterfly tracking-wide mb-2 drop-shadow-sm leading-tight">
            Antes de entrar
          </h1>

          {/* Main instruction box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#37000A]/70 border border-[#EEABC4]/20 text-center my-4 shadow-inner">
            <p className="font-dongle text-3xl sm:text-4xl text-[#F4F1DE] font-bold leading-tight tracking-wide">
              Abre Spotify en tu teléfono/computadora y no lo cierres
            </p>
          </div>

          {/* Note: small note for sync and rewinding first track */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#37000A]/40 border border-[#EEABC4]/15 text-center mb-6">
            <p className="font-dongle text-2xl sm:text-2xl text-[#EEABC4] leading-tight tracking-wide">
              <span className="font-bold text-[#F4F1DE]">Nota:</span> Si la canción está desincronizada, específicamente la primera, ponle pausa y atrésala completa.
            </p>
          </div>

          {/* Confirm Button: "entendido" */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(238,171,196,0.45)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            type="button"
            className="w-full py-3 px-8 rounded-2xl bg-[#EEABC4] hover:bg-[#F4F1DE] text-[#37000A] font-dongle text-3xl sm:text-4xl font-bold tracking-wide transition-all duration-200 shadow-[0_10px_25px_rgba(55,0,10,0.35)] cursor-pointer leading-none"
          >
            Entendido
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
