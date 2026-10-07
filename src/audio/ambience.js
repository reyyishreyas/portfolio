/**
 * Journey-reactive forest ambience — everything is synthesized, so
 * there are no audio files to license. Seven layers (wind, leaves,
 * insects, rain, flood water, underwater drone, technology tones)
 * crossfade with the scroll position, and a master lowpass muffles
 * the whole world as the water rises. Random event layers — bird
 * chirps, distant thunder, bubbles, synth pings — fire only while
 * their journey phase is active, so the sound tells the same story
 * as the picture. Started from a user gesture (autoplay policy);
 * mute ramps the master gain so unmuting never needs another
 * gesture to resume. Deliberately not a music bed: there is no
 * melody anywhere, only environmental sound.
 */
import { journeyState } from '../three/journey';

const BIRD_MIN_MS = 3500;
const BIRD_MAX_MS = 9000;

/**
 * Piecewise progress → value with smooth joins. Keys are
 * [journeyProgress, value] pairs in ascending progress order; outside
 * the range the first/last value holds.
 *
 * @param {number} p journey progress
 * @param {Array<[number, number]>} keys
 * @returns {number}
 */
function track(p, keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i += 1) {
    if (p <= keys[i][0]) {
      const [p0, v0] = keys[i - 1];
      const [p1, v1] = keys[i];
      const u = (p - p0) / (p1 - p0);
      return v0 + (v1 - v0) * (u * u * (3 - 2 * u));
    }
  }
  return keys[keys.length - 1][1];
}

// journey tracks (beat boundaries: see three/journey.js BEATS)
const FOREST = [
  [0, 1], [0.165, 1], [0.21, 0], // rain washes the canopy quiet
  [0.815, 0], [0.875, 1], [1, 1], // nature returns at the end
];
const WIND = [
  [0, 1], [0.18, 1.1], [0.26, 1.5], [0.31, 2.1], // storm build
  [0.37, 1.25], [0.44, 0.5], [0.5, 0.3], [0.8, 0.3], // engineered quiet
  [0.87, 1], [1, 1],
];
const RAIN = [
  [0, 0], [0.18, 0], [0.24, 0.4], [0.26, 0.55], [0.31, 1],
  [0.36, 0.85], [0.39, 0], [1, 0],
];
const WATER = [[0, 0], [0.31, 0], [0.345, 1], [0.4, 0.6], [0.43, 0], [1, 0]];
const DEEP = [[0, 0], [0.35, 0], [0.4, 1], [0.44, 0.85], [0.49, 0], [1, 0]];
const MUFFLE = [[0, 0], [0.31, 0], [0.36, 1], [0.44, 1], [0.48, 0], [1, 0]];
const TECH = [[0, 0], [0.44, 0], [0.5, 1], [0.8, 1], [0.86, 0], [1, 0]];
const THUNDER = [[0, 0], [0.25, 0], [0.27, 1], [0.32, 1], [0.34, 0], [1, 0]];
const BUBBLES = [[0, 0], [0.355, 0], [0.37, 1], [0.43, 1], [0.45, 0], [1, 0]];

// pentatonic set for the technology tones (A minor without B)
const TECH_NOTES = [220, 261.63, 293.66, 329.63, 392];

/**
 * Looping noise buffer. 'brown' is a leaked integrator (wind, water
 * bodies); 'white' is flat (rain hiss).
 *
 * @param {AudioContext} ctx
 * @param {'brown'|'white'} kind
 * @returns {AudioBuffer}
 */
