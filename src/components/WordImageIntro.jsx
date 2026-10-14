import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PaperCrumple from './PaperCrumple';

/**
 * WordImageIntro — Pantalla de inicio con carta artesanal interactiva.
 *
 * La carta (letter.png) usa el componente PaperCrumple de ReactBits.
 * El usuario la sostiene y arrastra para arrugarla.
 * Cuando la suelta completamente arrugada → se abre el reproductor.
 *
 * Fondo oscuro con las imágenes de palabras flotando en el fondo como atmósfera.
 */
export default function WordImageIntro({ isOpen, onOpen }) {
  const [crumpleCount, setCrumpleCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const handleStateChange = useCallback(
    (state) => {
      if (transitioning || isOpen) return;

      if (state === 'crumpled') {
        // Increment crumple count — after 1 full crumple, open the player
        setCrumpleCount((prev) => {
          const next = prev + 1;
          if (next >= 1) {
            setTransitioning(true);
            // Small delay so user sees the crumpled ball before transition
            setTimeout(() => {
              onOpen();
            }, 600);
          }
          return next;
        });
      }
    },
    [transitioning, isOpen, onOpen]
  );

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="letter-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6 } }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.5, ease: [0.4, 0, 1, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, #1f0d0d 0%, #0a0506 60%, #030103 100%)',
          }}
        >
          {/* ── Ambient grain texture ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />

          {/* ── Crimson center glow ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(143,29,44,0.15) 0%, transparent 70%)',
            }}
          />

          {/* ── Hint text at top ── */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: transitioning ? 0 : [0, 0.7, 0.7, 0], y: 0 }}
            transition={
              transitioning
                ? { duration: 0.2 }
                : {
                    delay: 1.8,
                    duration: 3.5,
                    times: [0, 0.15, 0.85, 1],
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }
            }
            className="absolute top-8 sm:top-10 font-butterfly text-[#d4a366]/70 text-sm sm:text-base tracking-widest uppercase select-none pointer-events-none"
          >
            ✦ sostén y arrastra para arrugar ✦
          </motion.p>

          {/* ────────────────────────────────────────── */}
          {/* THE PAPER CRUMPLE — full WebGL interactive */}
          {/* ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full flex items-center justify-center"
            style={{ maxWidth: 700 }}
          >
            <PaperCrumple
              src="/img/letter.png"
              alt="Carta: For the record, i love you more"
              width={560}
              height={420}
              sceneHeight={520}
              imageFit="contain"
              releaseBehavior="stay"
              crumpleAmount={1}
              crumpleDuration={0.45}
              releaseDuration={0.35}
              foldCount={7}
              foldSharpness={0.65}
              wrinkleDepth={0.8}
              creaseStrength={0.2}
              paperColor="#e8e0d8"
              roughness={0.88}
              paperTexture={0.12}
              lightIntensity={2.0}
              lightAngle={-30}
              shadow={true}
              shadowOpacity={0.18}
              draggable={true}
              dragRotation={12}
              dragRadius={220}
              returnToOrigin={false}
              rotation={-2}
              seed={42}
              detail={72}
              disabled={transitioning}
              onStateChange={handleStateChange}
              onError={(err) => console.warn('PaperCrumple error:', err)}
              className="w-full"
            />
          </motion.div>

          {/* ── Bottom hint ── */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: transitioning ? 0 : 1, y: 0 }}
            transition={transitioning ? { duration: 0.2 } : { delay: 0.8, duration: 0.6 }}
            className="absolute bottom-8 sm:bottom-10 font-butterfly text-[#edd19c]/60 text-base sm:text-xl tracking-wide select-none pointer-events-none"
          >
            {crumpleCount === 0
              ? '♥ una carta para ti ♥'
              : '✦ sigue arrugando... ✦'}
          </motion.p>

          {/* ── Transition overlay flash ── */}
          <AnimatePresence>
            {transitioning && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 0.5, times: [0, 0.3, 1] }}
                className="absolute inset-0 bg-[#8f1d2c] pointer-events-none"
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
