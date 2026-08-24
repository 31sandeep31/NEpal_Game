import { useEffect, useRef, useState } from 'react';
import { Btn, Modal } from '../components/ui';
import { toast, ConfettiBurst } from '../components/ui';
import type { TFn } from '../i18n';
import { useGame } from '../engine/store';
import { useDistrictFeatures } from '../components/NepalMap';
import { NepalMap } from '../components/NepalMap';
import { triviaForBoard, todayKey } from '../engine/daily';
import type { Trivia } from '../data/trivia';
import { sfx } from '../engine/sfx';

interface Stop {
  name: string; nameNe: string;
  lngLat: [number, number];
  districtId: string;
}
const STOPS: Stop[] = [
  { name: 'Bhadrapur', nameNe: 'भद्रपुर', lngLat: [88.0917, 26.5442], districtId: 'd_jhapa' },
  { name: 'Biratnagar', nameNe: 'विराटनगर', lngLat: [87.2718, 26.4550], districtId: 'd_morang' },
  { name: 'Dharan', nameNe: 'धरान', lngLat: [87.2846, 26.8065], districtId: 'd_sunsari' },
  { name: 'Lahan', nameNe: 'लहान', lngLat: [86.4847, 26.7200], districtId: 'd_siraha' },
  { name: 'Janakpurdham', nameNe: 'जनकपुरधाम', lngLat: [85.9265, 26.7288], districtId: 'd_dhanusha' },
  { name: 'Hetauda', nameNe: 'हेटौंडा', lngLat: [85.0322, 27.4289], districtId: 'd_makwanpur' },
  { name: 'Kathmandu', nameNe: 'काठमाडौँ', lngLat: [85.3240, 27.7172], districtId: 'd_kathmandu' },
  { name: 'Pokhara', nameNe: 'पोखरा', lngLat: [83.9856, 28.2096], districtId: 'd_kaski' },
  { name: 'Butwal', nameNe: 'बुटवल', lngLat: [83.4486, 27.7000], districtId: 'd_rupandehi' },
  { name: 'Nepalgunj', nameNe: 'नेपालगञ्ज', lngLat: [81.6167, 28.0500], districtId: 'd_banke' },
  { name: 'Surkhet', nameNe: 'सुर्खेत', lngLat: [81.6333, 28.6000], districtId: 'd_surkhet' },
  { name: 'Dhangadhi', nameNe: 'धनगढी', lngLat: [80.5898, 28.6983], districtId: 'd_kailali' },
  { name: 'Mahendranagar', nameNe: 'महेन्द्रनगर', lngLat: [80.1219, 28.9636], districtId: 'd_kanchanpur' },
];

type CellType = 'quiz' | 'festival' | 'landslide' | 'rest';
const CELL_ICON: Record<CellType, string> = { quiz: '❓', festival: '🎉', landslide: '🏔️', rest: '⛺' };

