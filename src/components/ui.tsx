import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { sfx } from '../engine/sfx';

/* ---------------- Toasts ---------------- */
interface Toast { id: number; text: string }
let toastSeq = 0;
interface ToastState { toasts: Toast[]; push: (t: string) => void; drop: (id: number) => void }
export const useToasts = create<ToastState>(fn => ({
  toasts: [],
  push: text => {
    toastSeq += 1;
    const id = toastSeq;
    fn(s => ({ toasts: [...s.toasts.slice(-3), { id, text }] }));
    setTimeout(() => fn(s => ({ toasts: s.toasts.filter(x => x.id !== id) })), 2600);
  },
  drop: () => undefined,
}));

export function toast(text: string) {
  useToasts.getState().push(text);
}

export function ToastStack() {
  const toasts = useToasts(s => s.toasts);
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map(t => <div key={t.id} className="toast-item">{t.text}</div>)}
    </div>
  );
}

/* ---------------- Buttons & modal ---------------- */
export function Btn(props: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'primary' | 'gold' | 'ghost';
  gold?: boolean;
  small?: boolean;
  block?: boolean;
  disabled?: boolean;
}) {
  const kind = props.gold ? 'gold' : props.kind;
  const cls = ['btn', kind && kind !== 'primary' ? kind : '', props.small ? 'small' : '', props.block ? 'block' : ''].join(' ');
  return (
    <button
      className={cls.trim()}
      disabled={props.disabled}
      onClick={() => { sfx.click(); props.onClick?.(); }}
    >
      {props.children}
    </button>
  );
}

export function Modal(props: { open: boolean; onClose?: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props.open, props.onClose]);
  if (!props.open) return null;
  return (
    <div className="modal-veil" onClick={e => { if (e.target === e.currentTarget) props.onClose?.(); }}>
      <div className="modal-box">{props.children}</div>
    </div>
  );
}

/* ---------------- Confetti ---------------- */
const CONFETTI_COLORS = ['#e63b52', '#f5c04e', '#37b5a6', '#4f74d9', '#43c463', '#c95a9e'];
export function ConfettiBurst({ fire }: { fire: number }) {
  const bits = useMemo(() => {
    if (!fire) return [];
    return Array.from({ length: 36 }, (_, i) => ({
      key: fire + '-' + i,
      left: Math.random() * 100,
      dx: (Math.random() - 0.5) * 260,
      rot: 360 + Math.random() * 720,
      dur: 1.8 + Math.random() * 1.6,
      delay: Math.random() * 0.35,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));
  }, [fire]);
  if (!bits.length) return null;
  return (
    <div className="confetti-zone" aria-hidden>
      {bits.map(b => (
        <span
          key={b.key}
          className="confetti-bit"
          style={{
            left: b.left + '%',
            background: b.color,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            ...( {
              '--dx': b.dx + 'px',
              '--rot': b.rot + 'deg',
              '--dur': b.dur + 's',
              animationDelay: b.delay + 's',
            } as React.CSSProperties),
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Nepal flag SVG ---------------- */
export function FlagMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 72" className={className ?? 'brand-flag'} aria-hidden>
      <path d="M4 2 L44 34 L20 34 L52 66 L4 66 Z" fill="#dc143c" stroke="#003893" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="21" cy="24" r="6.5" fill="none" stroke="#fff" strokeWidth="3.4" />
      <path d="M12 54 Q21 40 30 54 Q25.5 50 21 50 Q16.5 50 12 54 Z" fill="#fff" transform="rotate(180 21 51)" />
      <path d="M14 55 L28 55 L21 46 Z" fill="#fff" />
    </svg>
  );
}

/* ---------------- Mountain silhouette art ---------------- */
export function MountainArt() {
  return (
    <svg className="hero-mountains" viewBox="0 0 800 64" preserveAspectRatio="none" aria-hidden>
      <path d="M0 64 L90 22 L150 48 L235 8 L310 44 L400 14 L480 46 L570 10 L650 42 L730 18 L800 52 L800 64 Z"
        fill="rgba(255,255,255,0.07)" />
      <path d="M0 64 L120 38 L200 56 L300 26 L390 54 L500 30 L600 56 L700 32 L800 58 L800 64 Z"
        fill="rgba(255,255,255,0.05)" />
      <path d="M225 15 L235 8 L247 16 L240 13 Z M385 20 L400 14 L413 22 L398 19 Z M560 16 L570 10 L581 18 L568 17 Z"
        fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

/* ---------------- Count-up number (juicy feedback) ---------------- */
export function CountUp({ to, dur = 700, className }: { to: number; dur?: number; className?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <span className={className}>{v.toLocaleString()}</span>;
}

/* ---------------- Round dots progress ---------------- */
export function RoundDots({ total, current, results }: {
  total: number;
  current: number;
  results: ('good' | 'bad' | null)[];
}) {
  return (
    <div className="round-dots" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={
          'round-dot ' + (
            results[i] === 'good' ? 'done-good'
              : results[i] === 'bad' ? 'done-bad'
                : i === current ? 'cur' : ''
          )
        } />
      ))}
    </div>
  );
}
