import { PLACES } from '../data/places';
import { TRIVIA } from '../data/trivia';
import type { Trivia } from '../data/trivia';

/** Deterministic PRNG so every player gets the same daily puzzle */
function hashStr(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todayKey(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function pickSeeded<T>(arr: T[], n: number, rnd: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  return out;
}

/** Daily places: same 5 for everyone on a given date. Mix of tiers. */
export function dailyPlaces(dateKey = todayKey()) {
  const rnd = mulberry32(hashStr('KAHA-' + dateKey));
  const t1 = PLACES.filter(p => p.tier === 1);
  const t2 = PLACES.filter(p => p.tier === 2);
  const t3 = PLACES.filter(p => p.tier === 3);
  // spread across the country
  const shuffled = pickSeeded([...t1, ...t2, ...t3], 5, rnd);
  // ensure at least one tier-1 as opener when available
  if (!shuffled.some(p => p.tier === 1) && t1.length > 0) shuffled[0] = t1[Math.floor(rnd() * t1.length)];
  return shuffled;
}

/** Random practice targets */
export function practicePlaces(n = 5, difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
  const pool =
    difficulty === 'easy' ? PLACES.filter(p => p.tier <= 2)
      : difficulty === 'hard' ? [...PLACES]
        : [...PLACES];
  return pickSeeded(pool, n, Math.random);
}

/** Seeded trivia selection for trail game (same route each day per board seed) */
export function triviaForBoard(seed: string, count: number): Trivia[] {
  const rnd = mulberry32(hashStr('TRAIL-' + seed));
  return pickSeeded(TRIVIA, count, rnd);
}

export function randomTrivia(count: number): Trivia[] {
  return pickSeeded(TRIVIA, count, Math.random);
}

/** Fisher-Yates shuffle utility */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
