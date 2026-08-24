import { Btn } from '../components/ui';
import { MountainArt } from '../components/ui';
import type { TFn } from '../i18n';
import { useGame, dayStr } from '../engine/store';
import { rankFor } from '../engine/ranks';

export type Page = 'home' | 'passport' | 'about' | 'kaha' | 'jigsaw' | 'trail' | 'quiz';

export function HomePage({ t, go }: { t: TFn; go: (p: Page) => void }) {
  const store = useGame();
  const ne = store.settings.lang === 'ne';
  const dailyDone = !!store.dailyDone[dayStr()];
  const rk = rankFor(store.xp);

  const games = [
    { id: 'kaha' as const, art: '📍', title: t('kahaTitle'), desc: t('kahaDesc'), badge: !dailyDone ? '🔥 ' + t('dailyChallenge') : undefined },
    { id: 'trail' as const, art: '🚌', title: t('trailTitle'), desc: t('trailDesc') },
    { id: 'jigsaw' as const, art: '🧩', title: t('jigsawTitle'), desc: t('jigsawDesc') },
    { id: 'quiz' as const, art: '⚡', title: t('quizTitle'), desc: t('quizDesc') },
  ];

  return (
    <div className="container page-pad">
      <section className="hero">
        <h1>{ne ? <>आफ्नै <em>नेपाल</em> चिनौँ</> : <>Know your <em>Nepal</em></>}</h1>
        <p className="sub">{ne
          ? 'नक्सा खेलेर, क्विज खेलेर, पजल खेलेर — आफ्नै देशको ७७ जिल्ला, ७ प्रदेश र हजारौँ कथा जान्नुहोस्।'
          : 'Play with maps, quizzes and puzzles — learn all 77 districts, 7 provinces and thousands of stories of your country.'}</p>
        <div className="hero-row">
          {!dailyDone && (
            <Btn gold onClick={() => go('kaha')}>🎯 {t('dailyChallenge')} — {t('playNow')}</Btn>
          )}
          {dailyDone && (
            <Btn kind="ghost" onClick={() => go('kaha')}>✓ {t('dailyDoneToday')} · {t('practiceMode')} ▶</Btn>
          )}
        </div>
        <MountainArt />
      </section>

      <h2 className="section-title mt20">🎮 {ne ? 'खेलहरू' : 'Games'}</h2>
      <div className="game-grid">
        {games.map(g => (
          <button key={g.id} className="game-card" onClick={() => go(g.id)}>
            {g.badge && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11.5, fontWeight: 800, color: '#ff8a97', background: 'rgba(230,59,82,.12)', border: '1px solid rgba(230,59,82,.4)', borderRadius: 999, padding: '3px 9px' }}>{g.badge}</span>}
            <span className="art">{g.art}</span>
            <h3>{g.title}</h3>
            <p>{g.desc}</p>
          </button>
        ))}
      </div>

      <div className="card glow mt20 row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <div className="small muted">{t('level')} {rk.idx} — {rk.rank.emoji} {ne ? rk.rank.ne : rk.rank.en}</div>
          <b>{store.xp.toLocaleString()} XP</b>
          {rk.next && <span className="small muted"> · {ne ? 'अर्को:' : 'next:'} {ne ? rk.next.ne : rk.next.en} ({rk.next.min.toLocaleString()})</span>}
        </div>
        <Btn small onClick={() => go('passport')}>🪪 {t('passportTitle')}</Btn>
      </div>

      <p className="center small muted mt20">
        🇳🇵 {ne ? 'मदन भुपि… मीठा संस्कृति, सुन्दर भूगोल — सबै यहीँ छ।' : 'Made with ❤ for every Nepali, everywhere.'}
      </p>
    </div>
  );
}
