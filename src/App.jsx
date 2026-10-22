import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from './hooks/useAudio';
import WordImageIntro from './components/WordImageIntro';
import TurntableCard from './components/TurntableCard';
import LyricsBooklet from './components/LyricsBooklet';
import SpotifyGate from './components/SpotifyGate';
import SpotifyModal from './components/SpotifyModal';
import {
  handleSpotifyRedirect,
  isSpotifyAuthenticated,
  spotifyGetUserProfile,
} from './services/spotify';

export default function App() {
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [isSpotifyAuth, setIsSpotifyAuth] = useState(isSpotifyAuthenticated());
  const [spotifyUser, setSpotifyUser] = useState(null);

  // Check Spotify OAuth redirect on load
  useEffect(() => {
    async function processSpotifyAuth() {
      const token = await handleSpotifyRedirect();
      if (token || isSpotifyAuthenticated()) {
        setIsSpotifyAuth(true);
        // Do NOT skip the paper intro: user will see the paper crumple now that they are authenticated!
        try {
          const profile = await spotifyGetUserProfile();
          if (profile?.display_name) {
            setSpotifyUser(profile.display_name);
          }
        } catch (e) {
          console.log('Error fetching Spotify profile:', e);
        }
      }
    }
    processSpotifyAuth();
  }, []);

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
    isSpotifyLive,
  } = useAudio();

  const handleOpenGift = () => {
    setIsGiftOpened(true);
    setTimeout(() => {
      playAudio();
    }, 600);
  };

  const handleDisconnect = () => {
    setIsSpotifyAuth(false);
    setSpotifyUser(null);
    setIsGiftOpened(false);
  };

  // ================= PASO 0: BLOQUEO OBLIGATORIO DE SPOTIFY =================
  // Si no está autenticado en Spotify, se muestra ÚNICAMENTE la pantalla de acceso
  if (!isSpotifyAuth) {
    return <SpotifyGate onAuthSuccess={() => setIsSpotifyAuth(true)} />;
  }

  // ================= PASO 1 Y 2: CARTA DE PAPEL Y TOCADISCOS =================
  return (
    <div className="min-h-screen bg-[#EEABC4] text-[#37000A] relative overflow-x-hidden flex flex-col justify-center items-center selection:bg-[#92374D] selection:text-[#F4F1DE] p-4 sm:p-8">
      {/* ── Ambient Background Vignette (#EEABC4 Soft Blush Glow) ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(255,235,243,0.4) 0%, rgba(238,171,196,0.95) 65%, #d98aa3 100%)',
        }}
      />

      {/* ================= PANTALLA 1: INTRO CON CARTA DE PAPEL ================= */}
      <WordImageIntro
        isOpen={isGiftOpened}
        onOpen={handleOpenGift}
      />

      {/* ================= PANTALLA 2: TOCADISCOS Y LETRAS ================= */}
      {isGiftOpened && (
        <main className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-center my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center justify-center w-full">
            {/* ================= 1. IZQUIERDA: TARJETA DEL TOCADISCOS (#1C3041) ================= */}
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

            {/* ================= 2. DERECHA: PANEL DE LETRAS SINCRONIZADAS ================= */}
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
      )}

      {/* ================= SPOTIFY ACCOUNT PILL (SOLO EN EL REPRODUCTOR) ================= */}
      {isGiftOpened && (
        <button
          type="button"
          onClick={() => setShowSpotifyModal(true)}
          className="fixed top-4 right-4 z-40 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1C3041]/90 hover:bg-[#1C3041] border border-[#92374D]/50 backdrop-blur-md transition-all cursor-pointer shadow-lg group"
          title="Cuenta de Spotify conectada"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#1db954] shadow-[0_0_8px_#1db954]" />
          <span className="text-[#F4F1DE] text-2xl font-dongle tracking-wide leading-none">
            {spotifyUser || 'Spotify Conectado'}
          </span>
        </button>
      )}

      <SpotifyModal
        isOpen={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
        isConnected={isSpotifyAuth}
        spotifyUser={spotifyUser}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
