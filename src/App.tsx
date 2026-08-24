import { useEffect, useMemo, useState } from 'react';
import { useGame } from './engine/store';
import { makeT } from './i18n';
import { rankFor } from './engine/ranks';
import { FlagMark, ToastStack, Btn, Modal } from './components/ui';
import { HomePage, type Page } from './pages/Home';
import { PassportPage } from './pages/Passport';
import { AboutPage } from './pages/About';
import { KahaGame } from './games/KahaGame';
import { JigsawGame } from './games/JigsawGame';
import { TrailGame } from './games/TrailGame';
import { QuizRush } from './games/QuizRush';

interface Idx { id: string; province: number }
let idxCache: Promise<Idx[]> | null = null;
function districtIndexOnce(): Promise<Idx[]> {
  if (!idxCache) {
    idxCache = fetch('data/districts.geojson').then(r => r.json()).then((fc: { features: { properties: { id: string; province: number } }[] }) =>
      fc.features.map(f => ({ id: f.properties.id, province: Number(f.properties.province) }))
    );
  }
  return idxCache;
}

export default function App() {
  const store = useGame();
  const t = useMemo(() => makeT(store.settings.lang), [store.settings.lang]);
  const [page, setPage] = useState<Page>('home');
  const [districtIndex, setDistrictIndex] = useState<Idx[] | null>(null);

  useEffect(() => {
    let alive = true;
    void districtIndexOnce().then(ix => { if (alive) setDistrictIndex(ix); });
    return () => { alive = false; };
  }, []);

  const ne = store.settings.lang === 'ne';
  const rk = rankFor(store.xp);
  const go = (p: Page) => setPage(p);

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="topbar">
        <div className="container topbar-inner">
          <button className="brand" onClick={() => go('home')} aria-label="NepalKhel home">
            <FlagMark />
            <span className="brand-name">नेपाल<b>खेल</b></span>
          </button>
          <div className="top-stats">
            <span className={'chip fire' + (store.streak > 0 ? ' lit' : '')} title={t('streakDays')}>🔥{store.streak}</span>
            <span className="chip gold" title={t('coins')}>🪙{store.coins}</span>
            <span className="chip" title={t('xpShort')}>{rk.rank.emoji} {store.xp.toLocaleString()}</span>
            <button
              className="icon-btn"
              aria-label={t('soundOn') + '/' + t('soundOff')}
              onClick={() => store.toggleSound()}
            >{store.settings.sound ? '🔊' : '🔇'}</button>
            <button
              className="icon-btn"
              style={{ fontWeight: 800, fontSize: 12.5 }}
              aria-label={t('languageSwitch')}
              title={t('languageSwitch')}
              onClick={() => store.setLang(ne ? 'en' : 'ne')}
            >{ne ? 'EN' : 'ने'}</button>
          </div>
        </div>
      </header>

      {/* Pages */}
      <main style={{ flex: 1 }}>
        {page === 'home' && <HomePage t={t} go={go} />}
        {page === 'passport' && districtIndex && <PassportPage t={t} districtIndex={districtIndex} />}
        {page === 'about' && <AboutPage t={t} />}
        {page === 'kaha' && <KahaGame t={t} onExit={() => go('home')} />}
        {page === 'jigsaw' && <JigsawGame t={t} onExit={() => go('home')} />}
        {page === 'trail' && <TrailGame t={t} onExit={() => go('home')} />}
        {page === 'quiz' && <QuizRush t={t} onExit={() => go('home')} />}
      </main>

      {/* Bottom nav */}
      <nav className="bottomnav">
        {([
          ['home', '🏠', t('home')],
          ['passport', '🪪', t('passport')],
          ['about', 'ℹ️', t('about')],
        ] as [Page, string, string][]).map(([id, ic, label]) => {
          const active = page === id || (id === 'home' && ['kaha', 'jigsaw', 'trail', 'quiz'].includes(page));
          return (
            <button key={id} className={active ? 'active' : ''} onClick={() => go(id)}>
              <span className="ic">{ic}</span>{label}
            </button>
          );
        })}
      </nav>

      {/* First-run intro */}
      <Modal open={!store.seenIntro} onClose={() => undefined}>
        <div className="center">
          <FlagMark className="intro-flag" />
          <h2 className="mt8">{t('appName')}</h2>
          <p className="mt8">{t('intro1')}</p>
          <p className="muted small">{t('intro2')}</p>
          <NameInput t={t} />
          <div className="mt14">
            <Btn gold block onClick={() => store.seenIntroNow()}>{t('letsGo')} 🚀</Btn>
          </div>
        </div>
      </Modal>

      <ToastStack />
    </div>
  );
}

function NameInput({ t }: { t: ReturnType<typeof makeT> }) {
  const name = useGame(s => s.settings.name);
  const setName = useGame(s => s.setName);
  return (
    <input
      value={name}
      onChange={e => setName(e.target.value.slice(0, 20))}
      placeholder={t('yourName') + '…'}
      aria-label={t('yourName')}
      autoComplete="nickname"
      spellCheck={false}
      className="mt14"
      style={{
        width: '100%', padding: '11px 16px', borderRadius: 12,
        border: '1px solid var(--line-soft)', background: 'var(--surface)',
        color: 'var(--text)', fontFamily: 'inherit', fontSize: 15, outline: 'none',
      }}
    />
  );
}
