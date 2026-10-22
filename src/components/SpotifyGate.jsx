import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Sparkles, Settings, ExternalLink, Music2, Disc3, ShieldCheck, AlertCircle } from 'lucide-react';
import { getStoredConfig, saveSpotifyConfig, initiateSpotifyAuth } from '../services/spotify';

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
          'radial-gradient(ellipse at 50% 40%, #200f12 0%, #0c0507 65%, #030103 100%)',
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

      {/* ── Romantic Crimson & Gold Ambient Glows ── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(143,29,44,0.22) 0%, rgba(212,163,102,0.06) 50%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Content Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-[#180e12]/95 via-[#120a0d]/95 to-[#0a0507]/95 border border-[#d4a366]/20 p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-center backdrop-blur-xl"
      >
        {/* Animated Vinyl Icon */}
        <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#0a0a0a] border-2 border-[#d4a366]/30 shadow-[0_0_30px_rgba(29,185,84,0.18)] flex items-center justify-center p-2"
          >
            <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center bg-[radial-gradient(circle,#1db954_0%,#0e5828_60%,#052410_100%)] shadow-inner">
              <Disc3 className="w-10 h-10 text-white/90 animate-pulse" />
            </div>
          </motion.div>
          {/* Small music note badge */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-lg border-2 border-[#120a0d]">
            <Music2 className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8f1d2c]/30 border border-[#8f1d2c]/50 text-[#eedcc5] text-[11px] tracking-widest uppercase mb-3 font-mono">
          <Sparkles className="w-3 h-3 text-[#d4a366]" />
          <span>Experiencia Musical Vinilo</span>
        </div>

        {/* Title & Romantic Subtitle */}
        <h1 className="text-3xl sm:text-4xl text-white font-butterfly tracking-wide mb-2 drop-shadow-sm">
          Conéctate a Spotify
        </h1>

        <p className="text-sm sm:text-base text-[#eedcc5]/85 leading-relaxed font-sans mb-6">
          Para abrir la carta y reproducir las canciones con{' '}
          <strong className="text-white font-semibold">letras sincronizadas en vivo</strong>, inicia sesión con tu cuenta de Spotify.
        </p>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Big Official Spotify Connect CTA */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(29,185,84,0.5)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold text-base tracking-wide transition-all duration-200 shadow-[0_10px_25px_rgba(29,185,84,0.35)] cursor-pointer group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-[#eedcc5]/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1db954]" />
            Spotify OAuth Oficial
          </span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#d4a366]" />
            Letras Sincronizadas
          </span>
        </div>

        {/* Config Toggle button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] text-[#eedcc5]/50 hover:text-[#eedcc5]/90 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3 h-3" />
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
              className="mt-4 p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-3 text-xs overflow-hidden"
            >
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d4a366] font-mono mb-1">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="ce48e7726f0f420faf794d16da8bcbf9"
                  className="w-full bg-[#0a0507] border border-white/20 focus:border-[#1db954] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d4a366] font-mono mb-1">
                  Redirect URI registrado en Spotify Developer:
                </label>
                <div className="p-2 rounded bg-[#0a0507] border border-white/10 text-[11px] text-[#eedcc5]/80 font-mono break-all select-all">
                  {currentRedirectUri}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <a
                  href="https://developer.spotify.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1db954] hover:underline inline-flex items-center gap-1"
                >
                  Spotify Developer Dashboard <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-3 py-1 rounded bg-[#1db954] text-black font-semibold hover:bg-[#1ed760] transition-colors"
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
