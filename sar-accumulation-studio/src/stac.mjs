const EARTH_SEARCH = 'https://earth-search.aws.element84.com/v1/search';

export function s3ToHttps(href) {
  if (!href || !String(href).startsWith('s3://')) return href || null;
  const rest = String(href).slice(5);
  const slash = rest.indexOf('/');
  if (slash < 0) return `https://${rest}.s3.amazonaws.com/`;
  const bucket = rest.slice(0, slash);
  const key = rest.slice(slash + 1).split('/').map(encodeURIComponent).join('/').replace(/%3A/gi, ':');
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

export function wktPoint(wkt) {
  if (!wkt) return null;
  const match = String(wkt).trim().match(/^POINT\s*\(\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s+(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\)$/i);
  if (!match) return null;
  const lon = Number(match[1]), lat = Number(match[2]);
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return { type: 'Point', coordinates: [lon, lat] };
}

export function wktBounds(wkt) {
  if (!wkt) return null;
  const nums = String(wkt).match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)?.map(Number) || [];
  if (nums.length < 2 || nums.length % 2) return null;
  const lons = [], lats = [];
  for (let i = 0; i < nums.length; i += 2) { lons.push(nums[i]); lats.push(nums[i + 1]); }
  const minLon = Math.min(...lons), maxLon = Math.max(...lons), minLat = Math.min(...lats), maxLat = Math.max(...lats);
  if (![minLon,maxLon,minLat,maxLat].every(Number.isFinite)) return null;
  return [minLon,minLat,maxLon,maxLat];
}

export function buildStacBody({ start, end, bbox, intersectsWith, limit = 250 } = {}) {
  const body = {
    collections: ['sentinel-1-grd'],
    limit: Math.max(1, Math.min(Number(limit) || 250, 1000)),
    sortby: [{ field: 'properties.datetime', direction: 'asc' }]
  };
  if (start || end) body.datetime = `${start || '..'}/${end || '..'}`;

  if (bbox) {
    if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(Number.isFinite) || bbox[0] >= bbox[2] || bbox[1] >= bbox[3]) {
      throw new Error('STAC bbox must have non-zero area [west,south,east,north].');
    }
    body.bbox = bbox;
  } else if (intersectsWith) {
    const point = wktPoint(intersectsWith);
    if (point) body.intersects = point;
    else {
      const bounds = wktBounds(intersectsWith);
      if (bounds) {
        if (bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) throw new Error('Spatial WKT collapsed to a zero-area search geometry.');
        body.bbox = bounds;
      }
    }
  }
  return body;
}

function assetMap(item) {
  const out = {};
  for (const [key, asset] of Object.entries(item.assets || {})) {
    const type = String(asset?.type || '').toLowerCase();
    const roles = Array.isArray(asset?.roles) ? asset.roles : [];
    if (!roles.includes('data') || !type.includes('tiff')) continue;
    out[key.toLowerCase()] = {
      key: key.toLowerCase(),
      href: s3ToHttps(asset.href),
      sourceHref: asset.href,
      type: asset.type || null,
      title: asset.title || key.toUpperCase(),
      description: asset.description || null,
      roles
    };
  }
  return out;
}

function thumbnailOf(item) {
  const link = (item.links || []).find(l => ['thumbnail','preview'].includes(l.rel));
  return link?.href || null;
}

