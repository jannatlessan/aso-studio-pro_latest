/**
 * Tiny synthesised sound engine for the games under /games.
 *
 * Everything is generated with oscillators and a noise buffer at runtime, so there are no audio
 * files to download and nothing to block the first paint. Browsers refuse to start an AudioContext
 * before a user gesture, so the context is created lazily on the first `play()` that follows one.
 */

const MUTE_KEY = 'shaaddev.game.muted';

export type Sfx =
  | 'ui'
  | 'move'
  | 'rotate'
  | 'merge'
  | 'eat'
  | 'bonus'
  | 'combo'
  | 'drop'
  | 'lock'
  | 'clear'
  | 'quad'
  | 'levelup'
  | 'crash'
  | 'gameover'
  | 'win';

type Wave = OscillatorType;

interface Tone {
  /** Start frequency in Hz. */
  f: number;
  /** Optional glide target. */
  to?: number;
  /** Seconds. */
  d: number;
  wave?: Wave;
  gain?: number;
  /** Delay before this tone starts, in seconds. */
  at?: number;
}

/** Each effect is a short list of tones; `noise` adds a filtered burst for impacts. */
const RECIPES: Record<Sfx, { tones: Tone[]; noise?: { d: number; gain: number; freq: number } }> = {
  ui: { tones: [{ f: 880, d: 0.06, wave: 'triangle', gain: 0.12 }] },
  move: { tones: [{ f: 220, to: 260, d: 0.05, wave: 'square', gain: 0.05 }] },
  rotate: { tones: [{ f: 340, to: 420, d: 0.06, wave: 'square', gain: 0.07 }] },
  merge: { tones: [{ f: 440, to: 700, d: 0.12, wave: 'triangle', gain: 0.16 }] },
  eat: { tones: [{ f: 520, to: 820, d: 0.1, wave: 'sine', gain: 0.18 }] },
  bonus: {
    tones: [
      { f: 660, d: 0.08, wave: 'triangle', gain: 0.16 },
      { f: 880, d: 0.08, wave: 'triangle', gain: 0.16, at: 0.07 },
      { f: 1175, d: 0.14, wave: 'triangle', gain: 0.16, at: 0.14 }
    ]
  },
  combo: { tones: [{ f: 740, to: 1180, d: 0.14, wave: 'triangle', gain: 0.14 }] },
  drop: { tones: [{ f: 260, to: 90, d: 0.14, wave: 'sawtooth', gain: 0.12 }], noise: { d: 0.08, gain: 0.06, freq: 1400 } },
  lock: { tones: [{ f: 170, d: 0.07, wave: 'square', gain: 0.1 }] },
  clear: {
    tones: [
      { f: 523, d: 0.09, wave: 'triangle', gain: 0.17 },
      { f: 784, d: 0.12, wave: 'triangle', gain: 0.17, at: 0.08 }
    ]
  },
  quad: {
    tones: [
      { f: 523, d: 0.1, wave: 'square', gain: 0.14 },
      { f: 659, d: 0.1, wave: 'square', gain: 0.14, at: 0.08 },
      { f: 784, d: 0.1, wave: 'square', gain: 0.14, at: 0.16 },
      { f: 1047, d: 0.22, wave: 'square', gain: 0.16, at: 0.24 }
    ]
  },
  levelup: {
    tones: [
      { f: 440, d: 0.1, wave: 'triangle', gain: 0.16 },
      { f: 659, d: 0.1, wave: 'triangle', gain: 0.16, at: 0.09 },
      { f: 880, d: 0.2, wave: 'triangle', gain: 0.18, at: 0.18 }
    ]
  },
  crash: {
    tones: [{ f: 180, to: 60, d: 0.3, wave: 'sawtooth', gain: 0.18 }],
    noise: { d: 0.22, gain: 0.16, freq: 900 }
  },
  gameover: {
    tones: [
      { f: 440, d: 0.16, wave: 'triangle', gain: 0.16 },
      { f: 330, d: 0.16, wave: 'triangle', gain: 0.16, at: 0.15 },
      { f: 220, d: 0.34, wave: 'triangle', gain: 0.16, at: 0.3 }
    ]
  },
  win: {
    tones: [
      { f: 523, d: 0.12, wave: 'triangle', gain: 0.17 },
      { f: 659, d: 0.12, wave: 'triangle', gain: 0.17, at: 0.1 },
      { f: 784, d: 0.12, wave: 'triangle', gain: 0.17, at: 0.2 },
      { f: 1047, d: 0.3, wave: 'triangle', gain: 0.2, at: 0.3 }
    ]
  }
};

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private mutedValue = false;
  private listeners = new Set<(muted: boolean) => void>();

  constructor() {
    try {
      this.mutedValue = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      /* storage blocked — default to sound on */
    }
  }

  get muted() {
    return this.mutedValue;
  }

  setMuted(value: boolean) {
    this.mutedValue = value;
    try {
      localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(value ? 0 : 1, this.ctx.currentTime, 0.01);
    }
    this.listeners.forEach((fn) => fn(value));
  }

  subscribe(fn: (muted: boolean) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.mutedValue ? 0 : 1;
      this.master.connect(this.ctx.destination);

      const length = Math.floor(this.ctx.sampleRate * 0.3);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  play(name: Sfx, rate = 1) {
    if (this.mutedValue) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    // Safari suspends the context until a gesture; resuming here is harmless when already running.
    if (ctx.state === 'suspended') void ctx.resume();

    const recipe = RECIPES[name];
    const now = ctx.currentTime;

    recipe.tones.forEach((tone) => {
      const start = now + (tone.at ?? 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.wave ?? 'sine';
      osc.frequency.setValueAtTime(tone.f * rate, start);
      if (tone.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, tone.to * rate), start + tone.d);
      const peak = tone.gain ?? 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.d);
      osc.connect(gain).connect(this.master as GainNode);
      osc.start(start);
      osc.stop(start + tone.d + 0.03);
    });

    if (recipe.noise && this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = recipe.noise.freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(recipe.noise.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + recipe.noise.d);
      src.connect(filter).connect(gain).connect(this.master);
      src.start(now);
      src.stop(now + recipe.noise.d + 0.02);
    }
  }
}

export const audio = new GameAudio();
