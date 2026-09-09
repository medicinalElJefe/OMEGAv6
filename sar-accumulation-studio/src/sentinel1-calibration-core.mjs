import { s3ToHttps } from './stac.mjs';

const EARTH_SEARCH_ITEM = 'https://earth-search.aws.element84.com/v1/collections/sentinel-1-grd/items/';
const TIFF_CACHE = new Map();
const DETAIL_CACHE = new Map();
const XML_CACHE = new Map();
let geotiffModulePromise = null;

function browserOrigin() { return globalThis.location?.origin || null; }

export function supportTransportUrl(url, kind = 'source') {
  if (!url) return null;
  const base = browserOrigin();
  return base ? `${base.replace(/\/$/, '')}/api/${kind}?url=${encodeURIComponent(url)}` : url;
}

async function geotiffModule() {
  if (!geotiffModulePromise) geotiffModulePromise = import('../vendor/geotiff.bundle.mjs');
  return geotiffModulePromise;
}

async function openMeasurement(url) {
  const source = s3ToHttps(url);
  if (!TIFF_CACHE.has(source)) {
    TIFF_CACHE.set(source, (async () => {
      const mod = await geotiffModule();
      const tiff = await mod.fromUrl(supportTransportUrl(source, 'raster'), {
        cacheSize: 32 * 1024 * 1024,
        blockSize: 65536
      });
      const image = await tiff.getImage(0);
      return { tiff, image, source };
    })());
  }
  return TIFF_CACHE.get(source);
}

async function fetchText(url, signal) {
  const source = s3ToHttps(url);
  if (!XML_CACHE.has(source)) {
    XML_CACHE.set(source, (async () => {
      const response = await fetch(supportTransportUrl(source, 'source'), {
        signal,
        headers: { accept: 'application/xml,text/xml,text/plain,*/*' }
      });
      if (!response.ok) throw new Error(`Sentinel-1 support asset ${response.status}: ${source}`);
      return response.text();
    })());
  }
  return XML_CACHE.get(source);
}

export async function fetchSentinel1ItemDetail(id, signal) {
  if (!id) throw new Error('Sentinel-1 item id is required');
  if (!DETAIL_CACHE.has(id)) {
    DETAIL_CACHE.set(id, (async () => {
      const base = browserOrigin();
      const url = base
        ? `${base.replace(/\/$/, '')}/api/stac/item?id=${encodeURIComponent(id)}`
        : `${EARTH_SEARCH_ITEM}${encodeURIComponent(id)}`;
      const response = await fetch(url, { signal, headers: { accept: 'application/geo+json,application/json' } });
      if (!response.ok) throw new Error(`Earth Search item ${response.status}: ${id}`);
      return response.json();
    })());
  }
  return DETAIL_CACHE.get(id);
}

function normalizedAsset(detail, key) {
  const a = detail?.assets?.[key];
  return a?.href ? { ...a, key, href: s3ToHttps(a.href), sourceHref: a.href } : null;
}

function findAsset(detail, predicate) {
  for (const [key, a] of Object.entries(detail?.assets || {})) {
    if (!a?.href) continue;
    if (predicate(key.toLowerCase(), String(a.href).toLowerCase(), a)) {
      return { ...a, key, href: s3ToHttps(a.href), sourceHref: a.href };
    }
  }
  return null;
}

