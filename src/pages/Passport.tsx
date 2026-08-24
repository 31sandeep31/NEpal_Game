import { PROVINCES, districtName } from '../data/names';
import { BADGES, RANKS, rankFor } from '../engine/ranks';
import { useGame, dayStr } from '../engine/store';
import type { TFn } from '../i18n';

interface DistrictRow { id: string; province: number }

export function PassportPage({ t, districtIndex }: { t: TFn; districtIndex: DistrictRow[] }) {
  const store = useGame();
  const ne = store.settings.lang === 'ne';
  const rk = rankFor(store.xp);
  const today = dayStr();

  // 30-day calendar
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dayStr(d));
  }
  const played = new Set(store.playedDays);

  const pct = rk.next ? Math.min(100, Math.round(((store.xp - rk.rank.min) / (rk.next.min - rk.rank.min)) * 100)) : 100;

  return (
    <div className="container page-pad" style={{ paddingTop: 16 }}>
      {/* Rank card */}
      <div className="card glow">
        <div className="rank-line">
          <span>{rk.rank.emoji} {t('level')} {rk.idx} — {ne ? rk.rank.ne : rk.rank.en}</span>
          <span className="muted small">{store.xp.toLocaleString()} XP</span>
        </div>
        <div className="xp-bar"><div style={{ width: pct + '%' }} /></div>
        {rk.next && (
          <div className="small muted mt8">
            {ne ? 'अर्को स्तर' : 'Next rank'}: {RANKS[RANKS.indexOf(rk.next)]?.emoji} {ne ? rk.next.ne : rk.next.en} @ {rk.next.min.toLocaleString()} XP ({(rk.next.min - store.xp).toLocaleString()} XP {ne ? 'बाँकी' : 'to go'})
          </div>
        )}
        <div className="row mt14" style={{ gap: 14, flexWrap: 'wrap' }}>
          <span className={'chip fire' + (store.lastPlayDay === today ? ' lit' : '')}>🔥 {store.streak} {t('streakDays')}</span>
          <span className="chip">🏆 {store.bestStreak}</span>
          <span className="chip gold">🪙 {store.coins}</span>
          <span className="chip gold">🪧 {store.stamps.length}/77 {t('stampsEarned')}</span>
        </div>

        <div className="small muted mt14">{t('calendar30')}</div>
        <div className="cal-row">
          {days.map(d => (
            <span key={d} className={'cal-dot' + (played.has(d) ? ' on' : '') + (d === today ? ' today' : '')}>
              {d.slice(-2)}
            </span>
          ))}
        </div>
      </div>

      {/* Stamps */}
      <h2 className="section-title mt20">🪧 {t('passportTitle')}</h2>
      {PROVINCES.map(p => {
        const ds = districtIndex.filter(x => x.province === p.id);
        return (
          <div key={p.id} className="card mt14" style={{ padding: 14 }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: p.color, display: 'inline-block' }} />
              <b>{ne ? p.nameNe : p.name}</b>
              <span className="small muted">
                {ds.filter(d => store.stamps.includes(d.id)).length}/{ds.length}
              </span>
            </div>
            <div className="stamp-grid">
              {ds.map(d => (
                <span key={d.id} className={'stamp-chip' + (store.stamps.includes(d.id) ? ' got' : '')}>
                  <span className="dot" />{districtName(d.id, store.settings.lang)}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {/* Badges */}
      <h2 className="section-title mt20">🎖️ {t('badges')} ({store.badges.length}/{BADGES.length})</h2>
      <div className="badge-shelf">
        {BADGES.map(b => {
          const got = store.badges.includes(b.id);
          return (
            <div key={b.id} className={'badge-cell ' + (got ? 'got' : 'locked')}>
              <span className="em">{got ? b.emoji : '🔒'}</span>
              <div className="nm">{ne ? b.ne : b.en}</div>
              <div className="ds">{ne ? b.descNe : b.descEn}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
