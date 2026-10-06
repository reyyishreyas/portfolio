/**
 * Synthesized forest ambience — no audio files, nothing to license.
 * Wind and leaf rustle are filtered noise buffers with slow LFO gusts;
 * birds are short random pitch-swept chirps. Must be started from a
 * user gesture (browser autoplay policy); mute ramps the master gain
 * so unmuting never needs another gesture to resume.
 */

const BIRD_MIN_MS = 3500;
const BIRD_MAX_MS = 9000;

class ForestAmbience {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    /** @type {GainNode|null} */
    this.master = null;
    /** @type {number} */
    this.birdTimer = 0;
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

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // brown noise: leaked integrator over white noise, loops for 8s
    const len = ctx.sampleRate * 8;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }

    // low wind body
    const wind = ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 480;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.16;
    wind.connect(windFilter).connect(windGain).connect(master);
    wind.start();

    // gusts: slow random walk on wind filter + gain
    const gust = () => {
      if (!this.ctx) return;
      const t = ctx.currentTime;
      windFilter.frequency.cancelScheduledValues(t);
      windFilter.frequency.linearRampToValueAtTime(320 + Math.random() * 520, t + 4 + Math.random() * 5);
      windGain.gain.cancelScheduledValues(t);
      windGain.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.12, t + 4 + Math.random() * 5);
      this.birdTimer = window.setTimeout(gust, 4500 + Math.random() * 5000);
    };
    gust();

    // leaf rustle: brighter noise band, quieter, faster shimmer
    const leaves = ctx.createBufferSource();
    leaves.buffer = buffer;
    leaves.loop = true;
    leaves.playbackRate.value = 1.6;
    const leafFilter = ctx.createBiquadFilter();
    leafFilter.type = 'bandpass';
    leafFilter.frequency.value = 2100;
    leafFilter.Q.value = 0.7;
    const leafGain = ctx.createGain();
    leafGain.gain.value = 0.035;
    leaves.connect(leafFilter).connect(leafGain).connect(master);
    leaves.start();
    const shimmer = () => {
      if (!this.ctx) return;
      const t = ctx.currentTime;
      leafGain.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.04, t + 2 + Math.random() * 3);
      window.setTimeout(shimmer, 2500 + Math.random() * 3500);
    };
    shimmer();

    await ctx.resume().catch(() => {});
    master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.9, ctx.currentTime + 1.6);
    this.scheduleBird();
    return !this.muted;
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
      this.scheduleBird();
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