export function sentinel1ProductAssets(detail, polarization) {
  const pol = String(polarization || '').toLowerCase();
  if (!pol) throw new Error('Polarization is required');
  const measurement = normalizedAsset(detail, pol) || findAsset(detail, (key, href, a) => {
    const type = String(a?.type || '').toLowerCase();
    return (key === pol || key.endsWith(`-${pol}`)) && (type.includes('tiff') || /\.tiff?(?:\?|$)/.test(href));
  });
  const calibration = normalizedAsset(detail, `schema-calibration-${pol}`) || findAsset(detail, (key, href) =>
    (key.includes('calibration') && key.includes(pol)) || (href.includes('/annotation/calibration/') && href.includes(`-${pol}-`))
  );
  const noise = normalizedAsset(detail, `schema-noise-${pol}`) || findAsset(detail, (key, href) =>
    (key.includes('noise') && key.includes(pol)) || (href.includes('/annotation/calibration/noise-') && href.includes(`-${pol}-`))
  );
  const product = normalizedAsset(detail, `schema-product-${pol}`) || findAsset(detail, (key, href) =>
    ((key.includes('product') || key.includes('annotation')) && key.includes(pol) && !key.includes('calibration') && !key.includes('noise')) ||
    (href.includes('/annotation/') && !href.includes('/calibration/') && href.includes(`-${pol}-`) && href.endsWith('.xml'))
  );
  return { measurement, calibration, noise, product, manifest: normalizedAsset(detail, 'safe-manifest') };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function xmlBlocks(xml, localName) {
  const name = escapeRegExp(localName);
  const re = new RegExp(`<(?:[A-Za-z_][\\w.-]*:)?${name}\\b[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z_][\\w.-]*:)?${name}\\s*>`, 'gi');
  return [...String(xml || '').matchAll(re)].map(match => match[1]);
}

function xmlText(xml, localName) {
  const block = xmlBlocks(xml, localName)[0];
  if (block == null) return null;
  return block.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim();
}

function numberList(text) {
  return String(text || '').trim().split(/\s+/).map(Number).filter(Number.isFinite);
}

export function parseCalibrationXml(text) {
  const vectors = xmlBlocks(text, 'calibrationVector').map(node => ({
    line: Number(xmlText(node, 'line')),
    pixel: numberList(xmlText(node, 'pixel')),
    sigmaNought: numberList(xmlText(node, 'sigmaNought')),
    betaNought: numberList(xmlText(node, 'betaNought')),
    gamma: numberList(xmlText(node, 'gamma')),
    dn: numberList(xmlText(node, 'dn')),
    azimuthTime: xmlText(node, 'azimuthTime')
  })).filter(v => Number.isFinite(v.line) && v.pixel.length).sort((a, b) => a.line - b.line);
  const constant = Number(xmlText(text, 'absoluteCalibrationConstant'));
  return { vectors, absoluteCalibrationConstant: Number.isFinite(constant) ? constant : null };
}

export function parseProductXml(text) {
  const points = xmlBlocks(text, 'geolocationGridPoint').map(node => ({
    line: Number(xmlText(node, 'line')),
    pixel: Number(xmlText(node, 'pixel')),
    latitude: Number(xmlText(node, 'latitude')),
    longitude: Number(xmlText(node, 'longitude')),
    height: Number(xmlText(node, 'height')),
    incidenceAngle: Number(xmlText(node, 'incidenceAngle')),
    elevationAngle: Number(xmlText(node, 'elevationAngle')),
    azimuthTime: xmlText(node, 'azimuthTime')
  })).filter(p => [p.line, p.pixel, p.latitude, p.longitude].every(Number.isFinite));
  return {
    points,
    thermalNoiseCorrectionPerformed: String(xmlText(text, 'thermalNoiseCorrectionPerformed')).toLowerCase() === 'true',
    rangePixelSpacing: Number(xmlText(text, 'rangePixelSpacing')) || null,
    azimuthPixelSpacing: Number(xmlText(text, 'azimuthPixelSpacing')) || null,
    numberOfSamples: Number(xmlText(text, 'numberOfSamples')) || null,
    numberOfLines: Number(xmlText(text, 'numberOfLines')) || null,
    incidenceAngleMidSwath: Number(xmlText(text, 'incidenceAngleMidSwath')) || null,
    orbitSource: xmlText(text, 'orbitSource') || null
  };
}

function unwrapLongitude(value, reference) {
  let x = Number(value);
  const r = Number(reference);
  while (x - r > 180) x -= 360;
  while (x - r < -180) x += 360;
  return x;
}

function bilinear(a, b, c, d, u, v) {
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function solveQuad(targetLon, targetLat, p00, p10, p01, p11) {
  const longitudes = [p00, p10, p01, p11].map(p => unwrapLongitude(p.longitude, targetLon));
  const target = unwrapLongitude(targetLon, targetLon);
  let u = 0.5;
  let v = 0.5;
  for (let i = 0; i < 20; i++) {
    const lon = bilinear(longitudes[0], longitudes[1], longitudes[2], longitudes[3], u, v);
    const lat = bilinear(p00.latitude, p10.latitude, p01.latitude, p11.latitude, u, v);
    const fLon = lon - target;
    const fLat = lat - targetLat;
    const duLon = (longitudes[1] - longitudes[0]) * (1 - v) + (longitudes[3] - longitudes[2]) * v;
    const dvLon = (longitudes[2] - longitudes[0]) * (1 - u) + (longitudes[3] - longitudes[1]) * u;
    const duLat = (p10.latitude - p00.latitude) * (1 - v) + (p11.latitude - p01.latitude) * v;
    const dvLat = (p01.latitude - p00.latitude) * (1 - u) + (p11.latitude - p10.latitude) * u;
    const det = duLon * dvLat - dvLon * duLat;
    if (Math.abs(det) < 1e-14) break;
    const du = (fLon * dvLat - fLat * dvLon) / det;
    const dv = (duLon * fLat - duLat * fLon) / det;
    u -= du;
    v -= dv;
    if (Math.abs(du) + Math.abs(dv) < 1e-12) break;
  }
  const lon = bilinear(longitudes[0], longitudes[1], longitudes[2], longitudes[3], u, v);
  const lat = bilinear(p00.latitude, p10.latitude, p01.latitude, p11.latitude, u, v);
  const residualDeg = Math.hypot(lon - target, lat - targetLat);
  if (u < -0.03 || u > 1.03 || v < -0.03 || v > 1.03 || residualDeg > 3e-4) return null;
  return {
    state: 'GEOLOCATED_BILINEAR_GCP',
    pixel: bilinear(p00.pixel, p10.pixel, p01.pixel, p11.pixel, u, v),
    line: bilinear(p00.line, p10.line, p01.line, p11.line, u, v),
    u, v, residualDeg, corners: [p00, p10, p01, p11]
  };
}

function projectedOffset(point, lon, lat) {
  return {
    x: (unwrapLongitude(point.longitude, lon) - lon) * Math.cos(lat * Math.PI / 180),
    y: point.latitude - lat
  };
}

function triangleCandidate(a, b, c, lon, lat) {
  const A = projectedOffset(a, lon, lat);
  const B = projectedOffset(b, lon, lat);
  const C = projectedOffset(c, lon, lat);
  const det = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
  if (Math.abs(det) < 1e-12) return null;
  const w1 = ((B.y - C.y) * -C.x + (C.x - B.x) * -C.y) / det;
  const w2 = ((C.y - A.y) * -C.x + (A.x - C.x) * -C.y) / det;
  const w3 = 1 - w1 - w2;
  if (Math.min(w1, w2, w3) < -0.02 || Math.max(w1, w2, w3) > 1.02) return null;
  const span = Math.max(Math.hypot(A.x, A.y), Math.hypot(B.x, B.y), Math.hypot(C.x, C.y));
  return {
    state: 'GEOLOCATED_LOCAL_GCP_TRIANGLE',
    pixel: w1 * a.pixel + w2 * b.pixel + w3 * c.pixel,
    line: w1 * a.line + w2 * b.line + w3 * c.line,
    weights: [w1, w2, w3],
    gcpSpanDeg: span,
    residualDeg: null,
    corners: [a, b, c]
  };
}

export function geolocateToPixel(product, lon, lat) {
  lon = Number(lon);
  lat = Number(lat);
  const points = (product?.points || []).filter(p => [p.line, p.pixel, p.latitude, p.longitude].every(Number.isFinite));
  if (points.length < 3) return { state: 'GEOLOCATION_UNRESOLVED', reason: `Product geolocation grid has ${points.length} valid point(s)` };

  const lines = [...new Set(points.map(p => p.line))].sort((a, b) => a - b);
  const rows = new Map(lines.map(line => [line, points.filter(p => p.line === line).sort((a, b) => a.pixel - b.pixel)]));
  let best = null;
  for (let y = 0; y < lines.length - 1; y++) {
    const upper = rows.get(lines[y]);
    const lower = rows.get(lines[y + 1]);
    if (upper.length < 2 || lower.length < 2) continue;
    for (let x = 0; x < upper.length - 1; x++) {
      const p00 = upper[x];
      const p10 = upper[x + 1];
      let lowerIndex = 0;
      let score = Infinity;
      for (let k = 0; k < lower.length - 1; k++) {
        const candidateScore = Math.abs(lower[k].pixel - p00.pixel) + Math.abs(lower[k + 1].pixel - p10.pixel);
        if (candidateScore < score) { score = candidateScore; lowerIndex = k; }
      }
      const candidate = solveQuad(lon, lat, p00, p10, lower[lowerIndex], lower[lowerIndex + 1]);
      if (candidate && (!best || candidate.residualDeg < best.residualDeg)) best = candidate;
    }
  }
  if (best) return best;

  const nearby = points.map(p => {
    const d = projectedOffset(p, lon, lat);
    return { point: p, distance: Math.hypot(d.x, d.y) };
  }).sort((a, b) => a.distance - b.distance).slice(0, 14);

  let triangle = null;
  for (let i = 0; i < nearby.length - 2; i++) {
    for (let j = i + 1; j < nearby.length - 1; j++) {
      for (let k = j + 1; k < nearby.length; k++) {
        const candidate = triangleCandidate(nearby[i].point, nearby[j].point, nearby[k].point, lon, lat);
        if (candidate && (!triangle || candidate.gcpSpanDeg < triangle.gcpSpanDeg)) triangle = candidate;
      }
    }
  }
  if (triangle) return triangle;

  const nearest = nearby[0];
  if (nearest && nearest.distance < 0.08) {
    return {
      state: 'GEOLOCATED_NEAREST_GCP_FALLBACK',
      pixel: nearest.point.pixel,
      line: nearest.point.line,
      residualDeg: nearest.distance,
      nearest: nearest.point
    };
  }
  return { state: 'GEOLOCATION_UNRESOLVED', reason: 'Target is outside resolved product GCP support', nearestDistanceDeg: nearest?.distance ?? null };
}

function interpolate1D(xs, ys, x) {
  if (!xs?.length || xs.length !== ys?.length) return null;
  if (x <= xs[0]) return ys[0];
  if (x >= xs.at(-1)) return ys.at(-1);
  let lo = 0;
  let hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid;
  }
  const span = xs[hi] - xs[lo];
  return span === 0 ? ys[lo] : ys[lo] + (ys[hi] - ys[lo]) * ((x - xs[lo]) / span);
}

export function calibrationLutAt(calibration, line, pixel, kind = 'sigmaNought') {
  const vectors = calibration?.vectors || [];
  if (!vectors.length || !['sigmaNought', 'betaNought', 'gamma', 'dn'].includes(kind)) return null;
  let lower = vectors[0];
  let upper = vectors.at(-1);
  for (let i = 0; i < vectors.length - 1; i++) {
    if (line >= vectors[i].line && line <= vectors[i + 1].line) { lower = vectors[i]; upper = vectors[i + 1]; break; }
  }
  if (line <= vectors[0].line) lower = upper = vectors[0];
  if (line >= vectors.at(-1).line) lower = upper = vectors.at(-1);
  const a = interpolate1D(lower.pixel, lower[kind], pixel);
  const b = interpolate1D(upper.pixel, upper[kind], pixel);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (lower.line === upper.line) return a;
  return a + (b - a) * ((line - lower.line) / (upper.line - lower.line));
}

async function productBundle(record, polarization, signal) {
  const detail = await fetchSentinel1ItemDetail(record.id, signal);
  const assets = sentinel1ProductAssets(detail, polarization);
  if (!assets.measurement || !assets.calibration || !assets.product) {
    const keys = Object.keys(detail?.assets || {}).join(', ');
    throw new Error(`Sentinel-1 ${record.id} lacks required measurement/calibration/product assets for ${String(polarization).toUpperCase()}; item assets: ${keys}`);
  }
  const [calibrationXml, productXml] = await Promise.all([
    fetchText(assets.calibration.href, signal),
    fetchText(assets.product.href, signal)
  ]);
  const calibration = parseCalibrationXml(calibrationXml);
  const product = parseProductXml(productXml);
  if (!calibration.vectors.length) throw new Error(`Calibration annotation parsed 0 vectors from ${assets.calibration.sourceHref}`);
  if (product.points.length < 3) throw new Error(`Product annotation parsed ${product.points.length} geolocation points from ${assets.product.sourceHref}`);
  return { detail, assets, calibration, product };
}

function geolocationQuality(g) {
  if (g.state === 'GEOLOCATED_BILINEAR_GCP') return 'PRODUCT_GCP_BILINEAR';
  if (g.state === 'GEOLOCATED_LOCAL_GCP_TRIANGLE') return 'PRODUCT_GCP_LOCAL_TRIANGLE';
  return 'NEAREST_GCP_FALLBACK';
}

function evidenceGrade(quality) {
  return quality === 'PRODUCT_GCP_BILINEAR' ? 'A-' : quality === 'PRODUCT_GCP_LOCAL_TRIANGLE' ? 'B+' : 'B';
}

async function readSingleDn(image, pixel, line) {
  const width = image.getWidth();
  const height = image.getHeight();
  const x = Math.max(0, Math.min(width - 1, Math.round(pixel)));
  const y = Math.max(0, Math.min(height - 1, Math.round(line)));
  const values = await image.readRasters({ window: [x, y, x + 1, y + 1], samples: [0], interleave: true });
  const nodataRaw = image.getGDALNoData?.();
  const nodata = nodataRaw == null ? 0 : Number(nodataRaw);
  const dn = Number(values[0]);
  return { dn: Number.isFinite(dn) && dn !== nodata ? dn : null, x, y, width, height, nodata };
}

export async function sampleCalibratedSentinel1(record, lon, lat, { polarization = 'vv', quantity = 'sigmaNought', signal } = {}) {
  const { detail, assets, calibration, product } = await productBundle(record, polarization, signal);
  const geolocation = geolocateToPixel(product, lon, lat);
  if (!Number.isFinite(geolocation.pixel) || !Number.isFinite(geolocation.line)) {
    return { state: 'GEOLOCATION_UNRESOLVED', id: record.id, geolocation };
  }
  const { image } = await openMeasurement(assets.measurement.href);
  const raw = await readSingleDn(image, geolocation.pixel, geolocation.line);
  if (!Number.isFinite(raw.dn)) return { state: 'NODATA', id: record.id, geolocation, raw };
  const lut = calibrationLutAt(calibration, geolocation.line, geolocation.pixel, quantity);
  if (!Number.isFinite(lut) || lut === 0) return { state: 'CALIBRATION_LUT_UNRESOLVED', id: record.id, geolocation, raw, lut };
  const value = raw.dn * raw.dn / (lut * lut);
  const db = value > 0 ? 10 * Math.log10(value) : null;
  const quality = geolocationQuality(geolocation);
  return {
    state: 'CALIBRATED_SENTINEL1_GRD_SAMPLE', id: record.id, startTime: record.startTime, platform: record.platform,
    polarization: String(polarization).toUpperCase(), quantity, value, db, measured: true, inferred: false,
    dn: raw.dn, lut, pixel: [raw.x, raw.y], fractionalPixel: [geolocation.pixel, geolocation.line],
    geolocation: { method: geolocation.state, residualDeg: geolocation.residualDeg ?? null, gcpSpanDeg: geolocation.gcpSpanDeg ?? null, quality },
    processing: { thermalNoiseCorrectionPerformed: product.thermalNoiseCorrectionPerformed, radiometricCalibration: 'PRODUCT_LUT', terrainFlattened: false, localIncidenceAngleCorrected: false },
    product: { rangePixelSpacing: product.rangePixelSpacing, azimuthPixelSpacing: product.azimuthPixelSpacing, incidenceAngleMidSwath: product.incidenceAngleMidSwath, orbitSource: product.orbitSource || detail.properties?.['s1:orbit_source'] || null },
    evidence: { grade: evidenceGrade(quality), measured: true, inferred: false },
    provenance: { measurement: assets.measurement.sourceHref, calibration: assets.calibration.sourceHref, product: assets.product.sourceHref, noise: assets.noise?.sourceHref || null },
    boundary: 'Radiometrically calibrated Sentinel-1 Level-1 GRD backscatter. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'
  };
}

function percentile(values, p) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const q = (sorted.length - 1) * p;
  const lo = Math.floor(q), hi = Math.ceil(q);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (q - lo);
}

