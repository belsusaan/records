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
 * Realistic Paper Crumple SFX Generator
 * Uses Web Audio API to synthesize authentic, tactile paper creasing,
 * folding friction, and micro-crease snaps as the paper turns into a ball.
 */
let cachedCrumpleBuffer = null;

export function playPaperCrumpleSFX(volume = 0.85) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const sampleRate = ctx.sampleRate;
    const duration = 2.1;
    const totalSamples = Math.floor(sampleRate * duration);

    // Pre-render or compute buffer
    if (!cachedCrumpleBuffer || cachedCrumpleBuffer.sampleRate !== sampleRate) {
      cachedCrumpleBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
      const data = cachedCrumpleBuffer.getChannelData(0);

      // 1. Paper surface friction base layer (pink noise with envelope)
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < totalSamples; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555;
        b1 = 0.99332 * b1 + white * 0.075;
        b2 = 0.969 * b2 + white * 0.153;
        const pink = b0 + b1 + b2 + white * 0.536;
        const progress = i / totalSamples;
        // Swell during deformation, peak around 60%, gentle fadeout
        const env = Math.pow(Math.sin(progress * Math.PI), 1.3) * (0.16 + 0.08 * Math.sin(progress * 22));
        data[i] = pink * 0.09 * env;
      }

      // 2. Micro-crease snap / crunch events (rapid avalanche clicks)
      const numSnaps = 175;
      for (let s = 0; s < numSnaps; s++) {
        const u = Math.random();
        const time = 0.08 + Math.pow(u, 1.25) * 1.85;
        const startSample = Math.floor(time * sampleRate);
        const snapDuration = 0.004 + Math.random() * 0.022; // 4ms - 26ms
        const snapSamples = Math.floor(snapDuration * sampleRate);
        const freq = 1200 + Math.random() * 4800; // Resonant frequency of paper crease
        const amp = 0.06 + Math.pow(Math.random(), 2.8) * 0.82;

        for (let j = 0; j < snapSamples && (startSample + j) < totalSamples; j++) {
          const dt = j / sampleRate;
          const decay = Math.exp(-dt * (140 + Math.random() * 120));
          const click = Math.sin(2 * Math.PI * freq * dt) * 0.45 + (Math.random() * 2 - 1) * 0.55;
          data[startSample + j] += click * amp * decay;
        }
      }

      // 3. Normalize peak to prevent clipping
      let maxPeak = 0;
      for (let i = 0; i < totalSamples; i++) {
        const abs = Math.abs(data[i]);
        if (abs > maxPeak) maxPeak = abs;
      }
      if (maxPeak > 0) {
        const factor = 0.78 / maxPeak;
        for (let i = 0; i < totalSamples; i++) {
          data[i] *= factor;
        }
      }
    }

    // Playback through highpass + gain node
    const source = ctx.createBufferSource();
    source.buffer = cachedCrumpleBuffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 180; // Cut low boom, keep dry paper crackle

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    source.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(ctx.currentTime);
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
