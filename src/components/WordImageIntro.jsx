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
  const [transitioning, setTransitioning] = useState(false);

  const handleStateChange = useCallback(
    (state) => {
      if (transitioning || isOpen) return;

      if (state === 'crumpled') {
        setTransitioning(true);
        // Small delay so user sees the crumpled ball before transition
        setTimeout(() => {
          onOpen();
        }, 700);
      }
    },
    [transitioning, isOpen, onOpen]
  );

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="letter-intro"
          initial={false}
          animate={{ opacity: 1 }}
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

          {/* ────────────────────────────────────────── */}
          {/* THE PAPER CRUMPLE — full WebGL interactive */}
          {/* ────────────────────────────────────────── */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full flex items-center justify-center"
            style={{ maxWidth: 700 }}
          >
            <PaperCrumple
              src="/img/letter.png"
              backSrc="/img/bg.png"
              alt="Carta: For the record, i love you more"
              width={560}
              height={420}
              sceneHeight={520}
              imageFit="contain"
              releaseBehavior="stay"
              crumpleAmount={1}
              crumpleDuration={2.2}
              releaseDuration={0.45}
              foldCount={7}
              foldSharpness={0.65}
              wrinkleDepth={0.8}
              creaseStrength={0.2}
              paperColor="#f2ece1"
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