function displayByte(value, low, high) {
  if (!Number.isFinite(value) || !Number.isFinite(low) || !Number.isFinite(high) || high <= low) return 0;
  return Math.round(255 * Math.pow(Math.max(0, Math.min(1, (value - low) / (high - low))), 0.78));
}

export async function calibratedTargetPatch(record, lon, lat, { polarization = 'vv', quantity = 'sigmaNought', radiusPixels = 64, signal, onStage } = {}) {
  onStage?.('LOAD_PRODUCT_ANNOTATION');
  const { detail, assets, calibration, product } = await productBundle(record, polarization, signal);
  onStage?.('INVERT_PRODUCT_GCP_GRID');
  const geolocation = geolocateToPixel(product, lon, lat);
  if (!Number.isFinite(geolocation.pixel) || !Number.isFinite(geolocation.line)) {
    throw new Error(`Selected target could not be bound to product GCP grid: ${geolocation.reason || geolocation.state}`);
  }
  const { image } = await openMeasurement(assets.measurement.href);
  const fullWidth = image.getWidth(), fullHeight = image.getHeight();
  const radius = Math.max(24, Math.min(128, Math.round(radiusPixels)));
  const cx = Math.max(0, Math.min(fullWidth - 1, Math.round(geolocation.pixel)));
  const cy = Math.max(0, Math.min(fullHeight - 1, Math.round(geolocation.line)));
  const x0 = Math.max(0, cx - radius), y0 = Math.max(0, cy - radius);
  const x1 = Math.min(fullWidth, cx + radius + 1), y1 = Math.min(fullHeight, cy + radius + 1);
  onStage?.('READ_TARGET_SOURCE_BLOCKS');
  const raw = await image.readRasters({ window: [x0, y0, x1, y1], samples: [0], interleave: true });
  const width = x1 - x0, height = y1 - y0;
  const nodataRaw = image.getGDALNoData?.();
  const nodata = nodataRaw == null ? 0 : Number(nodataRaw);
  const db = new Float32Array(raw.length);
  const power = new Float32Array(raw.length);
  const valid = [];
  onStage?.('APPLY_PRODUCT_CALIBRATION_LUT');
  for (let py = 0, k = 0; py < height; py++) {
    for (let px = 0; px < width; px++, k++) {
      const dn = Number(raw[k]);
      if (!Number.isFinite(dn) || dn === nodata) { db[k] = NaN; power[k] = NaN; continue; }
      const lut = calibrationLutAt(calibration, y0 + py, x0 + px, quantity);
      if (!Number.isFinite(lut) || lut === 0) { db[k] = NaN; power[k] = NaN; continue; }
      const value = dn * dn / (lut * lut);
      power[k] = value;
      db[k] = value > 0 ? 10 * Math.log10(value) : NaN;
      if (Number.isFinite(db[k])) valid.push(db[k]);
    }
  }
  const stats = { validCount: valid.length, p02: percentile(valid, 0.02), p50: percentile(valid, 0.5), p98: percentile(valid, 0.98) };
  const quality = geolocationQuality(geolocation);
  onStage?.('READY');
  return {
    state: 'CALIBRATED_SENTINEL1_TARGET_PATCH', id: record.id, startTime: record.startTime, platform: record.platform,
    target: { lon: Number(lon), lat: Number(lat) }, polarization: String(polarization).toUpperCase(), quantity,
    sourceWindow: [x0, y0, x1, y1], width, height, centerPixel: [cx, cy],
    geolocation: { method: geolocation.state, residualDeg: geolocation.residualDeg ?? null, gcpSpanDeg: geolocation.gcpSpanDeg ?? null, quality, fractionalPixel: [geolocation.pixel, geolocation.line] },
    rawDn: raw, power, db, stats,
    processing: { thermalNoiseCorrectionPerformed: product.thermalNoiseCorrectionPerformed, radiometricCalibration: 'PRODUCT_LUT', terrainFlattened: false, localIncidenceAngleCorrected: false },
    product: { rangePixelSpacing: product.rangePixelSpacing, azimuthPixelSpacing: product.azimuthPixelSpacing, incidenceAngleMidSwath: product.incidenceAngleMidSwath, orbitSource: product.orbitSource || detail.properties?.['s1:orbit_source'] || null },
    evidence: { grade: evidenceGrade(quality), measured: true, inferred: false },
    provenance: { measurement: assets.measurement.sourceHref, calibration: assets.calibration.sourceHref, product: assets.product.sourceHref, noise: assets.noise?.sourceHref || null },
    boundary: 'Target-centered actual Sentinel-1 GRD pixels, product-GCP geolocated and product-LUT calibrated. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'
  };
}

