import { useMemo, useState } from 'react';
import { NepalMap, useDistrictFeatures, type MapLine, type MapMarker } from '../components/NepalMap';
import { Btn, RoundDots } from '../components/ui';
import { toast } from '../components/ui';
import type { TFn } from '../i18n';
import { useGame, dayStr } from '../engine/store';
import { dailyPlaces, practicePlaces } from '../engine/daily';
import { haversineKm, scoreForDistance, bearingArrow, bucketFor, BUCKET_EMOJI, shareText } from '../engine/scoring';
import { provinceById, districtName } from '../data/names';
import { sfx } from '../engine/sfx';
import type { Place } from '../data/places';

interface RoundResult {
  placeId: string;
  distKm: number;
  pts: number;
  arrow: string;
  usedHint: boolean;
}

type Phase = 'menu' | 'playing' | 'reveal' | 'summary';
type Diff = 'easy' | 'medium' | 'hard';

const HINT_PENALTY = 600;

function fmtKm(km: number): string {
  return km < 10 ? km.toFixed(1) + ' km' : Math.round(km).toLocaleString() + ' km';
}

export function KahaGame({ t, onExit }: { t: TFn; onExit: () => void }) {
  const feats = useDistrictFeatures();
  const store = useGame();
  const lang = store.settings.lang;
  const ne = lang === 'ne';

  const [phase, setPhase] = useState<Phase>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [diff, setDiff] = useState<Diff>('easy');
  const [targets, setTargets] = useState<Place[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [guess, setGuess] = useState<[number, number] | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [hintProv, setHintProv] = useState(false);
  const [hintLetter, setHintLetter] = useState(false);

  const todayK = dayStr();
  const dailyDoneToday = store.dailyDone[todayK];

  const startDaily = () => {
    setTargets(dailyPlaces(todayK));
    setIsDaily(true);
    beginRound();
  };
  const startPractice = () => {
    setTargets(practicePlaces(5, diff));
    setIsDaily(false);
    beginRound();
  };
  function beginRound() {
    setRoundIdx(0); setResults([]); setGuess(null);
    setHintProv(false); setHintLetter(false);
    setPhase('playing');
  }

  const cur = targets[roundIdx];
  const penalties = (hintProv ? HINT_PENALTY : 0) + (hintLetter ? HINT_PENALTY : 0);

  const markers: MapMarker[] = useMemo(() => {
    if (!cur) return [];
    const out: MapMarker[] = [];
    if (guess) out.push({ id: 'g', lngLat: guess, color: '#4f74d9', kind: 'guess' });
    if (phase === 'reveal' || phase === 'summary') {
      out.push({ id: 't', lngLat: [cur.lng, cur.lat], color: '#e63b52', kind: 'target', label: ne ? cur.nameNe : cur.name });
    }
    return out;
  }, [guess, cur, phase, ne]);

  const line: MapLine | null = useMemo(() => {
    if (!guess || !cur || phase !== 'reveal') return null;
    return { a: guess, b: [cur.lng, cur.lat], color: '#f5c04e' };
  }, [guess, cur, phase]);

  const doGuess = (ll: [number, number]) => {
    if (!cur || phase !== 'playing') return;
    const km = haversineKm(ll[1], ll[0], cur.lat, cur.lng);
    const pts = Math.max(0, scoreForDistance(km) - (km < 25 ? 0 : penalties));
    setGuess(ll);
    setResults(r => [...r, { placeId: cur.id, distKm: km, pts, arrow: bearingArrow(ll[1], ll[0], cur.lat, cur.lng), usedHint: penalties > 0 }]);
    if (km < 5) { store.awardBadge('perfect_round'); sfx.win(); } else if (bucketFor(km) === 'bad') { sfx.lose(); } else { sfx.correct(); }
    setPhase('reveal');
  };

  const finish = (allResults: RoundResult[]) => {
    setPhase('summary');
    const total = allResults.reduce((a, r) => a + r.pts, 0);
    const xp = isDaily ? Math.floor(total / 100) : Math.floor(total / 150);
    store.addXp(xp);
    store.markPlayedToday();
    store.bumpStat('kahaGames');
    store.awardBadge('first_play');
    if (isDaily) {
      store.completeDaily(todayK, {
        score: total,
        maxScore: targets.length * 5000,
        rounds: allResults.map(r => ({ placeId: r.placeId, distKm: r.distKm, pts: r.pts, usedHint: r.usedHint })),
      });
      store.addCoins(10);
      store.awardBadge('daily_1');
      store.bumpStat('bestDailyScore', 0);
      if (total > store.stats.bestDailyScore) {
        useGame.setState(s => ({ stats: { ...s.stats, bestDailyScore: total } }));
      }
      // stamps: great or better
      targets.forEach((tg, i) => {
        if (allResults[i] && bucketFor(allResults[i].distKm) !== 'bad' && bucketFor(allResults[i].distKm) !== 'ok') {
          if (store.addStamp(tg.districtId)) toast('🪧 ' + t('newStamp') + ' ' + districtName(tg.districtId, lang));
        }
      });
    }
    checkBadges(store.streak, total, targets.length * 5000);
  };

  function checkBadges(streakNow: number, total: number, maxTotal: number) {
    const g = useGame.getState();
    if (streakNow >= 3) g.awardBadge('streak_3');
    if (streakNow >= 7) g.awardBadge('streak_7');
    if (streakNow >= 14) g.awardBadge('streak_14');
    if (streakNow >= 30) g.awardBadge('streak_30');
    if (g.stamps.length >= 10) g.awardBadge('explorer_10');
    if (g.stamps.length >= 25) g.awardBadge('explorer_25');
    if (g.stamps.length >= 50) g.awardBadge('explorer_50');
    if (g.stamps.length >= 77) g.awardBadge('explorer_77');
    void total; void maxTotal;
  }

  /* ---------- MENU ---------- */
  if (phase === 'menu') {
    return (
      <div className="container page-pad" style={{ paddingTop: 16 }}>
        <Btn kind="ghost" small onClick={onExit}>← {t('back')}</Btn>
        <div className="card glow mt14">
          <h2>📍 {t('kahaTitle')}</h2>
          <p className="muted small mt8">{t('kahaDesc')}</p>
          <div className="mt14">
            <div className="section-title">🔥 {t('dailyChallenge')}</div>
            {dailyDoneToday ? (
              <div>
                <p style={{ color: 'var(--green)', fontWeight: 800 }}>✓ {t('dailyDoneToday')} — {dailyDoneToday.score.toLocaleString()}/{dailyDoneToday.maxScore.toLocaleString()}</p>
                <Btn onClick={startPractice}>{t('practiceMode')} ▶</Btn>
              </div>
            ) : (
              <div className="row">
                <Btn onClick={startDaily}>{t('playNow')} 🎯</Btn>
                <span className="muted small">5 {t('round')} · /25,000</span>
              </div>
            )}
          </div>
        </div>

        <div className="card mt14">
          <div className="section-title">🎮 {t('practiceMode')}</div>
          <div className="diff-row">
            {(['easy', 'medium', 'hard'] as Diff[]).map(d => (
              <button key={d} className={'diff-btn' + (diff === d ? ' sel' : '')} onClick={() => { sfx.click(); setDiff(d); }}>
                <b>{d === 'easy' ? '🌱 ' + t('easy') : d === 'medium' ? '⛰️ ' + t('medium') : '🏔️ ' + t('hard')}</b>
                <small>{d === 'easy' ? t('easyHint') : d === 'medium' ? t('mediumHint') : t('hardHint')}</small>
              </button>
            ))}
          </div>
          <div className="mt14">
            <Btn gold onClick={startPractice}>{t('practiceMode')} ▶</Btn>
          </div>
          <p className="muted small mt14">💡 {ne
            ? 'नक्सा घुमाउनुहोस्, जुम गर्नुहोस् — त्यसपछि सही ठाउँमा छोएर अनुमान राख्नुहोस्। इशाराले ६०० अङ्क कटौती गर्छ।'
            : 'Pan & zoom the map, then tap where you think it is. Each hint costs 600 points.'}</p>
        </div>
      </div>
    );
  }

  /* ---------- SUMMARY ---------- */
  if (phase === 'summary') {
    const total = results.reduce((a, r) => a + r.pts, 0);
    const maxTotal = targets.length * 5000;
    const share = shareText(todayK, results, total, maxTotal);
    return (
      <div className="container page-pad" style={{ paddingTop: 16 }}>
        <div className="card glow center result-panel">
          <h2>{total >= maxTotal * 0.7 ? '🏆' : total >= maxTotal * 0.4 ? '🌟' : '💪'} {t('totalScore')}</h2>
          <div className="dist-big" style={{ color: 'var(--gold)' }}>
            {total.toLocaleString()} <span className="muted" style={{ fontSize: 18 }}>/ {maxTotal.toLocaleString()}</span>
          </div>
          <div className="share-grid" style={{ justifyContent: 'center' }}>
            {results.map((r, i) => (
              <span key={i}>{BUCKET_EMOJI[bucketFor(r.distKm)]}{r.arrow}</span>
            ))}
          </div>
          <p className="muted small">+{isDaily ? Math.floor(total / 100) : Math.floor(total / 150)} XP · +{isDaily ? 10 : 0} 🪙</p>
          <div className="row mt14" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn gold onClick={() => {
              void navigator.clipboard?.writeText(share).then(
                () => toast('📋 ' + t('copied')),
                () => toast(share)
              );
            }}>📋 {t('copyResult')}</Btn>
            <Btn onClick={() => setPhase('menu')}>🔁 {t('playAgain')}</Btn>
          </div>
          <div className="fact-box mt14" style={{ textAlign: 'left' }}>
            {targets.map(tg => (
              <div key={tg.id} style={{ marginBottom: 6 }}>
                <b>{ne ? tg.nameNe : tg.name}</b> — {districtName(tg.districtId, lang)}, {provinceById(tg.province)[ne ? 'nameNe' : 'name']}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- PLAYING / REVEAL ---------- */
  if (!cur || !feats) return <div className="container page-pad">{t('loading')}</div>;

  const lastResult = phase === 'reveal' ? results[results.length - 1] : null;
  const provName = provinceById(cur.province);
  const placeName = ne ? cur.nameNe : cur.name;

  return (
    <div className="container page-pad" style={{ paddingTop: 12 }}>
      <div className="kaha-top">
        <Btn kind="ghost" small onClick={onExit}>←</Btn>
        <RoundDots
          total={targets.length}
          current={roundIdx}
          results={results.map(r => (bucketFor(r.distKm) === 'bad' ? 'bad' : 'good'))}
        />
        <span className="chip gold">{t('round')} {roundIdx + 1}/{targets.length}</span>
      </div>

      <div className="card kaha-place-card">
        <div className="label">{t('whereIs')}</div>
        <div className="place">{placeName}{hintLetter && <span className="hint-reveal muted" style={{ fontSize: 16, fontWeight: 700 }}> · {placeName[0]}…</span>}</div>
        {hintProv && (
          <div className="small hint-reveal" style={{ color: 'var(--teal)', fontWeight: 800 }}>
            🧭 {provName[ne ? 'nameNe' : 'name']} {ne ? 'प्रदेश' : 'Province'}
          </div>
        )}
      </div>

      <div className="mt8">
        <NepalMap
          features={feats}
          height={'min(58vh, 470px)'}
          fillFor={f => (String(f.properties.province) === String(cur.province) && hintProv ? 'rgba(55,181,166,0.25)' : 'rgba(255,255,255,0.06)')}
          markers={markers}
          line={line}
          onMapClick={doGuess}
        />
      </div>

      {!guess && phase === 'playing' && (
        <>
          <p className="muted small mt8">👆 {t('tapMapHint')}</p>
          <div className="hint-btns mt8">
            <button className="hint-chip" disabled={hintProv} onClick={() => { sfx.click(); useGame.getState().bumpStat('hintsUsed'); setHintProv(true); }}>
              🧭 {t('hint')} −600
            </button>
            <button className="hint-chip" disabled={hintLetter} onClick={() => { sfx.click(); useGame.getState().bumpStat('hintsUsed'); setHintLetter(true); }}>
              🔤 {t('hint')} −600
            </button>
          </div>
        </>
      )}

      {phase === 'reveal' && lastResult && (
        <div className="card glow mt14 result-panel">
          <div className="spread">
            <div>
              <div className="dist-big" style={{ color: lastResult.pts > 3500 ? 'var(--green)' : lastResult.pts > 1500 ? 'var(--gold)' : 'var(--crimson)' }}>
                {fmtKm(lastResult.distKm)} <span className="muted" style={{ fontSize: 15 }}>{t('distanceAway')}</span> {lastResult.arrow}
              </div>
              <div className="row">
                <span className="chip gold">{BUCKET_EMOJI[bucketFor(lastResult.distKm)]} +{lastResult.pts.toLocaleString()}</span>
                <span className="muted small">
                  {lastResult.distKm < 5 ? t('perfect') : lastResult.distKm < 150 ? t('veryClose')
                    : lastResult.distKm < 500 ? t('close') : lastResult.distKm < 1500 ? t('far') : t('wayOff')}
                </span>
              </div>
            </div>
            <Btn onClick={() => {
              if (roundIdx + 1 >= targets.length) finish(results);
              else {
                sfx.click();
                setRoundIdx(i => i + 1);
                setGuess(null); setHintProv(false); setHintLetter(false);
                setPhase('playing');
              }
            }}>
              {roundIdx + 1 >= targets.length ? t('seeResults') + ' →' : t('nextRound') + ' →'}
            </Btn>
          </div>
          <div className="fact-box">
            💡 <b>{t('factLabel')}</b> {ne ? cur.factNe : cur.factEn}
            <div className="small mt8 muted">
              📍 {placeName} · {districtName(cur.districtId, lang)} · {provName[ne ? 'nameNe' : 'name']}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
