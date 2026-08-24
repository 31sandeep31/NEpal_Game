/** Tiny procedural sound effects via WebAudio — no audio files needed */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08, delay = 0) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + delay);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + delay + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + dur);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime + delay);
  o.stop(c.currentTime + delay + dur + 0.05);
}

import { useGame } from './store';

function enabled(): boolean {
  return useGame.getState().settings.sound;
}

export const sfx = {
  click() { if (enabled()) blip(600, 0.06, 'triangle', 0.05); },
  place() { if (enabled()) { blip(440, 0.08, 'sine'); blip(660, 0.1, 'sine', 0.06, 0.06); } },
  correct() { if (enabled()) { blip(523, 0.12); blip(659, 0.12, 'sine', 0.08, 0.09); blip(784, 0.18, 'sine', 0.08, 0.18); } },
  wrong() { if (enabled()) { blip(220, 0.15, 'sawtooth', 0.06); blip(180, 0.2, 'sawtooth', 0.06, 0.12); } },
  snap() { if (enabled()) blip(880, 0.07, 'square', 0.04); },
  win() {
    if (!enabled()) return;
    [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.16, 'triangle', 0.09, i * 0.11));
  },
  lose() { if (enabled()) { blip(330, 0.2, 'sawtooth', 0.06); blip(262, 0.3, 'sawtooth', 0.06, 0.18); } },
  dice() {
    if (!enabled()) return;
    for (let i = 0; i < 6; i++) blip(200 + Math.random() * 500, 0.05, 'square', 0.03, i * 0.07);
  },
  tick() { if (enabled()) blip(1000, 0.03, 'sine', 0.03); },
};