function noiseBuffer(ctx, kind) {
  const len = ctx.sampleRate * 8;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

class ForestAmbience {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    /** @type {GainNode|null} */
    this.master = null;
    /** @type {BiquadFilterNode|null} */
    this.muffle = null;
    /** @type {Record<string, GainNode>} layer buses, 0..1 journey gains */
    this.layers = {};
    /** @type {AudioBuffer|null} */
    this.brown = null;
    /** current journey amounts for the random event layers */
    this.amt = { forest: 1, thunder: 0, bubbles: 0, tech: 0 };
    this.gustTimer = 0;
    this.started = false;
    this.muted = false;
  }

  /**
   * Build the graph and start it. Safe to call repeatedly.
   *
   * @returns {Promise<boolean>} true if audio is running
   */
  async start() {
    if (this.started && this.ctx) {
      await this.ctx.resume().catch(() => {});
      return !this.muted;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;

    const ctx = new Ctx();
    this.ctx = ctx;
    this.started = true;

    // master → water muffle → speakers; mute rides the master gain
    const master = ctx.createGain();
    master.gain.value = 0;
    const muffle = ctx.createBiquadFilter();
    muffle.type = 'lowpass';
    muffle.frequency.value = 20000;
    muffle.Q.value = 0.4;
    master.connect(muffle).connect(ctx.destination);
    this.master = master;
    this.muffle = muffle;

    const brown = noiseBuffer(ctx, 'brown');
    const white = noiseBuffer(ctx, 'white');
    this.brown = brown;

    /** @param {string} name @returns {GainNode} */
    const layer = (name) => {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(master);
      this.layers[name] = g;
      return g;
    };

    // wind: low body with gusting filter and gain (see below)
    const wind = ctx.createBufferSource();
    wind.buffer = brown;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 480;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.16;
    wind.connect(windFilter).connect(windGain).connect(layer('wind'));
    wind.start();

    // gusts: slow random walk on wind filter + gain
    const gust = () => {
      if (!this.ctx) return;
      const t = ctx.currentTime;
      windFilter.frequency.cancelScheduledValues(t);
      windFilter.frequency.linearRampToValueAtTime(320 + Math.random() * 520, t + 4 + Math.random() * 5);
      windGain.gain.cancelScheduledValues(t);
      windGain.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.12, t + 4 + Math.random() * 5);
      this.gustTimer = window.setTimeout(gust, 4500 + Math.random() * 5000);
    };
    gust();

    // leaf rustle: brighter noise band, quieter, faster shimmer
    const leaves = ctx.createBufferSource();
    leaves.buffer = brown;
    leaves.loop = true;
    leaves.playbackRate.value = 1.6;
    const leafFilter = ctx.createBiquadFilter();
    leafFilter.type = 'bandpass';
    leafFilter.frequency.value = 2100;
    leafFilter.Q.value = 0.7;
    const leafGain = ctx.createGain();
    leafGain.gain.value = 0.035;
    leaves.connect(leafFilter).connect(leafGain).connect(layer('leaf'));
    leaves.start();
    const shimmer = () => {
      if (!this.ctx) return;
      const t = ctx.currentTime;
      leafGain.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.04, t + 2 + Math.random() * 3);
      window.setTimeout(shimmer, 2500 + Math.random() * 3500);
    };
    shimmer();

    // insects: thin high shimmer above the leaves (cicada band)
    const bugs = ctx.createBufferSource();
    bugs.buffer = brown;
    bugs.loop = true;
    bugs.playbackRate.value = 2.2;
    const bugFilter = ctx.createBiquadFilter();
    bugFilter.type = 'bandpass';
    bugFilter.frequency.value = 6200;
    bugFilter.Q.value = 8;
    const bugGain = ctx.createGain();
    bugGain.gain.value = 0.02;
    bugs.connect(bugFilter).connect(bugGain).connect(layer('insect'));
    bugs.start();

    // rain: flat hiss band, bright but finite
    const rain = ctx.createBufferSource();
    rain.buffer = white;
    rain.loop = true;
    const rainHP = ctx.createBiquadFilter();
    rainHP.type = 'highpass';
    rainHP.frequency.value = 500;
    const rainLP = ctx.createBiquadFilter();
    rainLP.type = 'lowpass';
    rainLP.frequency.value = 6500;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.13;
    rain.connect(rainHP).connect(rainLP).connect(rainGain).connect(layer('rain'));
    rain.start();

    // flood: mid-band brown rush, reads as water around the camera
    const water = ctx.createBufferSource();
    water.buffer = brown;
    water.loop = true;
    water.playbackRate.value = 1.2;
    const waterBP = ctx.createBiquadFilter();
    waterBP.type = 'bandpass';
    waterBP.frequency.value = 350;
    waterBP.Q.value = 0.6;
    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.2;
    water.connect(waterBP).connect(waterGain).connect(layer('water'));
    water.start();

    // underwater: two detuned low sines, slow beating = deep ambience
    const deepSum = ctx.createGain();
    for (const f of [55, 58.7]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(deepSum);
      osc.start();
    }
    const deepLP = ctx.createBiquadFilter();
    deepLP.type = 'lowpass';
    deepLP.frequency.value = 140;
    const deepGain = ctx.createGain();
    deepGain.gain.value = 0.1;
    deepSum.connect(deepLP).connect(deepGain).connect(layer('deep'));

    // technology: low detuned pad (roots of the computation zones)
    const padSum = ctx.createGain();
    for (const f of [55, 82.41]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      osc.connect(padSum);
      osc.start();
    }
    const padLP = ctx.createBiquadFilter();
    padLP.type = 'lowpass';
    padLP.frequency.value = 360;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.05;
    padSum.connect(padLP).connect(padGain).connect(layer('tech'));

    await ctx.resume().catch(() => {});
    master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.9, ctx.currentTime + 1.6);
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 350);
    this.scheduleBird();
    this.scheduleThunder();
    this.scheduleBubble();
    this.schedulePing();
    return !this.muted;
  }

  /**
   * Re-read journey progress and glide every layer toward its
   * current phase. Called on a short interval; setTargetAtTime makes
   * repeated identical calls harmless.
   *
   * @returns {void}
   */
  tick() {
    if (!this.ctx || !this.master || !this.muffle) return;
    const p = journeyState.progress;
    const t = this.ctx.currentTime;
    const tau = 0.7;
    this.amt.forest = track(p, FOREST);
    this.amt.rain = track(p, RAIN);
    this.amt.thunder = track(p, THUNDER);
    this.amt.bubbles = track(p, BUBBLES);
    this.amt.tech = track(p, TECH);
    const set = (name, v) => {
      const g = this.layers[name];
      if (g) g.gain.setTargetAtTime(v, t, tau);
    };
    set('wind', track(p, WIND));
    set('leaf', this.amt.forest);
    set('insect', this.amt.forest * 0.9);
    set('rain', this.amt.rain);
    set('water', track(p, WATER));
    set('deep', track(p, DEEP));
    set('tech', this.amt.tech);
    const m = track(p, MUFFLE);
    this.muffle.frequency.setTargetAtTime(20000 - m * 19700, t, 0.8);
  }

  /** One short chirp, then reschedule while the context is alive. */
  scheduleBird() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const delay = BIRD_MIN_MS + Math.random() * (BIRD_MAX_MS - BIRD_MIN_MS);
    window.setTimeout(() => {
      if (!this.ctx || ctx.state !== 'running') {
        this.scheduleBird();
        return;
      }
      if (this.amt.forest > 0.45 && !this.muted) {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const base = 2300 + Math.random() * 900;
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * (0.72 + Math.random() * 0.2), t + 0.12);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
        osc.connect(gain);
        if (pan) {
          pan.pan.value = Math.random() * 1.6 - 0.8;
          gain.connect(pan).connect(this.master);
        } else {
          gain.connect(this.master);
        }
        osc.start(t);
        osc.stop(t + 0.2);
      }
      this.scheduleBird();
    }, delay);
  }

  /** Distant thunder: a slow brown-noise swell, storm phase only. */
  scheduleThunder() {
    if (!this.ctx || !this.master || !this.brown) return;
    const ctx = this.ctx;
    const delay = 7000 + Math.random() * 8000;
    window.setTimeout(() => {
      if (!this.ctx || ctx.state !== 'running') {
        this.scheduleThunder();
        return;
      }
      if (this.amt.thunder > 0.5 && !this.muted) {
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = this.brown;
        src.loop = true;
        src.playbackRate.value = 0.5 + Math.random() * 0.3;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 130;
        lp.Q.value = 0.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.2, t + 0.7 + Math.random() * 0.5);
        // long rolling tail under the storm
        gain.gain.setTargetAtTime(0, t + 1.5, 1.1);
        src.connect(lp).connect(gain).connect(this.master);
        src.start(t);
        src.stop(t + 6);
      }
      this.scheduleThunder();
    }, delay);
  }

  /** Underwater bubbles: short rising blips, submerged phase only. */
  scheduleBubble() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const delay = 420 + Math.random() * 1200;
    window.setTimeout(() => {
      if (!this.ctx || ctx.state !== 'running') {
        this.scheduleBubble();
        return;
      }
      if (this.amt.bubbles > 0.5 && !this.muted) {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const f = 170 + Math.random() * 140;
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * (2.4 + Math.random()), t + 0.09);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        osc.connect(gain);
        if (pan) {
          pan.pan.value = Math.random() * 1.4 - 0.7;
          gain.connect(pan).connect(this.master);
        } else {
          gain.connect(this.master);
        }
        osc.start(t);
        osc.stop(t + 0.3);
      }
      this.scheduleBubble();
    }, delay);
  }

  /** Technology tones: sparse pentatonic pings through the tech bus. */
  schedulePing() {
    if (!this.ctx || !this.layers.tech) return;
    const ctx = this.ctx;
    const delay = 1700 + Math.random() * 2400;
    window.setTimeout(() => {
      if (!this.ctx || ctx.state !== 'running') {
        this.schedulePing();
        return;
      }
      if (this.amt.tech > 0.45 && !this.muted) {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = TECH_NOTES[Math.floor(Math.random() * TECH_NOTES.length)]
          * (Math.random() < 0.3 ? 2 : 1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.045, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 1.4);
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        osc.connect(gain);
        if (pan) {
          pan.pan.value = Math.random() * 1.2 - 0.6;
          gain.connect(pan).connect(this.layers.tech);
        } else {
          gain.connect(this.layers.tech);
        }
        osc.start(t);
        osc.stop(t + 1.5);
      }
      this.schedulePing();
    }, delay);
  }

  /**
   * Mute or unmute the bed.
   *
   * @returns {boolean} the new muted state
   */
  toggleMute() {
    if (!this.ctx || !this.master) {
      this.muted = true;
      return this.muted;
    }
    this.muted = !this.muted;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.9, t + 0.4);
    if (!this.muted) this.ctx.resume().catch(() => {});
    return this.muted;
  }
}

/** One instance for the whole site. */
export const ambience = new ForestAmbience();

// dev hook: QA scripts read live layer amounts without a UI probe
if (import.meta.env.DEV) {
  window.__ambience = ambience;
}
