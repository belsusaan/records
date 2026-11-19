import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, X, ExternalLink, Key, LogOut, Check, RefreshCw } from 'lucide-react';
import {
  getStoredConfig,
  saveSpotifyConfig,
  initiateSpotifyAuth,
  clearSpotifyTokens,
  spotifyFollowPlaylist,
  spotifyCheckFollowPlaylist,
  DEFAULT_PLAYLIST_ID,
} from '../services/spotify';

/**
 * SpotifyModal — Panel de configuración y desconexión de Spotify
 * Paleta: #92374D, #EEABC4, #1C3041, #F4F1DE, #37000A
 * Tipografías: Butterfly Kids & Dongle
 */
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
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    const config = getStoredConfig();
    setClientId(config.clientId || '');
    setPlaylistId(config.playlistId || '');

    if (isOpen && isConnected) {
      spotifyCheckFollowPlaylist()
        .then((followed) => setIsSaved(Boolean(followed)))
        .catch(() => {});
    }
  }, [isOpen, isConnected]);

  const handleFollow = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveNotice('');
    try {
      const ok = await spotifyFollowPlaylist();
      if (ok) {
        setIsSaved(true);
        setSaveNotice('¡Playlist guardada en tus playlists!');
      } else {
        window.open(`https://open.spotify.com/playlist/${DEFAULT_PLAYLIST_ID}`, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(`https://open.spotify.com/playlist/${DEFAULT_PLAYLIST_ID}`, '_blank', 'noopener,noreferrer');
    } finally {
      setIsSaving(false);
    }
  };

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
        className="relative w-full max-w-md rounded-3xl bg-[#92374D] border-2 border-[#37000A]/40 shadow-[0_20px_50px_rgba(55,0,10,0.6),0_0_40px_rgba(146,55,77,0.25)] p-6 sm:p-7 text-[#F4F1DE]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#37000A]/50 text-[#EEABC4] hover:text-[#F4F1DE] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#92374D]/30 border border-[#92374D]/60 flex items-center justify-center text-[#EEABC4]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-3xl font-butterfly tracking-wide text-[#F4F1DE] leading-tight">
              Conexión a Spotify API
            </h3>
            <p className="text-xl font-dongle text-[#EEABC4] leading-none">
              OAuth 2.0 PKCE & Control de Reproducción
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#37000A]/80 border border-[#92374D]/50 flex items-center gap-3.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#1db954] shadow-[0_0_8px_#1db954] shrink-0" />
              <div className="font-dongle leading-tight">
                <span className="block text-2xl font-bold text-[#F4F1DE]">Spotify Conectado</span>
                <span className="text-xl text-[#EEABC4]">{spotifyUser || 'Sesión Activa'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFollow}
              disabled={isSaving}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-dongle text-2xl font-bold cursor-pointer transition-colors shadow-md ${
                isSaved
                  ? 'bg-[#37000A] text-[#1db954] border border-[#1db954]/50'
                  : 'bg-[#1db954] text-[#37000A] hover:bg-[#1ed760]'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Guardada en tus playlists</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.216.353-.674.466-1.027.25-2.812-1.718-6.352-2.106-10.522-1.153-.404.092-.806-.16-.898-.564-.092-.403.16-.805.564-.897 4.568-1.044 8.49-.607 11.633 1.314.353.216.466.674.25 1.05zm1.468-3.262c-.272.443-.852.583-1.295.311-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.026-.134-1.177-.631-.151-.498.134-1.026.631-1.177 4.356-1.321 9.775-.681 13.465 1.587.443.272.583.852.311 1.303zm.126-3.41c-3.86-2.292-10.224-2.503-13.888-1.39-.59.18-1.22-.16-1.399-.75-.18-.59.16-1.22.75-1.4 4.218-1.281 11.246-1.035 15.688 1.602.532.316.705 1.011.389 1.543-.315.531-1.01.705-1.54.395z" />
                  </svg>
                  <span>{isSaving ? 'Guardando...' : 'Agregar a mi Spotify'}</span>
                </>
              )}
            </button>
            {saveNotice && (
              <p className="text-xl text-center font-dongle text-[#EEABC4] -mt-2">
                {saveNotice}
              </p>
            )}

            <button
              type="button"
              onClick={async () => {
                clearSpotifyTokens();
                await initiateSpotifyAuth();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#1db954] hover:bg-[#1ed760] text-[#0a0a0a] font-dongle text-2xl font-bold cursor-pointer transition-colors shadow-md leading-none"
            >
              <RefreshCw className="w-5 h-5 text-[#0a0a0a]" /> Reconectar con Spotify
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#92374D] hover:bg-[#a64259] text-[#F4F1DE] border border-[#EEABC4]/30 font-dongle text-2xl font-bold cursor-pointer transition-colors shadow-md leading-none"
            >
              <LogOut className="w-5 h-5" /> Desconectar de Spotify
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveAndConnect} className="space-y-3 font-dongle">
            <p className="text-xl text-[#EEABC4]/90 leading-tight">
              Para vincular tu cuenta y tu playlist de regalo, ingresa tu Client ID registrado en{' '}
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[#F4F1DE] underline inline-flex items-center gap-0.5"
              >
                Spotify Developer Dashboard <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>

            <div>
              <label className="block text-xl uppercase tracking-wider text-[#EEABC4] mb-0.5 leading-none">
                Spotify Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ej: 4a2b9c..."
                className="w-full bg-[#37000A] border border-[#92374D]/50 focus:border-[#EEABC4] rounded-xl px-3 py-1.5 text-xl text-[#F4F1DE] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xl uppercase tracking-wider text-[#EEABC4] mb-0.5 leading-none">
                Playlist ID (Opcional)
              </label>
              <input
                type="text"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
                placeholder="4aF29SVP3mUQZItc3xiOV0"
                className="w-full bg-[#37000A] border border-[#92374D]/50 focus:border-[#EEABC4] rounded-xl px-3 py-1.5 text-xl text-[#F4F1DE] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xl text-red-300">{errorMsg}</p>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-1.5 text-2xl text-[#EEABC4] hover:text-[#F4F1DE] cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-2xl font-bold bg-[#1db954] text-[#37000A] hover:bg-[#1ed760] transition-colors cursor-pointer shadow-lg"
              >
                <Key className="w-4 h-4" /> Conectar Spotify
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
