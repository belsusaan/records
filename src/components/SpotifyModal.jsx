import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, Check, ExternalLink, RefreshCw, Key, Music, LogOut } from 'lucide-react';
import {
  getStoredConfig,
  saveSpotifyConfig,
  initiateSpotifyAuth,
  clearSpotifyTokens,
} from '../services/spotify';

export default function SpotifyModal({
  isOpen,
  onClose,
  isConnected,
  spotifyUser,
  onDisconnect,
}) {
  const [clientId, setClientId] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const config = getStoredConfig();
    setClientId(config.clientId || '');
    setPlaylistId(config.playlistId || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    saveSpotifyConfig(clientId, playlistId);

    if (!clientId.trim()) {
      setErrorMsg('Ingresa tu Client ID de Spotify Developer.');
      return;
    }

    try {
      await initiateSpotifyAuth(clientId);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo iniciar la autenticación con Spotify.');
    }
  };

  const handleDisconnect = () => {
    clearSpotifyTokens();
    if (onDisconnect) onDisconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#131b26] via-[#0d131c] to-[#080c12] border border-[#263b52] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-6 text-[#d8e3f0]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#1a2533] text-[#8ea4be] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif-vintage tracking-wide text-white font-semibold">
              Conexión a Spotify API
            </h3>
            <p className="text-xs text-[#829bb8]">
              OAuth 2.0 PKCE & Control de Reproducción
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#102219] border border-[#1db954]/40 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#1db954] shadow-[0_0_8px_#1db954]" />
              <div className="text-xs">
                <span className="block font-semibold text-[#a7f3d0]">Spotify Conectado</span>
                <span className="text-[#6ee7b7]">{spotifyUser || 'Sesión Activa'}</span>
              </div>
            </div>

            <p className="text-xs text-[#8fa3bc] leading-relaxed">
              El tocadiscos está vinculado a tu cuenta de Spotify. Los botones de play, pausa, pista siguiente y volumen controlan tu reproductor de Spotify en vivo.
            </p>

            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3b1c23] hover:bg-[#52232e] text-[#fca5a5] border border-[#8f1d2c]/50 text-xs font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" /> Desconectar de Spotify
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveAndConnect} className="space-y-4">
            <p className="text-xs text-[#8ea4be] leading-relaxed">
              Para vincular tu cuenta y tu playlist de regalo, ingresa tu <strong className="text-[#a5c4e8]">Client ID</strong> registrado en{' '}
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[#1db954] hover:underline inline-flex items-center gap-0.5"
              >
                Spotify Developer Dashboard <ExternalLink className="w-3 h-3" />
              </a>
              . (Añade <code className="bg-[#0b1017] px-1 py-0.5 rounded text-[11px] text-[#edd19c]">{window.location.origin + window.location.pathname}</code> como Redirect URI).
            </p>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9bb3cf] mb-1 font-mono">
                Spotify Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ej: 4a2b9c..."
                className="w-full bg-[#0a0f16] border border-[#253950] focus:border-[#1db954] rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9bb3cf] mb-1 font-mono">
                Playlist ID (Opcional)
              </label>
              <input
                type="text"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
                placeholder="Ej: 37i9dQZF1DXcBWIGoYBM5M"
                className="w-full bg-[#0a0f16] border border-[#253950] focus:border-[#1db954] rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[#f87171]">{errorMsg}</p>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs text-[#8ea4be] hover:text-white"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#1db954] text-black hover:bg-[#1ed760] transition-colors cursor-pointer shadow-lg"
              >
                <Key className="w-3.5 h-3.5" /> Conectar Spotify
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
