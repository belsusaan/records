import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from './hooks/useAudio';
import WordImageIntro from './components/WordImageIntro';
import TurntableCard from './components/TurntableCard';
import LyricsBooklet from './components/LyricsBooklet';

export default function App() {
  const [isGiftOpened, setIsGiftOpened] = useState(false);

  const {
    activeSide,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playAudio,
    pauseAudio,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    flipSide,
    isLooping,
    toggleLoop,
    isShuffle,
    toggleShuffle,
  } = useAudio();

  const handleOpenGift = () => {
    setIsGiftOpened(true);
    setTimeout(() => {
      playAudio();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#1b0e0e] text-white font-butterfly relative overflow-x-hidden flex flex-col justify-center items-center selection:bg-[#72a5f8] selection:text-white p-4 sm:p-8">
      {/* ================= PANTALLA 1: INTRO CON PALABRAS ================= */}
      <WordImageIntro
        isOpen={isGiftOpened}
        onOpen={handleOpenGift}
      />

      {/* ================= PANTALLA 2: TOCADISCOS ================= */}
      <main className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-center my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center justify-center w-full">
          {/* ================= 1. IZQUIERDA: TARJETA AZUL DEL TOCADISCOS ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center lg:col-span-7"
          >
            <TurntableCard
              activeSide={activeSide}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              onTogglePlay={togglePlay}
              onNext={nextTrack}
              onPrev={prevTrack}
              isLooping={isLooping}
              onToggleLoop={toggleLoop}
              isShuffle={isShuffle}
              onToggleShuffle={toggleShuffle}
              onFlipSide={flipSide}
            />
          </motion.div>

          {/* ================= 2. DERECHA: PANEL DE LETRAS ================= */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full flex justify-center lg:justify-start lg:col-span-5"
          >
            <LyricsBooklet
              track={currentTrack}
              currentTime={currentTime}
              onSeek={seek}
              className="w-full"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
