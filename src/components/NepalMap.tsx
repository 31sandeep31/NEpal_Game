import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fitMap, loadDistricts, type GeoFeature } from '../engine/geo';
import { sfx } from '../engine/sfx';

export interface MapMarker {
  id: string;
  lngLat: [number, number];
  color: string;
  kind: 'guess' | 'target' | 'token';
  label?: string;
}
export interface MapLine { a: [number, number]; b: [number, number]; color?: string }

interface Props {
  features: GeoFeature[] | null;
  height?: number | string;
  fillFor?: (f: GeoFeature) => string;
  highlightIds?: string[];
  markers?: MapMarker[];
  line?: MapLine | null;
  onMapClick?: (lngLat: [number, number]) => void;
  children?: React.ReactNode;
}

interface VB { x: number; y: number; w: number; h: number }

export function NepalMap(props: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [vb, setVb] = useState<VB>({ x: 0, y: 0, w: 800, h: 500 });
  const dragRef = useRef<{ sx: number; sy: number; vb: VB; moved: boolean } | null>(null);
  const pinchRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const fittedKey = useRef('');

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitted = useMemo(() => {
    if (!props.features || props.features.length === 0) return null;
    return fitMap(props.features, size.w, size.h, 10);
  }, [props.features, size.w, size.h]);

  // reset view when features or size change identity
  useEffect(() => {
    const key = props.features ? String(props.features.length) + 'x' + size.w + 'x' + size.h : '';
    if (fitted && key !== fittedKey.current) {
      fittedKey.current = key;
      setVb({ x: 0, y: 0, w: size.w, h: size.h });
    }
  }, [fitted, props.features, size]);

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    setVb(v => {
      const nw = Math.min(size.w * 3, Math.max(size.w / 14, v.w * factor));
      const k = nw / v.w;
      const nh = v.h * k;
      return {
        x: cx - (cx - v.x) * k,
        y: cy - (cy - v.y) * k,
        w: nw,
        h: nh,
      };
    });
  }, [size.w]);

  const svgPoint = useCallback((clientX: number, clientY: number): [number, number] => {
    const r = boxRef.current!.getBoundingClientRect();
    return [
      vb.x + ((clientX - r.left) / r.width) * vb.w,
      vb.y + ((clientY - r.top) / r.height) * vb.h,
    ];
  }, [vb]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const [px, py] = svgPoint(e.clientX, e.clientY);
    zoomAt(px, py, e.deltaY > 0 ? 1.16 : 0.86);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pinchRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchRef.current.size === 1) {
      dragRef.current = { sx: e.clientX, sy: e.clientY, vb, moved: false };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pinchRef.current.has(e.pointerId)) pinchRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // pinch zoom
    if (pinchRef.current.size === 2) {
      const pts = [...pinchRef.current.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const prev = (dragRef.current as unknown as { lastPinch?: number } | null);
      if (prev && prev.lastPinch) {
        const r = boxRef.current!.getBoundingClientRect();
        const mid = svgPoint((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
        zoomAt(mid[0], mid[1], prev.lastPinch / d);
        void r;
      }
      if (prev) prev.lastPinch = d;
      return;
    }
    // drag pan
    const d = dragRef.current;
    if (!d) return;
    const r = boxRef.current!.getBoundingClientRect();
    const dx = ((e.clientX - d.sx) / r.width) * d.vb.w;
    const dy = ((e.clientY - d.sy) / r.height) * d.vb.h;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 7) d.moved = true;
    setVb(() => ({ ...d.vb, x: d.vb.x - dx, y: d.vb.y - dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pinchRef.current.delete(e.pointerId);
    if (pinchRef.current.size < 2 && dragRef.current) delete (dragRef.current as unknown as { lastPinch?: number }).lastPinch;
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || d.moved) return;
    if (!props.onMapClick) return;
    const [sx, sy] = svgPoint(e.clientX, e.clientY);
    const ll = fitted?.invert([sx, sy]);
    if (ll) { sfx.place(); props.onMapClick(ll); }
  };

  const hl = new Set(props.highlightIds ?? []);
  const markerScale = vb.w / size.w;

  return (
    <div className="map-wrap" ref={boxRef} style={{ height: props.height ?? 420 }}>
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {props.features?.map((f, i) => {
          const id = String(f.properties.id ?? f.properties.name ?? i);
          const fill = props.fillFor ? props.fillFor(f) : 'rgba(255,255,255,0.06)';
          return (
            <path
              key={id + i}
              className={'map-path' + (hl.has(id) ? ' hl' : '')}
              d={fitted ? fitted.pathFor(f) : ''}
              fill={fill}
            />
          );
        })}
        {props.line && fitted && (
          <line
            className="line-grow"
            x1={props.line.a[0]} y1={props.line.a[1]}
            x2={props.line.b[0]} y2={props.line.b[1]}
            stroke={props.line.color ?? '#f5c04e'}
            strokeWidth={2.2 * markerScale}
            strokeDasharray="6 5"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {props.markers && fitted && props.markers.map(m => {
          const [x, y] = fitted.project(m.lngLat);
          const r = (m.kind === 'target' ? 9 : m.kind === 'token' ? 8 : 7.5) * Math.max(0.55, markerScale);
          if (m.kind === 'guess') {
            return (
              <g key={m.id} className="marker-drop" style={{ pointerEvents: 'none' }}>
                <circle cx={x} cy={y} r={r * 2} fill="none" stroke="#fff" strokeWidth={1.4 * Math.max(0.55, markerScale)} opacity={0.7} />
                <circle cx={x} cy={y} r={r} fill={m.color} stroke="#fff" strokeWidth={1.8 * Math.max(0.55, markerScale)} />
              </g>
            );
          }
          return (
            <g key={m.id} style={{ pointerEvents: 'none' }}>
              <circle className="map-target-dot" cx={x} cy={y} r={r} fill={m.color} opacity={0.55} />
              <circle className="marker-drop" cx={x} cy={y} r={r} fill={m.color} stroke="#fff" strokeWidth={1.8 * Math.max(0.55, markerScale)} />
              {m.label && (
                <text x={x} y={y - r - 5} textAnchor="middle" fontSize={12 * Math.max(0.75, markerScale)} fontWeight={800} fill="#fff" stroke="#00000088" strokeWidth={3} paintOrder="stroke">
                  {m.label}
                </text>
              )}
            </g>
          );
        })}
        {props.children}
      </svg>
      <div className="map-controls">
        <button className="icon-btn" aria-label="Zoom in" onClick={() => zoomAt(vb.x + vb.w / 2, vb.y + vb.h / 2, 0.72)}>+</button>
        <button className="icon-btn" aria-label="Zoom out" onClick={() => zoomAt(vb.x + vb.w / 2, vb.y + vb.h / 2, 1.38)}>−</button>
        <button
          className="icon-btn"
          aria-label="Reset view"
          onClick={() => setVb({ x: 0, y: 0, w: size.w, h: size.h })}
        >⌂</button>
      </div>
    </div>
  );
}

/** Shared loader hook for the district layer */
export function useDistrictFeatures(): GeoFeature[] | null {
  const [feats, setFeats] = useState<GeoFeature[] | null>(null);
  useEffect(() => {
    let alive = true;
    void loadDistricts().then(fc => { if (alive) setFeats(fc.features); });
    return () => { alive = false; };
  }, []);
  return feats;
}