interface LogItem { id: number; text: string; bad?: boolean }
let logSeq = 0;

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function TrailGame({ t, onExit }: { t: TFn; onExit: () => void }) {
  const feats = useDistrictFeatures();
  const store = useGame();
  const ne = store.settings.lang === 'ne';
  const [phase, setPhase] = useState<'menu' | 'playing' | 'over'>('menu');
  const [pPos, setPPos] = useState(0);
  const [rPos, setRPos] = useState(0);
  const [busy, setBusy] = useState(false);
  const [diceFace, setDiceFace] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [quiz, setQuiz] = useState<{ q: Trivia; answered: number | null } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);
  const aliveRef = useRef(true);
  const cellsRef = useRef<CellType[]>([]);
  const quizQueue = useRef<Trivia[]>([]);
  const correctRef = useRef({ right: 0, total: 0 });

  useEffect(() => () => { aliveRef.current = false; }, []);

  const addLog = (text: string, bad?: boolean) =>
    setLogs(ls => [...ls.slice(-30), { id: ++logSeq, text, bad }]);

  function buildBoard() {
    const rnd = mulberry(1337 + todayKey().split('-').reduce((a, b) => a + Number(b), 0));
    const cells: CellType[] = [];
    for (let i = 1; i < STOPS.length - 1; i++) {
      const r = rnd();
      cells.push(r < 0.55 ? 'quiz' : r < 0.72 ? 'festival' : r < 0.85 ? 'landslide' : 'rest');
    }
    cellsRef.current = cells; // index i-1 → stop i
    quizQueue.current = triviaForBoard(todayKey(), 40);
    correctRef.current = { right: 0, total: 0 };
  }

  const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

  async function hop(setPos: (fn: (p: number) => number) => void, _from: number, steps: number) {
    void _from;
    for (let s = 0; s < steps; s++) {
      await sleep(260);
      if (!aliveRef.current) return;
      setPos(p => Math.min(STOPS.length - 1, p + 1));
    }
    await sleep(300);
  }

  async function playerRoll() {
    if (busy || phase !== 'playing') return;
    setBusy(true);
    const roll = 1 + Math.floor(Math.random() * 4);
    setDiceFace(roll);
    sfx.dice();
    await sleep(560);
    addLog((ne ? '🚶 तपाईं: ' : '🚶 You: ') + '🎲 ' + roll);
    await hop(setPPos, pPosRef.current, roll);
    await resolveCell('player');
  }

  const pPosRef = useRef(0);
  useEffect(() => { pPosRef.current = pPos; }, [pPos]);

  async function resolveCell(who: 'player' | 'rival') {
    const pos = who === 'player' ? pPosRef.current : rPosRef.current;
    if (pos >= STOPS.length - 1) { endGame(who); return; }
    const cell = cellsRef.current[pos - 1];
    if (who === 'player') {
      if (cell === 'quiz') {
        const q = quizQueue.current.shift();
        if (q) {
          correctRef.current.total += 1;
          setQuiz({ q, answered: null });
          setBusy(false);
          return; // resumes in answerQuiz
        }
      } else if (cell === 'festival') {
        sfx.correct();
        store.addCoins(15);
        addLog(ne ? `🎉 ${STOPS[pos][ne ? 'nameNe' : 'name']}: चाडपर्व! +१५ 🪙` : `🎉 Festival at ${STOPS[pos].name}! +15 🪙`);
        await sleep(400);
        await hop(setPPos, pPosRef.current, 1);
        return void (await afterPlayer());
      } else if (cell === 'landslide') {
        sfx.wrong();
        addLog(ne ? `🏔️ पहिरो! एक स्टेप पछाडि` : '🏔️ Landslide! back one step', true);
        setPPos(p => Math.max(0, p - 1));
        await sleep(500);
        return void (await afterPlayer());
      } else {
        addLog(ne ? `⛺ विश्राम…` : '⛺ Rest stop…');
        await sleep(350);
        return void (await afterPlayer());
      }
    } else {
      // rival auto-resolves
      if (cell === 'quiz') {
        const ok = Math.random() < 0.55;
        if (ok) addLog(ne ? '🤖 प्रतिस्पर्धीले सही जवाफ!' : '🤖 Rival answered correctly!');
        else {
          addLog(ne ? '🤖 प्रतिस्पर्धीले गल्ती गर्‍यो — एक स्टेप पछाडि' : '🤖 Rival slipped — back one', true);
          setRPos(p => Math.max(0, p - 1));
          await sleep(450);
        }
      } else if (cell === 'festival') {
        await hop(setRPos, rPosRef.current, 1);
      } else if (cell === 'landslide') {
        setRPos(p => Math.max(0, p - 1));
        await sleep(450);
      }
      if (rPosRef.current >= STOPS.length - 1) { endGame('rival'); return; }
      setBusy(false);
    }
  }

  const rPosRef = useRef(0);
  useEffect(() => { rPosRef.current = rPos; }, [rPos]);

  async function answerQuiz(idx: number) {
    if (!quiz || quiz.answered !== null) return;
    const q = quiz.q;
    setQuiz({ q, answered: idx });
    await sleep(950);
    if (idx === q.a) {
      correctRef.current.right += 1;
      sfx.correct();
      store.addCoins(20);
      store.bumpStat('correctTotal');
      addLog(ne ? '✅ सही! +२० 🪙' : '✅ Correct! +20 🪙');
      if (store.addStamp(STOPS[pPosRef.current].districtId)) toast('🪧 ' + t('newStamp'));
    } else {
      sfx.wrong();
      addLog(ne ? '❌ बेठीक — एक स्टेप पछाडि' : '❌ Wrong — back a step', true);
      setPPos(p => Math.max(0, p - 1));
      await sleep(450);
    }
    setQuiz(null);
    await afterPlayer();
  }

  async function afterPlayer() {
    if (pPosRef.current >= STOPS.length - 1) { endGame('player'); return; }
    setBusy(true);
    addLog(ne ? '— प्रतिस्पर्धीको पालो —' : "— Rival's turn —");
    await sleep(650);
    const roll = 1 + Math.floor(Math.random() * 4);
    sfx.dice();
    setDiceFace(roll);
    await sleep(520);
    addLog('🤖 🎲 ' + roll);
    await hop(setRPos, rPosRef.current, roll);
    if (rPosRef.current >= STOPS.length - 1) { endGame('rival'); return; }
    await resolveCell('rival');
  }

  function endGame(winner: 'player' | 'rival') {
    setPhase('over');
    setOutcome(winner === 'player' ? 'win' : 'lose');
    if (winner === 'player') { sfx.win(); setConfetti(c => c + 1); } else sfx.lose();
    store.markPlayedToday();
    store.awardBadge('first_play');
    if (winner === 'player') {
      store.addXp(300);
      store.addCoins(50);
      useGame.setState(s => ({ stats: { ...s.stats, trailWins: s.stats.trailWins + 1 } }));
      store.awardBadge('trail_win');
      if (correctRef.current.total > 0 && correctRef.current.right === correctRef.current.total) {
        store.awardBadge('trail_perfect');
        useGame.setState(s => ({ stats: { ...s.stats, trailPerfect: s.stats.trailPerfect + 1 } }));
      }
      toast(ne ? '🎉 मेची→महाकाली पूरा! +३०० XP' : '🎉 Mechi→Mahakali done! +300 XP');
    }
  }

  function start() {
    buildBoard();
    setPPos(0); setRPos(0);
    pPosRef.current = 0; rPosRef.current = 0;
    setLogs([]);
    setOutcome(null);
    setDiceFace(null);
    setPhase('playing');
    addLog(ne ? '🚌 यात्रा सुरु! भद्रपुरबाट महेन्द्रनगरसम्म!' : '🚌 Journey begins! Bhadrapur → Mahendranagar!');
  }

  if (phase === 'menu') {
    return (
      <div className="container page-pad" style={{ paddingTop: 16 }}>
        <Btn kind="ghost" small onClick={onExit}>← {t('back')}</Btn>
        <div className="card glow mt14">
          <h2>🚌 {t('trailTitle')}</h2>
          <p className="muted small mt8">{t('trailDesc')}</p>
          <ul className="small muted mt14" style={{ lineHeight: 1.9, paddingLeft: 18 }}>
            <li>{ne ? '🎲 पासामा १–४ — हरेक पालोमा अगाडि बढ्नुहोस्' : '🎲 Roll 1–4 and advance each turn'}</li>
            <li>{ne ? '❓ क्विज सेल: सही +२०🪙, बेठीकमा एक स्टेप पछाडि' : '❓ Quiz cell: right +20🪙, wrong = step back'}</li>
            <li>{ne ? '🎉 चाडपर्व: +१५🪙 अनि एक थप हप' : '🎉 Festival: +15🪙 plus a bonus hop'}</li>
            <li>{ne ? '🏔️ पहिरो: एक स्टेप पछाडि · ⛺ विश्राम: केही हुँदैन' : '🏔️ Landslide: back one · ⛺ Rest: nothing happens'}</li>
            <li>{ne ? '🤖 प्रतिस्पर्धीलाई हराएर महेन्द्रनगर पहिले पुग्नुहोस्!' : '🤖 Beat the rival to Mahendranagar first!'}</li>
          </ul>
          <div className="mt14">
            <Btn onClick={start}>{t('startGame')} 🎲</Btn>
          </div>
        </div>
      </div>
    );
  }

  const cellTypeAt = (i: number): CellType | null => (i > 0 && i < STOPS.length - 1 ? cellsRef.current[i - 1] : i === STOPS.length - 1 ? 'rest' : 'rest');

  return (
    <div className="container page-pad" style={{ paddingTop: 12 }}>
      <div className="spread">
        <Btn kind="ghost" small onClick={onExit}>←</Btn>
        <div className="row">
          <span className="chip">🚶 {pPos + 1}/{STOPS.length}</span>
          <span className="chip fire">🤖 {rPos + 1}/{STOPS.length}</span>
          <span className="chip gold">🪙 {store.coins}</span>
        </div>
      </div>

      {/* board track */}
      <div className="card mt14" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
          {STOPS.map((s, i) => {
            const ct = cellTypeAt(i);
            return (
              <div key={s.districtId} style={{
                flex: 'none', width: 92, textAlign: 'center',
                padding: '8px 4px', borderRadius: 12,
                border: `1.5px solid ${i === pPos ? 'var(--gold)' : i === rPos ? 'rgba(230,59,82,.6)' : 'var(--line-soft)'}`,
                background: i === pPos ? 'rgba(245,192,78,.10)' : 'var(--surface)',
              }}>
                <div style={{ fontSize: 20 }}>{i === STOPS.length - 1 ? '🏁' : ct ? CELL_ICON[ct] : '🚩'}</div>
                <div style={{ fontSize: 11.5, fontWeight: 800 }}>{ne ? s.nameNe : s.name}</div>
                <div style={{ fontSize: 13, marginTop: 3, height: 16 }}>
                  {i === pPos && i === rPos ? '🚶🤖' : i === pPos ? '🚶' : i === rPos ? '🤖' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="trail-layout mt14">
        <NepalMap
          features={feats}
          height={'min(46vh, 380px)'}
          markers={[
            { id: 'p', lngLat: STOPS[pPos].lngLat, color: '#f5c04e', kind: 'token', label: ne ? 'तपाईं' : 'You' },
            { id: 'r', lngLat: STOPS[rPos].lngLat, color: '#e63b52', kind: 'token', label: '🤖' },
          ]}
        />
        <div className="card">
          <div className="center" style={{ minHeight: 74 }}>
            {diceFace !== null && <span key={diceFace + String(busy)} className="dice-face">{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceFace - 1]}</span>}
            {diceFace === null && <span className="muted">{busy ? t('loading') : t('yourTurn')}</span>}
          </div>
          <Btn block disabled={busy || phase === 'over'} onClick={playerRoll}>🎲 {t('rollDice')}</Btn>
          <div className="log-feed mt14">
            {logs.slice(-14).map(l => (
              <div key={l.id} className={'log-item' + (l.bad ? ' bad' : '')}>{l.text}</div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!quiz} onClose={() => undefined}>
        {quiz && (
          <div>
            <span className="chip gold">{t('questionCard')} ❓</span>
            <h3 className="mt14">{ne ? quiz.q.qNe : quiz.q.q}</h3>
            <div className="mt14">
              {(ne ? quiz.q.optsNe : quiz.q.opts).map((o, i) => {
                let cls = 'opt-btn';
                if (quiz.answered !== null) {
                  if (i === quiz.q.a) cls += ' right';
                  else if (i === quiz.answered) cls += ' wrongpick';
                }
                return (
                  <button key={i} className={cls} disabled={quiz.answered !== null} onClick={() => answerQuiz(i)}>
                    {String.fromCharCode(65 + i)}. {o}
                  </button>
                );
              })}
            </div>
            {quiz.answered !== null && (
              <div className="fact-box">{quiz.answered === quiz.q.a ? '✅ ' + t('correct') + ' — ' : '❌ ' + t('wrong') + ' — '}{ne ? quiz.q.exNe : quiz.q.ex}</div>
            )}
          </div>
        )}
      </Modal>

      {phase === 'over' && outcome && (
        <Modal open onClose={() => setPhase('menu')}>
          <div className="center">
            <div style={{ fontSize: 54 }}>{outcome === 'win' ? '🏆' : '😵'}</div>
            <h2>{outcome === 'win' ? t('win') : t('lose')}</h2>
            {outcome === 'win' && <p className="muted mt8">+300 XP · +50 🪙</p>}
            <p className="small muted">
              🚶 {STOPS[pPos][ne ? 'nameNe' : 'name']} · 🤖 {STOPS[rPos][ne ? 'nameNe' : 'name']}
            </p>
            <div className="row mt14" style={{ justifyContent: 'center' }}>
              <Btn gold onClick={start}>🔁 {t('playAgain')}</Btn>
              <Btn kind="ghost" onClick={onExit}>{t('back')}</Btn>
            </div>
          </div>
        </Modal>
      )}
      <ConfettiBurst fire={confetti} />
    </div>
  );
}

