/**
 * Nepal Map Data Preprocessor
 * Source: E:\projects\maps\maps-clone-src\data
 * Simplifies geometry (Douglas-Peucker), computes centroids,
 * emits lean bundles into public/data/.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'E:/projects/maps/maps-clone-src/data';
const OUT_PUBLIC = new URL('../public/data/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// ---------- geometry helpers ----------
function sqSegDist(p, a, b) {
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplifyRing(points, tol) {
  if (points.length <= 4) return points.slice(0);
  const sqTol = tol * tol;
  const keep = new Set([0, points.length - 1]);
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxSq = 0, idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxSq) { maxSq = d; idx = i; }
    }
    if (maxSq > sqTol && idx > 0) { keep.add(idx); stack.push([first, idx], [idx, last]); }
  }
  return [...keep].sort((a, b) => a - b).map(i => points[i]);
}

function geomToMultiPolygon(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}
function simplifyMultiPolygon(mp, tol) {
  return mp.map(poly => poly.map(r => simplifyRing(r, tol)).filter(r => r.length >= 4)).filter(p => p.length > 0);
}

function ringAreaCentroid(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0, y0] = ring[j], [x1, y1] = ring[i];
    const f = x0 * y1 - x1 * y0;
    a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-12) return null;
  return { area: a / 2, x: cx / (3 * a), y: cy / (3 * a) };
}
function polygonCentroid(mp) {
  let ax = 0, ay = 0, aa = 0;
  for (const polyRings of mp) {
    const c = ringAreaCentroid(polyRings[0]);
    if (c) { ax += c.x * c.area; ay += c.y * c.area; aa += c.area; }
  }
  if (aa === 0) return null;
  return [ax / aa, ay / aa];
}

// ---------- main ----------
mkdirSync(join(OUT_PUBLIC, 'wards'), { recursive: true });

const PROV_ORDER = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
const PROV_ID = Object.fromEntries(PROV_ORDER.map((n, i) => [n, i + 1]));
const slug = s => s.trim().replace(/\s+/g, '_');
const distSlug = {};

const districtFeatures = [];
for (const prov of PROV_ORDER) {
  const fc = JSON.parse(readFileSync(join(SRC, 'districts', `${prov}.json`), 'utf8'));
  for (const f of fc.features) {
    const dName = ((f.properties || {}).District || '').trim();
    if (!dName) continue;
    const mp = geomToMultiPolygon(f.geometry);
    const simp = simplifyMultiPolygon(mp, 0.0018);
    const cent = polygonCentroid(mp) || polygonCentroid(simp);
    const id = `d_${slug(dName).toLowerCase()}`;
    distSlug[dName.toLowerCase()] = id;
    districtFeatures.push({
      type: 'Feature',
      properties: { id, name: dName, province: PROV_ID[prov], zone: (f.properties || {}).Zone || '', centroid: cent ? [Math.round(cent[0] * 1e6) / 1e6, Math.round(cent[1] * 1e6) / 1e6] : null },
      geometry: { type: 'MultiPolygon', coordinates: simp },
    });
  }
}
writeFileSync(join(OUT_PUBLIC, 'districts.geojson'), JSON.stringify({ type: 'FeatureCollection', features: districtFeatures }));
console.log(`districts.geojson: ${districtFeatures.length}`);

const municipalities = [];
for (const file of readdirSync(join(SRC, 'locallevels'))) {
  if (!file.endsWith('.json')) continue;
  const district = file.replace('.json', '');
  const fc = JSON.parse(readFileSync(join(SRC, 'locallevels', file), 'utf8'));
  for (const f of fc.features) {
    const props = f.properties || {};
    const name = (props.LocalLevel || props.GaPa_NaPa || props.name || '').trim();
    if (!name) continue;
    const mp = geomToMultiPolygon(f.geometry);
    const cent = polygonCentroid(mp);
    if (!cent) continue;
    municipalities.push({
      id: `m_${slug(district).toLowerCase()}_${slug(name).toLowerCase()}`,
      name,
      district: distSlug[district.toLowerCase()] || district,
      province: PROV_ID[(props.Province || '').replace(/ Pradesh$/i, '').trim()] || null,
      type: props.Type || '',
      centroid: [Math.round(cent[0] * 1e6) / 1e6, Math.round(cent[1] * 1e6) / 1e6],
      layer: `${district}_${name}`,
    });
  }
}
writeFileSync(join(OUT_PUBLIC, 'municipalities.json'), JSON.stringify(municipalities));
console.log(`municipalities.json: ${municipalities.length}`);

let wardFiles = 0, wardBytes = 0;
for (const file of readdirSync(join(SRC, 'wards'))) {
  if (!file.endsWith('.json')) continue;
  const fc = JSON.parse(readFileSync(join(SRC, 'wards', file), 'utf8'));
  const out = {
    type: 'FeatureCollection',
    name: fc.name || file,
    features: fc.features.map(f => ({
      type: 'Feature',
      properties: { w: Number((f.properties || {}).Ward_Num) || 0 },
      geometry: { type: 'MultiPolygon', coordinates: simplifyMultiPolygon(geomToMultiPolygon(f.geometry), 0.00045) },
    })).filter(f => f.geometry.coordinates.length > 0),
  };
  const buf = Buffer.from(JSON.stringify(out));
  writeFileSync(join(OUT_PUBLIC, 'wards', file), buf);
  wardFiles++; wardBytes += buf.length;
}
console.log(`wards: ${wardFiles} files, ${(wardBytes / 1048576).toFixed(1)} MB`);
console.log('Done.');
