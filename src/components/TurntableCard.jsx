import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Vinyl3D from './Vinyl3D';
import TurntableArm from './TurntableArm';
import {
  isSpotifyAuthenticated,
  spotifyFollowPlaylist,
  spotifyCheckFollowPlaylist,
  DEFAULT_PLAYLIST_ID,
} from '../services/spotify';

// Stroke bounds within avance.svg: spans from 3.8% to 95.5% horizontally
const STROKE_START_PCT = 3.8;
const STROKE_END_PCT = 95.5;

export default function TurntableCard({
  activeSide,
  isPlaying,
  currentTrack,
  currentTime,
  duration,
  onSeek,
  onTogglePlay,
  onNext,
  onPrev,
  isLooping,
  onToggleLoop,
  isShuffle,
  onToggleShuffle,
  onFlipSide,
  className = '',
}) {
  const progressBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  // Check if current user already follows this playlist on Spotify
  useEffect(() => {
    let isMounted = true;
    if (isSpotifyAuthenticated()) {
      spotifyCheckFollowPlaylist()
        .then((followed) => {
          if (isMounted) setIsSaved(Boolean(followed));
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveToSpotify = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveNotice('');
    try {
      const success = await spotifyFollowPlaylist();
      if (success) {
        setIsSaved(true);
        setSaveNotice('¡Guardada en tus playlists!');
        setTimeout(() => setSaveNotice(''), 3500);
      } else {
        // Fallback: direct Spotify link if scopes not present or error
        window.open(`https://open.spotify.com/playlist/${DEFAULT_PLAYLIST_ID}`, '_blank', 'noopener,noreferrer');
        setSaveNotice('Abriendo Spotify para guardar...');
        setTimeout(() => setSaveNotice(''), 3500);
      }
    } catch (err) {
      console.error('Error al guardar en Spotify:', err);
      window.open(`https://open.spotify.com/playlist/${DEFAULT_PLAYLIST_ID}`, '_blank', 'noopener,noreferrer');
      setSaveNotice('Abriendo Spotify...');
      setTimeout(() => setSaveNotice(''), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const currentPercent = STROKE_START_PCT + progressRatio * (STROKE_END_PCT - STROKE_START_PCT);

  // Click & Drag seeking along the bar
  const calculateSeekFraction = (clientX) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = (clickX / rect.width) * 100;
    const normalized = (ratio - STROKE_START_PCT) / (STROKE_END_PCT - STROKE_START_PCT);
    return Math.max(0, Math.min(1, normalized));
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const fraction = calculateSeekFraction(e.clientX);
    onSeek(fraction);

    const handlePointerMove = (moveEvent) => {
      const moveFraction = calculateSeekFraction(moveEvent.clientX);
      onSeek(moveFraction);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      className={`relative w-full max-w-[490px] sm:max-w-[530px] rounded-[48px] sm:rounded-[56px] p-6 sm:p-9 flex flex-col items-center bg-[#92374D] shadow-[0_25px_60px_rgba(55,0,10,0.45),0_0_40px_rgba(146,55,77,0.3)] select-none ${className}`}
    >
      {/* ================= 1. VINYL RECORD WITH REACTBITS FLIPCARD & HAND-PAINTED TONEARM ================= */}
      <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-square flex items-center justify-center mt-1 mb-2">
        {/* 3D Vinyl Record (FlipCard micro-interaction: clicking the vinyl flips it) */}
        <div className="w-full h-full">
          <Vinyl3D
            activeSide={activeSide}
            isPlaying={isPlaying}
            onFlip={onFlipSide}
            className="w-full h-full"
          />
        </div>

        {/* Hand-painted Tonearm (aguja.png) */}
        <TurntableArm
          isPlaying={isPlaying}
          progress={progressRatio}
        />
      </div>

      {/* ================= 2. TITLE & ARTIST (BUTTERFLY KIDS + DONGLE) ================= */}
      <div className="w-full px-3 text-left mt-2 mb-1">
        <h2 className="text-4xl sm:text-5xl font-bold text-[#F4F1DE] tracking-wide leading-tight drop-shadow-sm font-butterfly truncate">
          {currentTrack?.title || 'In My Life'}
        </h2>
        <p className="text-2xl sm:text-3xl text-[#EEABC4] tracking-wide leading-none font-dongle mt-0.5">
          {currentTrack?.artist || 'The Beatles'}
        </p>
      </div>

      {/* ================= 3. AVANCE.SVG PROGRESS BAR WITH COLOR CHANGE & PINKHEART ================= */}
      <div className="w-full px-1 my-1">
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          className="relative w-full h-11 sm:h-12 cursor-pointer select-none flex items-center group"
          role="slider"
          aria-label="Barra de avance de la canción"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Layer 1: Base avance.svg (Unplayed groove in subtle dark tone) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            style={{
              WebkitMaskImage: "url('/img/avance.svg?v=3')",
              maskImage: "url('/img/avance.svg?v=3')",
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              backgroundColor: '#40000B',
            }}
          />

          {/* Layer 2: Dynamic Played Progress avance.svg in EXACT background pink (#EEABC4) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
            style={{
              clipPath: `inset(0 ${Math.max(0, 100 - currentPercent)}% 0 0)`,
              transition: isDragging ? 'none' : 'clip-path 0.2s linear',
            }}
          >
            <div
              className="w-full h-full bg-[#EEABC4] drop-shadow-[0_0_12px_rgba(238,171,196,0.9)]"
              style={{
                WebkitMaskImage: "url('/img/avance.svg?v=3')",
                maskImage: "url('/img/avance.svg?v=3')",
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Layer 3: Hand-painted Pink Heart Scrubber (pinkheart.png) with animated heartbeat */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none select-none z-20 flex items-center justify-center"
            style={{
              left: `${currentPercent}%`,
              transition: isDragging ? 'none' : 'left 0.2s linear',
            }}
          >
            <motion.img
              src="/img/pinkheart.png"
              alt="Marcador de avance"
              animate={
                isPlaying
                  ? {
                      scale: [1, 1.2, 0.95, 1.12, 1],
                      rotate: [0, -3, 2, -1, 0],
                    }
                  : {
                      scale: 1,
                      rotate: 0,
                    }
              }
              transition={
                isPlaying
                  ? {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : { duration: 0.2 }
              }
              className={`h-9 sm:h-11 w-auto object-contain pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] drop-shadow-[0_0_12px_rgba(238,171,196,0.9)] select-none transition-transform duration-100 ${
                isDragging ? 'scale-125 brightness-110' : 'group-hover:scale-115'
              }`}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* ================= 4. THE 5 HAND-PAINTED BUTTONS (EXACTLY AS FIGMA) ================= */}
      <div className="w-full flex items-center justify-between px-2 sm:px-4 mt-1 mb-1">
        {/* Shuffle Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onToggleShuffle}
          className={`relative p-1 cursor-pointer transition-all duration-150 ${
            isShuffle
              ? 'scale-110 drop-shadow-[0_0_12px_rgba(238,171,196,0.95)] opacity-100'
              : 'opacity-70 hover:opacity-100'
          }`}
          title={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
          aria-label={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
        >
          <img
            src="/img/shuffle.png"
            alt="Shuffle"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow"
            draggable={false}
          />
          {isShuffle && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#EEABC4] shadow-[0_0_6px_#EEABC4]" />
          )}
        </motion.button>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onPrev}
          className="relative p-1 cursor-pointer opacity-90 hover:opacity-100 transition-all duration-150"
          title="Pista anterior"
          aria-label="Pista anterior"
        >
          <img
            src="/img/back.png"
            alt="Anterior"
            className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow"
            draggable={false}
          />
        </motion.button>

        {/* Play / Pause Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onTogglePlay}
          className="relative p-1 cursor-pointer focus:outline-none"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          <img
            src={isPlaying ? '/img/pause.png' : '/img/play.png'}
            alt={isPlaying ? 'Pausar' : 'Reproducir'}
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
            draggable={false}
          />
        </motion.button>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onNext}
          className="relative p-1 cursor-pointer opacity-90 hover:opacity-100 transition-all duration-150"
          title="Pista siguiente"
          aria-label="Pista siguiente"
        >
          <img
            src="/img/next.png"
            alt="Siguiente"
            className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow"
            draggable={false}
          />
        </motion.button>

        {/* Loop / Repeat Button (Only Repeat Song) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onToggleLoop}
          className={`relative p-1 cursor-pointer transition-all duration-150 ${
            isLooping
              ? 'scale-110 drop-shadow-[0_0_12px_rgba(238,171,196,0.95)] opacity-100'
              : 'opacity-70 hover:opacity-100'
          }`}
          title={isLooping ? 'Repetir canción activado (1)' : 'Activar repetición de canción'}
          aria-label={isLooping ? 'Repetir canción activado' : 'Activar repetición de canción'}
        >
          <img
            src="/img/loop.png"
            alt="Repetir canción"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow"
            draggable={false}
          />
          {isLooping && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[13px] h-[13px] px-0.5 rounded-full bg-[#EEABC4] text-[#37000A] text-[9px] font-bold font-mono leading-none shadow-[0_0_6px_#EEABC4]">
              1
            </span>
          )}
        </motion.button>
      </div>

      {/* ================= 5. BOTÓN: AGREGAR A MI SPOTIFY ================= */}
      <div className="mt-2.5 w-full flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleSaveToSpotify}
          disabled={isSaving}
          className={`group flex items-center justify-center gap-2 px-5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-md select-none ${
            isSaved
              ? 'bg-[#37000A]/85 border-[#1db954]/60 text-[#F4F1DE]'
              : 'bg-[#37000A]/75 hover:bg-[#37000A] border-[#EEABC4]/35 hover:border-[#EEABC4] text-[#F4F1DE] hover:text-[#EEABC4]'
          }`}
          title={
            isSaved
              ? 'Playlist guardada en tus playlists de Spotify'
              : 'Guardar esta playlist en tu biblioteca de Spotify'
          }
          aria-label={isSaved ? 'Guardada en tu Spotify' : 'Agregar a mi Spotify'}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-[#1db954] stroke-[3]" />
              <span className="font-dongle text-2xl font-bold tracking-wide leading-none text-[#EEABC4]">
                Guardada en tu Spotify
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 fill-current text-[#1db954] shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.216.353-.674.466-1.027.25-2.812-1.718-6.352-2.106-10.522-1.153-.404.092-.806-.16-.898-.564-.092-.403.16-.805.564-.897 4.568-1.044 8.49-.607 11.633 1.314.353.216.466.674.25 1.05zm1.468-3.262c-.272.443-.852.583-1.295.311-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.026-.134-1.177-.631-.151-.498.134-1.026.631-1.177 4.356-1.321 9.775-.681 13.465 1.587.443.272.583.852.311 1.303zm.126-3.41c-3.86-2.292-10.224-2.503-13.888-1.39-.59.18-1.22-.16-1.399-.75-.18-.59.16-1.22.75-1.4 4.218-1.281 11.246-1.035 15.688 1.602.532.316.705 1.011.389 1.543-.315.531-1.01.705-1.54.395z" />
              </svg>
              <span className="font-dongle text-2xl font-bold tracking-wide leading-none">
                {isSaving ? 'Guardando en Spotify...' : 'Agregar a mi Spotify'}
              </span>
            </>
          )}
        </motion.button>
        {saveNotice && (
          <span className="text-xl font-dongle text-[#EEABC4] mt-0.5 animate-pulse leading-none">
            {saveNotice}
          </span>
        )}
      </div>
    </div>
  );
}
