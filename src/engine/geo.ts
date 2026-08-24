import { geoMercator, geoPath } from 'd3-geo';

export interface GeoFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}
export interface GeoCollection { type: 'FeatureCollection'; features: GeoFeature[] }

const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

export function loadDistricts(): Promise<GeoCollection> {
  return cached('districts', () => fetch('data/districts.geojson').then(r => r.json()));
}
export interface MuniIndexEntry {
  id: string;
  name: string;
  district: string;
  province: number | null;
  type: string;
  centroid: [number, number];
  layer: string;
}
export function loadMunicipalities(): Promise<MuniIndexEntry[]> {
  return cached('muni', () => fetch('data/municipalities.json').then(r => r.json()));
}
export function loadWards(layer: string): Promise<GeoCollection> {
  return cached('wards-' + layer, () => fetch('data/wards/' + layer + '.json').then(r => r.json()));
}

export interface FittedMap {
  pathFor: (f: GeoFeature) => string;
  project: (lngLat: number[]) => [number, number];
  invert: (xy: number[]) => [number, number] | undefined;
}

/** Mercator projection fitted to the given features */
export function fitMap(features: GeoFeature[], width: number, height: number, pad = 8): FittedMap {
  const fc = { type: 'FeatureCollection', features };
  const proj = geoMercator().fitExtent(
    [[pad, pad], [Math.max(10, width - pad), Math.max(10, height - pad)]],
    fc as never
  );
  const gen = geoPath(proj);
  return {
    pathFor: f => gen(f as never) ?? '',
    project: ll => {
      const p = proj(ll as [number, number]);
      return (p ?? [0, 0]) as [number, number];
    },
    invert: xy => {
      const inv = proj.invert?.(xy as [number, number]);
      return inv ?? undefined;
    },
  };
}
