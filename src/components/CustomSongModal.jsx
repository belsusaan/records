import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, X, Heart, Check, FileAudio } from 'lucide-react';

export default function CustomSongModal({
  isOpen,
  onClose,
  onAddSong,
  activeSide,
}) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dedication, setDedication] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!title) {
        setTitle(dropped.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onAddSong(file, title, dedication, lyrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#1a1013] via-[#120a0d] to-[#0a0507] border border-[#4a1a23] shadow-2xl p-6 text-[#edd19c]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#2e151b] text-[#bda7a2] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#3d141b] border border-[#d4a366]/40 flex items-center justify-center text-[#edd19c]">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-serif-vintage tracking-wide text-[#fff0f2]">
              Prensado Personalizado
            </h3>
            <p className="text-xs text-[#a89591] font-serif-vintage">
              Agrega tu propia canción o mensaje de voz al Lado {activeSide}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#edd19c] bg-[#2e151b]'
                : file
                ? 'border-[#4ade80]/60 bg-[#14261b]/30'
                : 'border-[#4a1c25] hover:border-[#8f1d2c] bg-[#12070a]'
            }`}
          >
            <input
              type="file"
              accept="audio/*"
              id="audio-upload-input"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="audio-upload-input" className="cursor-pointer block">
              {file ? (
                <div className="flex items-center justify-center gap-2 text-[#4ade80]">
                  <FileAudio className="w-5 h-5" />
                  <span className="text-sm font-medium truncate max-w-[280px]">
                    {file.name}
                  </span>
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <div className="space-y-1">
                  <Music className="w-7 h-7 mx-auto text-[#d4a366]/70" />
                  <p className="text-xs text-[#edd19c]">
                    Arrastra aquí tu archivo de audio (MP3, WAV, M4A) o{' '}
                    <span className="underline font-semibold">haz clic para examinar</span>
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#b8a6a2] mb-1 font-serif-vintage">
              Título de la Canción
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Nuestra Canción Favorita"
              className="w-full bg-[#12070a] border border-[#3b171e] focus:border-[#edd19c] rounded-lg px-3 py-2 text-sm text-[#fff0f2] focus:outline-none"
              required
            />
          </div>

          {/* Dedication */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#b8a6a2] mb-1 font-serif-vintage">
              Dedicatoria / Pensamiento
            </label>
            <input
              type="text"
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              placeholder="Ej: Para el amor de mi vida en nuestro aniversario."
              className="w-full bg-[#12070a] border border-[#3b171e] focus:border-[#edd19c] rounded-lg px-3 py-2 text-sm text-[#fff0f2] focus:outline-none font-handwriting text-lg"
            />
          </div>

          {/* Lyrics / Letter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#b8a6a2] mb-1 font-serif-vintage">
              Letra o Mensaje Dedicado (Opcional)
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={3}
              placeholder="Escribe la letra o un poema para que se devele al hacer scroll en el libreto..."
              className="w-full bg-[#12070a] border border-[#3b171e] focus:border-[#edd19c] rounded-lg px-3 py-2 text-sm text-[#fff0f2] focus:outline-none resize-none font-serif-vintage"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#a89591] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition-all ${
                file
                  ? 'bg-gradient-to-r from-[#8f1d2c] to-[#b82d3e] hover:brightness-110 cursor-pointer'
                  : 'bg-[#3b1c22] opacity-50 cursor-not-allowed'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Colocar en el Tocadiscos
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
