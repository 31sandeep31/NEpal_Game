import { useEffect, useRef, useState } from 'react';
import { Btn } from '../components/ui';
import { toast, ConfettiBurst } from '../components/ui';
import type { TFn } from '../i18n';
import { useGame } from '../engine/store';
import { useDistrictFeatures } from '../components/NepalMap';
import { fitMap, type GeoFeature } from '../engine/geo';
import { PROVINCES } from '../data/names';
import { sfx } from '../engine/sfx';

interface Piece {
  id: string;
  paths: string[];
  cx: number;
  cy: number;
  color: string;
  dx: number;
  dy: number;
  placed: boolean;
}

type Phase = 'menu' | 'playing' | 'done';

function fmtT(s: number): string {
  const m = Math.floor(s / 60);
  return (m > 0 ? m + 'm ' : '') + Math.round(s % 60) + 's';
}
function starsFor(secs: number): number {
  return secs <= 75 ? 3 : secs <= 150 ? 2 : 1;
}

export function JigsawGame({ t, onExit }: { t: TFn; onExit: () => void }) {
  const feats = useDistrictFeatures();
  const store = useGame();
  const lang = store.settings.lang;
  const ne = lang === 'ne';
  const [phase, setPhase] = useState<Phase>('menu');
  const [boardKey, setBoardKey] = useState<string>('');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [slots, setSlots] = useState<{ id: string; d: string[] }[]>([]);
  const [secs, setSecs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const dragRef = useRef<{ idx: number; sx: number; sy: number; odx: number; ody: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (phase !== 'playing') return;
    const iv = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const startBoard = (key: string) => {
    if (!feats) return;
    let boardFeats: GeoFeature[];
    if (key === 'nepal') {
      boardFeats = feats; // pieces = province groups
    } else {
      const provId = Number(key.replace('p', ''));
      boardFeats = feats.filter(f => Number(f.properties.province) === provId);
    }
    const W = 900, H = 560;
    const fitted = fitMap(boardFeats, W, H, 14);

    interface Group { id: string; paths: string[]; cx: number; cy: number; color: string }
    const groups: Group[] = [];
    if (key === 'nepal') {
      for (const p of PROVINCES) {
        const members = boardFeats.filter(f => Number(f.properties.province) === p.id);
        if (!members.length) continue;
        groups.push({
          id: 'g' + p.id,
          paths: members.map(m => fitted.pathFor(m)),
          cx: members.reduce((a, m) => a + ((m.properties.centroid as [number, number]) ? fitted.project(m.properties.centroid as [number, number])[0] : W / 2), 0) / members.length,
          cy: members.reduce((a, m) => a + ((m.properties.centroid as [number, number]) ? fitted.project(m.properties.centroid as [number, number])[1] : H / 2), 0) / members.length,
          color: p.color,
        });
      }
    } else {
      for (const f of boardFeats) {
        const c = f.properties.centroid as [number, number] | undefined;
        const [cx, cy] = c ? fitted.project(c) : [W / 2, H / 2];
        const provId = Number(f.properties.province);
        groups.push({
          id: String(f.properties.id ?? Math.random()),
          paths: [fitted.pathFor(f)],
          cx, cy,
          color: PROVINCES.find(p => p.id === provId)?.color ?? '#4f74d9',
        });
      }
    }

    setSlots(groups.map(g => ({ id: g.id, d: g.paths })));
    setPieces(groups.map((g, i) => {
      // scatter around edges
      const ang = (i / groups.length) * Math.PI * 2 + 0.7;
      const rad = g.cy < H / 2 ? -1 : 1;
      const dx = Math.cos(ang) * (90 + Math.random() * 110);
      const dy = rad * (60 + Math.random() * 110);
      return { id: g.id, paths: g.paths, cx: g.cx, cy: g.cy, color: g.color, dx, dy, placed: false };
    }));
    setBoardKey(key);
    setSecs(0); setMoves(0);
    setPhase('playing');
  };

  const onPieceDown = (idx: number) => (e: React.PointerEvent) => {
    if (pieces[idx].placed || phase !== 'playing') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { idx, sx: e.clientX, sy: e.clientY, odx: pieces[idx].dx, ody: pieces[idx].dy, moved: false };
  };
  const onBoardMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    d.moved = true;
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const dx = (e.clientX - d.sx) / r.width * vb.width;
    const dy = (e.clientY - d.sy) / r.height * vb.height;
    setPieces(ps => ps.map((p, i) => i === d.idx ? { ...p, dx: d.odx + dx, dy: d.ody + dy } : p));
  };
  const onBoardUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || !d.moved) return;
    setPieces(ps => {
      const next = ps.map((p, i) => {
        if (i !== d.idx) return p;
        const dist = Math.hypot(p.dx, p.dy);
        if (dist < 22) {
          sfx.snap();
          setMoves(m => m + 1);
          return { ...p, dx: 0, dy: 0, placed: true };
        }
        return p;
      });
      if (next.every(p => p.placed)) finishGame(next.length);
      return next;
    });
  };

  function finishGame(count: number) {
    sfx.win();
    setConfetti(c => c + 1);
    setPhase('done');
    const st = starsFor(secs);
    const isWhole = boardKey === 'nepal';
    const xpBase = st === 3 ? 120 : st === 2 ? 70 : 30;
    const xp = Math.round(xpBase * (isWhole ? 1.6 : 1));
    store.addXp(xp);
    store.addCoins(st * 5);
    store.markPlayedToday();
    store.bumpStat('correctTotal');
    store.awardBadge('first_play');
    store.awardBadge('jigsaw_1');
    useGame.setState(s => ({
      stats: {
        ...s.stats,
        jigsawDone: [...new Set([...s.stats.jigsawDone, boardKey])],
      },
    }));
    const improved = store.setJigsawBest(boardKey, secs);
    // grant a stamp from this province as learning bonus
    if (feats) {
      const provId = isWhole ? null : Number(boardKey.replace('p', ''));
      const pool = feats.filter(f => String(f.properties.id) && (provId === null || Number(f.properties.province) === provId))
        .map(f => String(f.properties.id))
        .filter(id => !store.stamps.includes(id));
      if (pool.length) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (store.addStamp(pick)) toast('🪧 ' + t('newStamp'));
      }
    }
    const g = useGame.getState();
    if (g.stats.jigsawDone.length >= 8) g.awardBadge('jigsaw_all');
    if (g.stamps.length >= 77) g.awardBadge('explorer_77');
    void count; void improved;
  }

  /* ---------- MENU ---------- */
  if (phase === 'menu') {
    const boards = [...PROVINCES.map(p => ({ key: 'p' + p.id, emoji: '⛰️', label: ne ? p.nameNe : p.name })), { key: 'nepal', emoji: '🇳🇵', label: t('wholeNepal') }];
    return (
      <div className="container page-pad" style={{ paddingTop: 16 }}>
        <Btn kind="ghost" small onClick={onExit}>← {t('back')}</Btn>
        <div className="card glow mt14">
          <h2>🧩 {t('jigsawTitle')}</h2>
          <p className="muted small mt8">{t('jigsawDesc')}</p>
        </div>
        <div className="game-grid mt14">
          {boards.map(b => {
            const best = store.stats.jigsawBest[b.key];
            return (
              <button key={b.key} className="game-card" onClick={() => startBoard(b.key)}>
                {best !== undefined && <span className="small" style={{ color: 'var(--gold)', fontWeight: 800 }}>⏱ {fmtT(best)}</span>}
                <span className="art">{b.emoji}</span>
                <h3>{b.label}</h3>
                <p>{b.key === 'nepal' ? (ne ? '७ वटै प्रदेशका टुक्राहरू' : 'All 7 province pieces') : (ne ? 'जिल्ला-टुक्राहरू जोड्नुहोस्' : 'Assemble the districts')}</p>
              </button>
            );
          })}
        </div>
        <ConfettiBurst fire={confetti} />
      </div>
    );
  }

  const doneCount = pieces.filter(p => p.placed).length;
  const allDone = phase === 'done';

  return (
    <div className="container page-pad" style={{ paddingTop: 12 }}>
      <div className="spread">
        <Btn kind="ghost" small onClick={onExit}>←</Btn>
        <div className="row">
          <span className="chip">⏱ {secs}s</span>
          <span className="chip gold">{doneCount}/{pieces.length} 🧩</span>
          <span className="chip">{t('moves')} {moves}</span>
        </div>
      </div>

      <div className="card glow mt14 jigsaw-board">
        <svg
          ref={svgRef}
          viewBox="0 0 900 560"
          style={{ width: '100%', display: 'block', touchAction: 'none' }}
          onPointerMove={onBoardMove}
          onPointerUp={onBoardUp}
          onPointerCancel={onBoardUp}
        >
          {slots.map(s => (
            <g key={'slot-' + s.id}>
              {s.d.map((d, i) => (
                <path key={i} d={d} className={'slot-outline' + (allDone ? ' done' : '')} />
              ))}
            </g>
          ))}
          {pieces.map((p, i) => (
            <g
              key={p.id}
              transform={`translate(${p.dx},${p.dy})`}
              className={p.placed ? 'jigsaw-piece placed' : 'jigsaw-piece'}
              onPointerDown={onPieceDown(i)}
              style={{ opacity: p.placed ? 0.96 : 1 }}
            >
              {p.paths.map((d, j) => (
                <path key={j} d={d} fill={p.color} stroke="#0a0f2466" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {allDone && (
        <div className="card glow mt14 center result-panel">
          <h2>🎉 {t('solved')}</h2>
          <p style={{ fontSize: 26, margin: '8px 0' }}>{'⭐'.repeat(starsFor(secs))}</p>
          <p className="muted">{t('time')}: {fmtT(secs)} · +XP · +{starsFor(secs) * 5} 🪙</p>
          <div className="row mt8" style={{ justifyContent: 'center' }}>
            <Btn gold onClick={() => setPhase('menu')}>{t('playAgain')} 🔁</Btn>
          </div>
        </div>
      )}
      <ConfettiBurst fire={confetti} />
    </div>
  );
}