export function normalizeStacItem(item, fetchedAt = new Date().toISOString()) {
  const p = item.properties || {};
  const startTime = p.start_datetime || p.datetime || null;
  const stopTime = p.end_datetime || p.datetime || startTime;
  const assets = assetMap(item);
  const polarizations = p['sar:polarizations'] || Object.keys(assets);
  return {
    id: item.id,
    sceneName: item.id,
    platform: p.platform || 'sentinel-1',
    sensor: 'C-SAR',
    beamMode: p['sar:instrument_mode'] || null,
    polarization: Array.isArray(polarizations) ? polarizations.join('+') : polarizations,
    processingLevel: p['sar:product_type'] || 'GRD',
    maturity: p['processing:level'] || null,
    flightDirection: p['sat:orbit_state'] ? String(p['sat:orbit_state']).toUpperCase() : null,
    absoluteOrbit: p['sat:absolute_orbit'] ?? null,
    relativeOrbit: p['sat:relative_orbit'] ?? null,
    frameNumber: null,
    startTime,
    stopTime,
    geometry: item.geometry,
    bbox: item.bbox || null,
    browse: thumbnailOf(item),
    dataAssets: assets,
    projection: {
      epsg: p['proj:epsg'] ?? null,
      bbox: p['proj:bbox'] || item.bbox || null,
      shape: p['proj:shape'] || null,
      transform: p['proj:transform'] || null
    },
    measurement: {
      kind: 'SENTINEL1_GRD_AMPLITUDE',
      actualPixelsAvailable: Object.keys(assets).length > 0,
      radiometricCalibrationClaimed: false,
      interpretation: 'Actual GRD measurement values; display stretch is visual only unless a calibrated transform is explicitly applied.'
    },
    source: {
      authority: 'Earth Search STAC / AWS Sentinel-1 GRD',
      endpoint: EARTH_SEARCH,
      query: null,
      fetchedAt,
      importedFile: null
    },
    sourceProperties: typeof structuredClone === 'function' ? structuredClone(p) : JSON.parse(JSON.stringify(p)),
    evidence: {
      grade: 'B',
      reason: 'Public STAC item with measurement COG asset and acquisition geometry/time; precise ephemeris is not independently bound by this client.'
    },
    measured: true,
    inferred: false
  };
}

function passesClientFilters(record, { flightDirection, polarization, instrumentMode } = {}) {
  if (flightDirection && String(record.flightDirection || '').toUpperCase() !== String(flightDirection).toUpperCase()) return false;
  if (instrumentMode && String(record.beamMode || '').toUpperCase() !== String(instrumentMode).toUpperCase()) return false;
  if (polarization) {
    const wanted = String(polarization).toUpperCase().split(/[,+ ]+/).filter(Boolean);
    const have = String(record.polarization || '').toUpperCase().split(/[,+ ]+/).filter(Boolean);
    if (!wanted.every(p => have.includes(p))) return false;
  }
  return true;
}

export async function fetchSentinel1Cog(options = {}, signal) {
  const body = buildStacBody(options);
  const wanted = Math.max(1, Math.min(Number(options.maxResults || options.limit) || 250, 5000));
  const items = [];
  const fetchedAt = new Date().toISOString();
  let request = { url: EARTH_SEARCH, method: 'POST', body };
  let pageCount = 0;

  while (request && items.length < wanted && pageCount < 25) {
    const init = request.method === 'POST'
      ? { method: 'POST', headers: { 'content-type': 'application/json', 'accept': 'application/geo+json,application/json' }, body: JSON.stringify(request.body), signal }
      : { method: 'GET', headers: { 'accept': 'application/geo+json,application/json' }, signal };
    const response = await fetch(request.url, init);
    if (!response.ok) throw new Error(`Earth Search STAC ${response.status}: ${(await response.text()).slice(0, 400)}`);
    const fc = await response.json();
    for (const item of fc.features || []) {
      const record = normalizeStacItem(item, fetchedAt);
      if (passesClientFilters(record, options)) items.push(record);
      if (items.length >= wanted) break;
    }
    const next = (fc.links || []).find(l => l.rel === 'next');
    if (!next || items.length >= wanted) break;
    request = {
      url: next.href,
      method: String(next.method || 'GET').toUpperCase(),
      body: next.body || body
    };
    pageCount++;
  }

  return {
    records: items.slice(0, wanted),
    source: { authority: 'Earth Search STAC / AWS Sentinel-1 GRD', endpoint: EARTH_SEARCH, query: body, fetchedAt },
    requestBody: body,
    pageCount: pageCount + 1
  };
}
