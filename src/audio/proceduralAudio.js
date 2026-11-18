/**
 * Web Audio API Vinyl Effects & Procedural Harmonic Synth Engine
 * Guarantees rich, atmospheric sound even offline or with custom presets.
 */

let audioCtx = null;
let crackleSource = null;
let crackleGain = null;
let synthTimer = null;
let synthGain = null;

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play authentic needle-drop mechanical click & stylus groove friction
 */
export function playNeedleDropSFX() {
  // Silenced per user request: App only controls Spotify
}

/**
 * Play needle lift sound when pausing/stopping
 */
export function playNeedleLiftSFX() {
  // Silenced per user request: App only controls Spotify
}

/**
 * Paper Crumple SFX Player
 * Plays the authentic paper crumpling sound effect (from SonidosChingonesFX / C7k1OKWGhZI)
 * with multi-format fallback (.webm / .m4a).
 */
let crumpleAudio = null;

export function playPaperCrumpleSFX(volume = 0.95) {
  try {
    if (!crumpleAudio) {
      crumpleAudio = new Audio();
      crumpleAudio.preload = 'auto';

      if (crumpleAudio.canPlayType('audio/webm; codecs="opus"')) {
        crumpleAudio.src = '/audio/paper-crumple.webm';
      } else if (crumpleAudio.canPlayType('audio/mp4; codecs="mp4a.40.2"')) {
        crumpleAudio.src = '/audio/paper-crumple.m4a';
      } else {
        crumpleAudio.src = '/audio/paper-crumple.webm';
      }
    }

    // Clone the audio so overlapping or repeated crumple actions play cleanly every time
    const sound = crumpleAudio.cloneNode();
    sound.volume = Math.max(0, Math.min(1, volume));
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to primary instance if cloning playback is restricted
        try {
          crumpleAudio.currentTime = 0;
          crumpleAudio.volume = Math.max(0, Math.min(1, volume));
          crumpleAudio.play().catch(() => {});
        } catch (e) {}
      });
    }
  } catch (err) {
    console.warn('Paper crumple SFX error:', err);
  }
}

/**
 * Continuous realistic vinyl crackle generator (filtered noise + random dust pops)
 */
export function startVinylCrackle(volume = 0) {
  // Disabled: Background noise removed per user request
  stopVinylCrackle();
}

export function setVinylCrackleVolume(volume) {
  if (crackleGain && audioCtx) {
    crackleGain.gain.setTargetAtTime(Math.max(0, volume), audioCtx.currentTime, 0.05);
  }
}

export function stopVinylCrackle() {
  if (crackleSource) {
    try {
      crackleSource.stop();
      crackleSource.disconnect();
    } catch (e) {
      // Ignored if already stopped
    }
    crackleSource = null;
  }
}

/**
 * Procedural Harmonic Synth Fallback (warm Rhodes & acoustic chords)
 * When an audio URL cannot be loaded or to accompany procedural mode.
 */
const CHORD_PROGRESSIONS = {
  'rhodes-warm': [
    [146.83, 220.0, 261.63, 329.63], // Dm7
    [174.61, 220.0, 261.63, 349.23], // Fmaj7
    [196.0, 246.94, 293.66, 392.0],  // G7
    [130.81, 196.0, 246.94, 329.63], // Cmaj7
  ],
  'jazz-ambient': [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [164.81, 207.65, 246.94, 311.13], // E7b9
    [146.83, 220.0, 261.63, 329.63], // Dm9
    [130.81, 196.0, 246.94, 392.0],  // Cmaj9
  ],
  'piano-gentle': [
    [196.0, 246.94, 293.66, 392.0],  // G
    [164.81, 196.0, 246.94, 329.63], // Em
    [130.81, 164.81, 196.0, 261.63], // C
    [146.83, 220.0, 293.66, 369.99], // D
  ],
  'rain-lofi': [
    [110.0, 164.81, 220.0, 261.63],  // Am7
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [146.83, 174.61, 220.0, 261.63], // Dm7
  ],
  'piano-letter': [
    [155.56, 196.0, 233.08, 311.13], // Eb
    [130.81, 155.56, 196.0, 261.63], // Cm
    [174.61, 207.65, 261.63, 349.23], // Fm
    [116.54, 174.61, 233.08, 293.66], // Bb
  ],
  'nostalgic-chords': [
    [116.54, 174.61, 233.08, 293.66], // Bb
    [146.83, 174.61, 220.0, 293.66], // Dm
    [103.83, 155.56, 207.65, 261.63], // Ab
    [174.61, 220.0, 261.63, 349.23], // F
  ],
};

export function startProceduralMusic(preset = 'rhodes-warm', volume = 0.5) {
  // Disabled: The app only controls Spotify. No background synth music.
  stopProceduralMusic();
}

export function stopProceduralMusic() {
  if (synthTimer) {
    clearInterval(synthTimer);
    synthTimer = null;
  }
  if (synthGain && audioCtx) {
    try {
      synthGain.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.1);
      setTimeout(() => {
        if (synthGain) synthGain.disconnect();
        synthGain = null;
      }, 150);
    } catch (e) {
      synthGain = null;
    }
  }
}
