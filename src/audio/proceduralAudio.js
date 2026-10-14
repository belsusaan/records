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
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Mechanical thud
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

  oscGain.gain.setValueAtTime(0.4, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);

  // Surface scratch burst
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 3.0;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.2, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now + 0.03);
}

/**
 * Play needle lift sound when pausing/stopping
 */
export function playNeedleLiftSFX() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(50, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

  oscGain.gain.setValueAtTime(0.18, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Continuous realistic vinyl crackle generator (filtered noise + random dust pops)
 */
export function startVinylCrackle(volume = 0.22) {
  const ctx = getAudioContext();
  if (!ctx) return;

  stopVinylCrackle();

  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pinkish noise
      const white = Math.random() * 2 - 1;
      const pink = (lastOut + 0.02 * white) / 1.02;
      lastOut = pink;

      // Random vinyl pops and dust ticks
      const isPop = Math.random() < 0.00065;
      const pop = isPop ? (Math.random() * 2 - 1) * 3.5 : 0;

      data[i] = pink * 0.15 + pop;
    }
  }

  crackleSource = ctx.createBufferSource();
  crackleSource.buffer = buffer;
  crackleSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1600;
  filter.Q.value = 0.8;

  crackleGain = ctx.createGain();
  crackleGain.gain.setValueAtTime(volume, ctx.currentTime);

  crackleSource.connect(filter);
  filter.connect(crackleGain);
  crackleGain.connect(ctx.destination);

  crackleSource.start();
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
  const ctx = getAudioContext();
  if (!ctx) return;

  stopProceduralMusic();

  const chords = CHORD_PROGRESSIONS[preset] || CHORD_PROGRESSIONS['rhodes-warm'];
  let step = 0;

  synthGain = ctx.createGain();
  synthGain.gain.setValueAtTime(volume * 0.45, ctx.currentTime);
  synthGain.connect(ctx.destination);

  const playStep = () => {
    if (!synthGain) return;
    const now = ctx.currentTime;
    const currentChord = chords[step % chords.length];
    step++;

    currentChord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Soft triangle + sine blend for warm vintage Rhodes / electric piano
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      // Tremolo/vibrato LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 4.5;
      lfoGain.gain.value = 1.5;
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 2.8);

      const noteDuration = 2.6;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.15 + idx * 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

      osc.connect(noteGain);
      noteGain.connect(synthGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + noteDuration);
    });
  };

  playStep();
  synthTimer = setInterval(playStep, 2500);
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
