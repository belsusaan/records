import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Settings, ExternalLink, Music2, Disc3, ShieldCheck, AlertCircle } from 'lucide-react';
import { getStoredConfig, saveSpotifyConfig, initiateSpotifyAuth } from '../services/spotify';

/**
 * SpotifyGate — Pantalla de acceso obligatorio con Spotify
 * Paleta: #92374D, #EEABC4, #1C3041, #F4F1DE, #37000A
 * Tipografías: Butterfly Kids & Dongle
 */
export default function SpotifyGate({ onAuthSuccess }) {
  const config = getStoredConfig();
  const [clientId, setClientId] = useState(config.clientId || '');
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentRedirectUri =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const effectiveId = clientId.trim() || config.clientId;
    if (!effectiveId) {
      setErrorMsg('Por favor ingresa tu Client ID de Spotify.');
      setLoading(false);
      setShowConfig(true);
      return;
    }

    saveSpotifyConfig(effectiveId, config.playlistId);

    try {
      await initiateSpotifyAuth(effectiveId);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo redirigir a Spotify. Revisa tu Client ID.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-y-auto"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, #fbe3eb 0%, #EEABC4 65%, #d98aa3 100%)',
      }}
    >
      {/* ── Ambient noise / grain overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ── Vintage Berry & Blush Pop Ambient Glows (#92374D / #EEABC4) ── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(146,55,77,0.25) 0%, rgba(238,171,196,0.08) 50%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Content Card (#1C3041 Deep Space Blue Base) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-[#1C3041]/95 border-2 border-[#92374D]/35 p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_50px_rgba(146,55,77,0.15)] text-center backdrop-blur-xl"
      >
        {/* Animated Vinyl Icon */}
        <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#0a0a0a] border-2 border-[#92374D]/50 shadow-[0_0_25px_rgba(146,55,77,0.3)] flex items-center justify-center p-2"
          >
            <div className="w-full h-full rounded-full border border-[#F4F1DE]/15 flex items-center justify-center bg-[radial-gradient(circle,#92374D_0%,#37000A_70%,#1C3041_100%)] shadow-inner">
              <Disc3 className="w-10 h-10 text-[#F4F1DE]/90 animate-pulse" />
            </div>
          </motion.div>
          {/* Small music note badge */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#92374D] text-[#F4F1DE] flex items-center justify-center shadow-lg border-2 border-[#1C3041]">
            <Music2 className="w-4 h-4 fill-current text-[#EEABC4]" />
          </div>
        </div>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#37000A]/60 border border-[#92374D]/60 text-[#EEABC4] text-xl font-dongle mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#EEABC4]" />
          <span className="leading-none">Experiencia Musical en Vinilo</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl sm:text-5xl text-[#F4F1DE] font-butterfly tracking-wide mb-1 drop-shadow-sm leading-tight">
          Conéctate a Spotify
        </h1>

        <p className="text-2xl sm:text-3xl text-[#EEABC4]/90 leading-tight font-dongle mb-5">
          Para abrir la carta y reproducir tu playlist con{' '}
          <strong className="text-[#F4F1DE] font-bold">letras sincronizadas</strong>, inicia sesión con tu cuenta de Spotify.
        </p>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#37000A] border border-red-500/50 text-[#EEABC4] font-dongle text-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Big Official Spotify Connect CTA (#1db954 + #1C3041) */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(29,185,84,0.45)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-[#1db954] hover:bg-[#1ed760] text-[#1C3041] font-dongle text-3xl font-bold tracking-wide transition-all duration-200 shadow-[0_10px_25px_rgba(29,185,84,0.35)] cursor-pointer group leading-none"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-[#1C3041] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* Spotify Official SVG Icon */}
              <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.307c-.217.355-.678.47-1.032.253-2.828-1.728-6.388-2.12-10.582-1.162-.405.093-.812-.162-.905-.568-.093-.406.162-.813.568-.906 4.59-1.047 8.528-.598 11.7 1.343.354.216.47.677.251 1.04zm1.472-3.275c-.273.444-.858.587-1.302.314-3.237-1.99-8.172-2.565-12.001-1.402-.497.151-1.026-.135-1.177-.633-.151-.497.135-1.026.633-1.177 4.385-1.332 9.824-.693 13.533 1.596.444.273.587.858.314 1.302zm.126-3.41c-3.882-2.305-10.288-2.518-13.99-1.394-.596.18-1.229-.155-1.41-.751-.18-.596.155-1.229.751-1.41 4.257-1.292 11.326-1.045 15.795 1.608.536.318.71 1.015.392 1.551-.318.536-1.015.71-1.538.396z" />
              </svg>
              <span>Entrar con Spotify</span>
            </>
          )}
        </motion.button>

        {/* Feature Highlights Pills */}
        <div className="mt-5 pt-4 border-t border-[#92374D]/25 flex items-center justify-center gap-4 text-xl font-dongle text-[#F4F1DE]/80">
          <span className="flex items-center gap-1.5 leading-none">
            <ShieldCheck className="w-4 h-4 text-[#1db954]" />
            Spotify Oficial
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EEABC4]/40" />
          <span className="flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-[#EEABC4]" />
            Letras Sincronizadas
          </span>
        </div>

        {/* Config Toggle button */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-lg font-dongle text-[#EEABC4]/70 hover:text-[#F4F1DE] transition-colors inline-flex items-center gap-1 cursor-pointer leading-none"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Ocultar ajustes' : 'Configurar Client ID / Redirect URI'}</span>
          </button>
        </div>

        {/* Optional Collapsible Config Panel */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 rounded-2xl bg-[#37000A]/80 border border-[#92374D]/40 text-left space-y-3 font-dongle text-xl overflow-hidden"
            >
              <div>
                <label className="block text-lg uppercase tracking-wider text-[#EEABC4] font-dongle mb-0.5 leading-none">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="ce48e7726f0f420faf794d16da8bcbf9"
                  className="w-full bg-[#1C3041] border border-[#92374D]/50 focus:border-[#EEABC4] rounded-lg px-3 py-1.5 text-[#F4F1DE] font-dongle text-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg uppercase tracking-wider text-[#EEABC4] font-dongle mb-0.5 leading-none">
                  Redirect URI registrado en Spotify Developer:
                </label>
                <div className="p-2 rounded bg-[#1C3041] border border-[#92374D]/40 text-lg text-[#F4F1DE]/90 font-mono break-all select-all">
                  {currentRedirectUri}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-lg">
                <a
                  href="https://developer.spotify.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#EEABC4] hover:underline inline-flex items-center gap-1"
                >
                  Spotify Developer Dashboard <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-3.5 py-1 rounded-xl bg-[#92374D] text-[#F4F1DE] font-dongle text-xl font-bold hover:bg-[#a64259] transition-colors leading-none"
                >
                  Guardar y Entrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
