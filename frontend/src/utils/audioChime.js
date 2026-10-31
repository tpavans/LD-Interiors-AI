// Authentic Handcrafted Burma Teakwood Acoustic Sound Synthesizer via Web Audio API
export const playWoodenChime = () => {
  try {
    if (typeof window === 'undefined') return;

    // Check if user has disabled sound in settings
    const soundEnabled = localStorage.getItem('ld_wood_sound_enabled');
    if (soundEnabled === 'false') return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic frequencies for rich resonant Burma Teak wood (Marimba / Teakwood xylophone)
    const tones = [
      { freq: 587.33, type: 'sine', gain: 0.35, decay: 0.45, delay: 0.0 },     // D5 warm core
      { freq: 1174.66, type: 'triangle', gain: 0.15, decay: 0.35, delay: 0.02 }, // D6 overtone
      { freq: 880.00, type: 'sine', gain: 0.22, decay: 0.40, delay: 0.16 },     // A5 golden bell chime
      { freq: 1760.00, type: 'triangle', gain: 0.08, decay: 0.28, delay: 0.18 } // A6 sparkle
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = tone.type;
      osc.frequency.setValueAtTime(tone.freq, now + tone.delay);

      // Warm low-pass acoustic wood resonance filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now + tone.delay);
      filter.frequency.exponentialRampToValueAtTime(350, now + tone.delay + tone.decay);

      // Percussive wood-strike envelope
      const startTime = now + tone.delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(tone.gain, startTime + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.decay);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + tone.decay + 0.05);
    });

  } catch (err) {
    // Non-blocking fallback for autoplay constraints
  }
};
