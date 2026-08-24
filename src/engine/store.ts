import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyResult {
  score: number;
  maxScore: number;
  rounds: { placeId: string; distKm: number; pts: number; usedHint: boolean }[];
}

export interface Stats {
  kahaGames: number;
  bestDailyScore: number;
  jigsawBest: Record<string, number>;
  jigsawDone: string[];
  trailWins: number;
  trailPerfect: number;
  quizRuns: number;
  quizBestCombo: number;
  quizBestScore: number;
  correctTotal: number;
  hintsUsed: number;
}

export interface GameState {
  xp: number;
  coins: number;
  streak: number;
  bestStreak: number;
  lastPlayDay: string | null;
  playedDays: string[];
  dailyDone: Record<string, DailyResult>;
  stamps: string[];
  badges: string[];
  seenIntro: boolean;
  stats: Stats;
  settings: { lang: 'ne' | 'en'; sound: boolean; name: string };

  addXp: (n: number) => void;
  addCoins: (n: number) => void;
  markPlayedToday: () => void;
  completeDaily: (dateKey: string, r: DailyResult) => void;
  addStamp: (districtId: string) => boolean;
  awardBadge: (id: string) => boolean;
  setJigsawBest: (key: string, seconds: number) => boolean;
  bumpStat: (k: keyof Stats, n?: number) => void;
  setLang: (l: 'ne' | 'en') => void;
  toggleSound: () => void;
  setName: (n: string) => void;
  seenIntroNow: () => void;
}

export function dayStr(d = new Date()): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      coins: 0,
      streak: 0,
      bestStreak: 0,
      lastPlayDay: null,
      playedDays: [],
      dailyDone: {},
      stamps: [],
      badges: [],
      seenIntro: false,
      stats: {
        kahaGames: 0,
        bestDailyScore: 0,
        jigsawBest: {},
        jigsawDone: [],
        trailWins: 0,
        trailPerfect: 0,
        quizRuns: 0,
        quizBestCombo: 0,
        quizBestScore: 0,
        correctTotal: 0,
        hintsUsed: 0,
      },
      settings: { lang: 'ne', sound: true, name: '' },

      addXp: (n) => set(s => ({ xp: s.xp + n })),
      addCoins: (n) => set(s => ({ coins: Math.max(0, s.coins + n) })),

      markPlayedToday: () => {
        const today = dayStr();
        const s = get();
        if (s.lastPlayDay === today) return;
        const cont = s.lastPlayDay === yesterdayStr();
        const streak = cont ? s.streak + 1 : 1;
        set({
          lastPlayDay: today,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          playedDays: [...new Set([...s.playedDays, today])].slice(-90),
        });
      },

      completeDaily: (dateKey, r) => set(s => ({ dailyDone: { ...s.dailyDone, [dateKey]: r } })),

      addStamp: (districtId) => {
        const s = get();
        if (s.stamps.includes(districtId)) return false;
        set({ stamps: [...s.stamps, districtId] });
        return true;
      },

      awardBadge: (id) => {
        const s = get();
        if (s.badges.includes(id)) return false;
        set({ badges: [...s.badges, id] });
        return true;
      },

      setJigsawBest: (key, seconds) => {
        const s = get();
        const prev = s.stats.jigsawBest[key];
        if (prev !== undefined && prev <= seconds) return false;
        set({ stats: { ...s.stats, jigsawBest: { ...s.stats.jigsawBest, [key]: seconds } } });
        return true;
      },

      bumpStat: (k, n = 1) => {
        const s = get();
        const cur = s.stats[k];
        if (typeof cur === 'number') {
          set({ stats: { ...s.stats, [k]: cur + n } });
        }
      },

      setLang: (l) => set(st => ({ settings: { ...st.settings, lang: l } })),
      toggleSound: () => set(st => ({ settings: { ...st.settings, sound: !st.settings.sound } })),
      setName: (n) => set(st => ({ settings: { ...st.settings, name: n } })),
      seenIntroNow: () => set({ seenIntro: true }),
    }),
    { name: 'nepalkhel-save-v1' }
  )
);
