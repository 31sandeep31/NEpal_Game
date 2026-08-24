import type { Lang } from '../i18n';

export interface Rank { min: number; emoji: string; ne: string; en: string }
export const RANKS: Rank[] = [
  { min: 0, emoji: '🌱', ne: 'सिकारु', en: 'Rookie' },
  { min: 150, emoji: '🌾', ne: 'तराई यात्री', en: 'Terai Wanderer' },
  { min: 400, emoji: '⛰️', ne: 'पहाडे', en: 'Hill Trekker' },
  { min: 800, emoji: '🧗', ne: 'लेकाली', en: 'Lekh Climber' },
  { min: 1400, emoji: '🧭', ne: 'यात्री', en: 'Traveler' },
  { min: 2200, emoji: '🔥', ne: 'साहसी', en: 'Bold Explorer' },
  { min: 3200, emoji: '🦅', ne: 'डाँफे स्काउट', en: 'Danphe Scout' },
  { min: 4500, emoji: '🐅', ne: 'बाघ शिकारी', en: 'Tiger Tracker' },
  { min: 6000, emoji: '🏔️', ne: 'हिमाल गाइड', en: 'Himal Guide' },
  { min: 8000, emoji: '⭐', ne: 'सगरमाथा', en: 'Sagarmatha Elite' },
  { min: 11000, emoji: '👑', ne: 'यात्रा गुरु', en: 'Yatra Guru' },
  { min: 15000, emoji: '💎', ne: 'नेपाल गुरु', en: 'Nepal Guru' },
];

export function rankFor(xp: number): { idx: number; rank: Rank; next?: Rank } {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) idx = i;
  return { idx: idx + 1, rank: RANKS[idx], next: RANKS[idx + 1] };
}

export interface BadgeDef {
  id: string;
  emoji: string;
  ne: string;
  en: string;
  descNe: string;
  descEn: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_play', emoji: '👣', ne: 'पहिलो पाइला', en: 'First Steps', descNe: 'पहिलो खेल खेल्नुहोस्', descEn: 'Play your first game' },
  { id: 'daily_1', emoji: '📅', ne: 'दैनिक सुरुवात', en: 'Daily Starter', descNe: 'पहिलो दैनिक चुनौती पूरा गर्नुहोस्', descEn: 'Complete your first daily challenge' },
  { id: 'streak_3', emoji: '🔥', ne: 'तीन दिन', en: 'On Fire', descNe: '३ दिनको स्ट्रिक', descEn: 'Reach a 3-day streak' },
  { id: 'streak_7', emoji: '⚡', ne: 'एक हप्ता', en: 'Week Warrior', descNe: '७ दिनको स्ट्रिक', descEn: 'Reach a 7-day streak' },
  { id: 'streak_14', emoji: '🌟', ne: 'दुई हप्ता', en: 'Fortnight Star', descNe: '१४ दिनको स्ट्रिक', descEn: 'Reach a 14-day streak' },
  { id: 'streak_30', emoji: '🏆', ne: 'महिना सम्राट', en: 'Monthly Monarch', descNe: '३० दिनको स्ट्रिक', descEn: 'Reach a 30-day streak' },
  { id: 'perfect_round', emoji: '🎯', ne: 'निसानेचौँ', en: 'Bullseye', descNe: 'कुनै चरणमा ठीक स्थानमा क्लिक गर्नुहोस्', descEn: 'Hit a near-perfect guess (<5 km)' },
  { id: 'explorer_10', emoji: '🗺️', ne: 'अन्वेषक', en: 'Explorer', descNe: '१० जिल्लाको छाप', descEn: 'Collect 10 district stamps' },
  { id: 'explorer_25', emoji: '🧭', ne: 'पथप्रदर्शक', en: 'Pathfinder', descNe: '२५ जिल्लाको छाप', descEn: 'Collect 25 district stamps' },
  { id: 'explorer_50', emoji: '🏔️', ne: 'हिमाली योद्धा', en: 'Mountain Warrior', descNe: '५० जिल्लाको छाप', descEn: 'Collect 50 district stamps' },
  { id: 'explorer_77', emoji: '👑', ne: 'नेपाल विजेता', en: 'Conqueror of Nepal', descNe: 'सबै ७७ जिल्लाको छाप!', descEn: 'All 77 district stamps!' },
  { id: 'jigsaw_1', emoji: '🧩', ne: 'जिगसा सुरुवात', en: 'Puzzle Rookie', descNe: 'कुनै एक प्रदेश पूरा गर्नुहोस्', descEn: 'Complete any province puzzle' },
  { id: 'jigsaw_all', emoji: '🇳🇵', ne: 'जिगसा मास्टर', en: 'Jigsaw Master', descNe: 'सबै प्रदेश + नेपाल जिगसा पूरा', descEn: 'Complete every province + Nepal puzzle' },
  { id: 'trail_win', emoji: '🚌', ne: 'यात्रा सफल', en: 'Trail Blazer', descNe: 'संस्कृति यात्रा पूरा गर्नुहोस्', descEn: 'Finish the Sanskriti Trail' },
  { id: 'trail_perfect', emoji: '🎓', ne: 'संस्कृति विद्वान्', en: 'Culture Scholar', descNe: 'एउटा यात्रामा सबै प्रश्न सही', descEn: 'Win a trail run answering everything right' },
  { id: 'quiz_combo10', emoji: '⚡', ne: 'धावा', en: 'Combo x10', descNe: 'क्विजमा १० कम्बो', descEn: 'Hit a 10 combo in Quiz Rush' },
  { id: 'quiz_score1500', emoji: '💯', ne: 'ज्ञान रत्न', en: 'Knowledge Gem', descNe: 'क्विजमा १५००+ अङ्क', descEn: 'Score 1500+ in Quiz Rush' },
];

export function badgeLabel(b: BadgeDef, lang: Lang): string {
  return lang === 'ne' ? b.ne : b.en;
}
