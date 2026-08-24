import { useEffect, useRef, useState } from 'react';
import { Btn } from '../components/ui';
import { toast, ConfettiBurst } from '../components/ui';
import type { TFn } from '../i18n';
import { useGame } from '../engine/store';
import { randomTrivia, shuffle } from '../engine/daily';
import type { Trivia } from '../data/trivia';
import { sfx } from '../engine/sfx';

const DURATION = 60;

export function QuizRush({ t, onExit }: { t: TFn; onExit: () => void }) {
  const store = useGame();
  const ne = store.settings.lang === 'ne';
  const [phase, setPhase] = useState<'menu' | 'playing' | 'over'>('menu');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [q, setQ] = useState<Trivia | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [rights, setRights] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const queueRef = useRef<Trivia[]>([]);
  const lockRef = useRef(false);

  function nextQ() {
    if (queueRef.current.length === 0) queueRef.current = shuffle(randomTrivia(40));
    setQ(queueRef.current.pop() ?? null);
    setPicked(null);
    lockRef.current = false;
  }

  useEffect(() => {
    if (phase !== 'playing') return;
    const iv = setInterval(() => {
      setTimeLeft(s => {
        const n = Math.max(0, +(s - 0.1).toFixed(1));
        if (n <= 5.05 && Math.abs(n - Math.round(n)) < 0.06 && n > 0) sfx.tick();
        if (n === 0) finish();
        return n;
      });
    }, 100);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function finish() {
    setPhase('over');
    const finalScore = score;
    if (finalScore >= 800) { sfx.win(); setConfetti(c => c + 1); } else sfx.lose();
    store.markPlayedToday();
    store.awardBadge('first_play');
    useGame.setState(s => ({
      stats: {
        ...s.stats,
        quizRuns: s.stats.quizRuns + 1,
        quizBestScore: Math.max(s.stats.quizBestScore, finalScore),
        quizBestCombo: Math.max(s.stats.quizBestCombo, maxCombo),
        correctTotal: s.stats.correctTotal + rights,
      },
    }));
    const xp = Math.floor(finalScore / 10);
    store.addXp(xp);
    if (maxCombo >= 10) store.awardBadge('quiz_combo10');
    if (finalScore >= 1500) store.awardBadge('quiz_score1500');
    toast('⚡ +' + xp + ' XP');
  }

  function start() {
    queueRef.current = shuffle(randomTrivia(40));
    setTimeLeft(DURATION);
    setScore(0); setCombo(0); setMaxCombo(0); setRights(0);
    nextQ();
    setPhase('playing');
  }

  function pick(i: number) {
    if (lockRef.current || !q || picked !== null) return;
    lockRef.current = true;
    setPicked(i);
    const ok = i === q.a;
    if (ok) {
      sfx.correct();
      const mult = Math.min(3, 1 + combo * 0.15);
      setScore(s => s + Math.round(100 * mult));
      setRights(r => r + 1);
      setCombo(c => {
        const nc = c + 1;
        setMaxCombo(m => Math.max(m, nc));
        return nc;
      });
    } else {
      sfx.wrong();
      setCombo(0);
      setTimeLeft(s => Math.max(0, +(s - 2).toFixed(1)));
    }
    setTimeout(() => {
      if (timeLeft <= 0.15 && !ok) { finish(); return; }
      nextQ();
    }, ok ? 260 : 620);
  }

  if (phase === 'menu') {
    return (
      <div className="container page-pad" style={{ paddingTop: 16 }}>
        <Btn kind="ghost" small onClick={onExit}>← {t('back')}</Btn>
        <div className="card glow mt14 center">
          <h2>⚡ {t('quizTitle')}</h2>
          <p className="muted small mt8">{t('quizDesc')}</p>
          <div style={{ fontSize: 44, margin: '14px 0' }}>⚡🧠⚡</div>
          <p className="small muted">
            {ne ? 'सही उत्तर = +१०० × कम्बो बोनस · बेठीक = −२ सेकेन्ड' : 'Correct = +100 × combo bonus · Wrong = −2 seconds'}
          </p>
          {store.stats.quizBestScore > 0 && (
            <p className="small" style={{ color: 'var(--gold)', fontWeight: 800 }}>
              🏅 {t('quizBest')}: {store.stats.quizBestScore.toLocaleString()}
            </p>
          )}
          <div className="mt14">
            <Btn onClick={start}>{t('startGame')} ⚡</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'over') {
    return (
      <div className="container page-pad" style={{ paddingTop: 16 }}>
        <div className="card glow center result-panel">
          <h2>{score >= 800 ? '🔥' : '💪'} {score.toLocaleString()}</h2>
          <p className="muted mt8">⭐ {t('correctAnswers')}: {rights} · 🔗 max combo ×{maxCombo}</p>
          <p className="small" style={{ color: 'var(--gold)', fontWeight: 800 }}>
            {score > store.stats.quizBestScore ? '🎊 ' + (ne ? 'नयाँ कीर्तिमान!' : 'New personal best!') : t('quizBest') + ': ' + Math.max(score, store.stats.quizBestScore).toLocaleString()}
          </p>
          <div className="row mt14" style={{ justifyContent: 'center' }}>
            <Btn gold onClick={start}>🔁 {t('playAgain')}</Btn>
            <Btn kind="ghost" onClick={onExit}>{t('back')}</Btn>
          </div>
        </div>
        <ConfettiBurst fire={confetti} />
      </div>
    );
  }

  if (!q) return null;

  const mult = Math.min(3, 1 + combo * 0.15);
  return (
    <div className="container page-pad" style={{ paddingTop: 12 }}>
      <div className="spread">
        <Btn kind="ghost" small onClick={onExit}>←</Btn>
        <div className="row">
          <span className="chip fire">⏱ {timeLeft.toFixed(1)}s</span>
          <span className="chip gold">{score.toLocaleString()}</span>
          {combo >= 2 && <span className="combo-flare">×{mult.toFixed(2)} ({combo})</span>}
        </div>
      </div>

      <div className="quiz-timerbar mt8">
        <div style={{ width: (timeLeft / DURATION) * 100 + '%' }} />
      </div>

      <div className="card glow">
        <span className="chip">{ne ? catNe(q.cat) : q.cat.toUpperCase()} · {'★'.repeat(q.tier)}</span>
        <h3 className="mt8" style={{ fontSize: 19 }}>{ne ? q.qNe : q.q}</h3>
        <div className="mt14">
          {(ne ? q.optsNe : q.opts).map((o, i) => {
            let cls = 'opt-btn';
            if (picked !== null) {
              if (i === q.a) cls += ' right';
              else if (i === picked) cls += ' wrongpick';
            }
            return (
              <button key={i} className={cls} disabled={picked !== null} onClick={() => pick(i)}>
                {String.fromCharCode(65 + i)}. {o}
              </button>
            );
          })}
        </div>
      </div>
      <ConfettiBurst fire={0} />
    </div>
  );
}

function catNe(c: string): string {
  return ({ geo: 'भूगोल', nature: 'प्रकृति', history: 'इतिहास', culture: 'संस्कृति', festival: 'चाडपर्व', sports: 'खेलकुद', people: 'व्यक्तित्व' } as Record<string, string>)[c] ?? c;
}
