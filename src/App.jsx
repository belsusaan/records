import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Disc,
  Radio,
  Gift,
  PlusCircle,
  BookOpen,
  Volume2,
  Sparkles,
  Heart,
  Music2,
} from 'lucide-react';
import { useAudio } from './hooks/useAudio';
import GiftEnvelope from './components/GiftEnvelope';
import TurntableCard from './components/TurntableCard';
import LyricsBooklet from './components/LyricsBooklet';
import CustomSongModal from './components/CustomSongModal';
import SpotifyModal from './components/SpotifyModal';
import { handleSpotifyRedirect, getStoredConfig } from './services/spotify';

export default function App() {
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isMobileLyricsOpen, setIsMobileLyricsOpen] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  const {
    activeSide,
    currentTrack,
    currentPlaylist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffle,
    isCrackleEnabled,
    playAudio,
    pauseAudio,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    flipSide,
    setCurrentTrackIndex,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    toggleCrackle,
    addCustomTrack,
  } = useAudio();

  // Check Spotify OAuth callback on load
  useEffect(() => {
    handleSpotifyRedirect().then((token) => {
      if (token) {
        setIsSpotifyConnected(true);
        setIsGiftOpened(true); // Automatically reveal turntable after Spotify authorization
      } else {
        const config = getStoredConfig();
        if (config.accessToken && Date.now() < config.expiresAt) {
          setIsSpotifyConnected(true);
        }
      }
    });
  }, []);

  const handleOpenGift = () => {
    setIsGiftOpened(true);
    // Smooth start
    setTimeout(() => {
      playAudio();
    }, 700);
  };

  const handleReSealGift = () => {
    pauseAudio();
    setIsGiftOpened(false);
  };

  const handleSaveDedication = (trackId, newDedication) => {
    if (currentTrack) {
      currentTrack.dedication = newDedication;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0709] text-[#edd19c] font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-[#7a1c25] selection:text-white">
      {/* Background warm vintage textures */}
      <div className="fixed inset-0 pointer-events-none bg-grain opacity-20" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_20%,rgba(35,55,80,0.18)_0%,transparent_50%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_80%,rgba(143,29,44,0.15)_0%,transparent_50%)]" />

      {/* ================= PANTALLA 1: EL EMPAQUE / REGALO CERRADO ================= */}
      <GiftEnvelope
        isOpen={isGiftOpened}
        onOpen={handleOpenGift}
      />

      {/* ================= HEADER DE NAVEGACIÓN ================= */}
      <header className="relative z-20 w-full border-b border-[#24151b]/80 bg-[#100a0d]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7a1725] to-[#2b050b] border border-[#d4a366]/40 flex items-center justify-center shadow-md">
            <Disc className="w-5 h-5 text-[#edd19c] animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-serif-vintage tracking-wider text-[#f4eae3] font-semibold flex items-center gap-2">
              Tocadiscos Digital Artesanal
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#1c2734] text-[#a5c4e8] border border-[#2b3c50]/60">
                Cara {activeSide}
              </span>
            </h1>
            <p className="text-[11px] text-[#9c8985] font-serif-vintage italic truncate max-w-[180px] sm:max-w-none">
              {currentTrack?.title} — {currentTrack?.artist}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spotify Connection Button */}
          <button
            type="button"
            onClick={() => setIsSpotifyModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer shadow-sm ${
              isSpotifyConnected
                ? 'bg-[#102219] hover:bg-[#163325] text-[#4ade80] border border-[#1db954]/50'
                : 'bg-[#182330] hover:bg-[#233346] text-[#a5c4e8] border border-[#2b3d52]/60'
            }`}
            title="Conectar con Spotify API"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono text-[11px]">
              {isSpotifyConnected ? 'Spotify Activo' : 'Spotify API'}
            </span>
          </button>

          {/* Custom Song Upload */}
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#241318] hover:bg-[#3d1822] text-[#edd19c] border border-[#d4a366]/30 transition-all cursor-pointer shadow-sm"
            title="Agregar tu propia canción o dedicatoria"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#d4a366]" />
            <span className="hidden md:inline font-serif-vintage">Agregar MP3</span>
          </button>

          {/* Toggle Mobile Lyrics */}
          <button
            type="button"
            onClick={() => setIsMobileLyricsOpen((prev) => !prev)}
            className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#241318] hover:bg-[#3d1822] text-[#edd19c] border border-[#8f1d2c]/40 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#edd19c]" />
            <span className="font-serif-vintage">
              {isMobileLyricsOpen ? 'Tocadiscos' : 'Letras'}
            </span>
          </button>

          {/* Re-Seal Gift Button */}
          <button
            type="button"
            onClick={handleReSealGift}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#301017] hover:bg-[#4d1622] text-[#f7d6a5] border border-[#8f1d2c] transition-all cursor-pointer shadow-md"
            title="Volver a cerrar el empaque con el sello de cera"
          >
            <Gift className="w-3.5 h-3.5 text-[#edd19c]" />
            <span className="hidden sm:inline font-serif-vintage">Ver Empaque</span>
          </button>
        </div>
      </header>

      {/* ================= PANTALLA 2: PRINCIPAL ================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Track Selection Pills */}
        <div className="flex items-center justify-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9e8c88] mr-2">
            Pistas {activeSide}:
          </span>
          {currentPlaylist.map((track, idx) => {
            const isActive = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setCurrentTrackIndex(idx)}
                className={`px-3 py-1 rounded-full text-xs font-serif-vintage tracking-wider transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#8f1d2c] text-white border-[#edd19c]/60 shadow-[0_0_12px_rgba(143,29,44,0.6)] font-semibold'
                    : 'bg-[#151b24] text-[#a1b3c9] border-[#25374a] hover:border-[#4a6b8c] hover:text-[#fff0f2]'
                }`}
              >
                {track.trackNumber}. {track.title}
              </button>
            );
          })}
        </div>

        {/* Main Grid: Dos Secciones Principales */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start justify-center max-w-6xl mx-auto w-full">
          {/* ================= 1. IZQUIERDA: TARJETA DEL TOCADISCOS (Tono suave/azul) ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`flex flex-col items-center justify-center ${
              isMobileLyricsOpen ? 'hidden xl:flex' : 'flex'
            } xl:col-span-7`}
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
              volume={volume}
              onChangeVolume={setVolume}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              isCrackleEnabled={isCrackleEnabled}
              onToggleCrackle={toggleCrackle}
              onFlipSide={flipSide}
            />
          </motion.div>

          {/* ================= 2. DERECHA: PANEL DE LETRAS Y PENSAMIENTOS ================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className={`w-full max-w-[540px] mx-auto xl:max-w-none ${
              isMobileLyricsOpen ? 'flex' : 'hidden xl:flex'
            } xl:col-span-5`}
          >
            <LyricsBooklet
              track={currentTrack}
              currentTime={currentTime}
              onSeek={seek}
              onSaveDedication={handleSaveDedication}
              className="w-full min-h-[540px]"
            />
          </motion.div>
        </div>
      </main>

      {/* ================= PIE DE PÁGINA ================= */}
      <footer className="relative z-10 w-full py-3 px-4 border-t border-[#24151b]/60 text-center text-xs text-[#7d6f6c] font-serif-vintage">
        <p className="flex items-center justify-center gap-1.5">
          <span>Tocadiscos Artesanal de Regalo</span>
          <span>•</span>
          <span className="font-butterfly text-xl text-[#edd19c]">Hecho a Mano</span>
          <span>•</span>
          <Heart className="w-3 h-3 text-[#8f1d2c] fill-[#8f1d2c]" />
          <span>Lado A & Lado B</span>
        </p>
      </footer>

      {/* ================= MODALES ================= */}
      <CustomSongModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddSong={addCustomTrack}
        activeSide={activeSide}
      />

      <SpotifyModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        isConnected={isSpotifyConnected}
        onDisconnect={() => setIsSpotifyConnected(false)}
      />
    </div>
  );
}
