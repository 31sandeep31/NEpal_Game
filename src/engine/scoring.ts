/** Geo + scoring utilities */

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** 0..5000 points, exponential falloff */
export function scoreForDistance(km: number): number {
  if (km < 5) return 5000;
  if (km > 2500) return 0;
  const s = Math.round(5000 * Math.exp(-km / 1200));
  return Math.max(0, Math.min(5000, s));
}

/** Compass direction of the true answer relative to the guess */
const ARROWS = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
export function bearingArrow(latG: number, lngG: number, latT: number, lngT: number): string {
  const y = latT - latG;
  const x = (lngT - lngG) * Math.cos((latT * Math.PI) / 180);
  if (Math.hypot(x, y) < 0.05) return '🎯';
  const deg = (Math.atan2(x, y) * 180) / Math.PI;
  const idx = Math.round(((deg + 360) % 360) / 45) % 8;
  return ARROWS[idx];
}

export type Bucket = 'perfect' | 'great' | 'good' | 'ok' | 'bad';
export function bucketFor(km: number): Bucket {
  if (km < 25) return 'perfect';
  if (km < 150) return 'great';
  if (km < 500) return 'good';
  if (km < 1500) return 'ok';
  return 'bad';
}
export const BUCKET_EMOJI: Record<Bucket, string> = {
  perfect: '🟩',
  great: '🟢',
  good: '🟨',
  ok: '🟧',
  bad: '🟥',
};

/** Build Wordle-style shareable text */
export function shareText(dateKey: string, rounds: { distKm: number; pts: number; arrow: string }[], total: number, maxTotal: number): string {
  const stars = total >= maxTotal * 0.9 ? '🏆' : total >= maxTotal * 0.7 ? '🌟' : total >= maxTotal * 0.4 ? '👍' : '💪';
  return (
    'NepalKhel कहाँ छ? ' + dateKey + ' ' + stars + '\n' +
    rounds.map(r => BUCKET_EMOJI[bucketFor(r.distKm)] + r.arrow).join(' ') + '\n' +
    total.toLocaleString() + '/' + maxTotal.toLocaleString() + ' अंक\n' +
    'nepalkhel.game'
  );
}