export function paintCalibratedPatch(patch, canvas) {
  const { width, height, db, stats } = patch;
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(width, height);
  const low = stats.p02 ?? -30, high = stats.p98 ?? 0;
  for (let i = 0; i < db.length; i++) {
    const j = i * 4, value = db[i];
    if (!Number.isFinite(value)) { image.data[j + 3] = 0; continue; }
    const byte = displayByte(value, low, high);
    image.data[j] = byte;
    image.data[j + 1] = Math.min(255, Math.round(byte * 1.02));
    image.data[j + 2] = Math.min(255, Math.round(byte * 1.08));
    image.data[j + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return { displayRangeDb: [low, high], displayTransform: 'percentile dB stretch only' };
}

export async function calibratedTemporalStack(records, lon, lat, { polarization = 'vv', quantity = 'sigmaNought', maxScenes = 96, onProgress, signal } = {}) {
  const out = [];
  const candidates = (records || []).slice(-Math.max(1, Math.min(Number(maxScenes) || 96, 256)));
  for (let i = 0; i < candidates.length; i++) {
    try { out.push(await sampleCalibratedSentinel1(candidates[i], lon, lat, { polarization, quantity, signal })); }
    catch (error) { out.push({ state: 'SAMPLE_ERROR', id: candidates[i].id, startTime: candidates[i].startTime, measured: false, error: error.message }); }
    onProgress?.(i + 1, candidates.length);
  }
  return out;
}

export function clearSentinel1CalibrationCache() {
  TIFF_CACHE.clear(); DETAIL_CACHE.clear(); XML_CACHE.clear();
}
