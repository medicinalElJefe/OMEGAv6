export function wrapLon(lon) {
  let x = Number(lon);
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

export function unwrapRing(ring, anchorLon = null) {
  if (!Array.isArray(ring) || ring.length === 0) return [];
  const out = [];
  let prev = anchorLon === null ? Number(ring[0][0]) : Number(anchorLon);
  for (const coord of ring) {
    let lon = Number(coord[0]);
    const lat = Number(coord[1]);
    while (lon - prev > 180) lon -= 360;
    while (lon - prev < -180) lon += 360;
    out.push([lon, lat]);
    prev = lon;
  }
  return out;
}

function pointInRing(lon, lat, ring) {
  const r = unwrapRing(ring, lon);
  let x = lon;
  const avg = r.reduce((s, p) => s + p[0], 0) / Math.max(1, r.length);
  while (x - avg > 180) x -= 360;
  while (x - avg < -180) x += 360;
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (x < (xj - xi) * (lat - yi) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInPolygon(lon, lat, polygonCoords) {
  if (!polygonCoords?.length) return false;
  if (!pointInRing(lon, lat, polygonCoords[0])) return false;
  for (let i = 1; i < polygonCoords.length; i++) {
    if (pointInRing(lon, lat, polygonCoords[i])) return false;
  }
  return true;
}

export function geometryContainsPoint(geometry, lon, lat) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return pointInPolygon(lon, lat, geometry.coordinates);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some(poly => pointInPolygon(lon, lat, poly));
  }
  return false;
}

export function geometryRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

export function coverageAtPoint(records, lon, lat, throughIndex = records.length - 1) {
  return records.slice(0, throughIndex + 1).filter(r => geometryContainsPoint(r.geometry, lon, lat));
}

export function boundsOfRecords(records) {
  let minLat = 90, maxLat = -90;
  const lons = [];
  for (const record of records) {
    for (const ring of geometryRings(record.geometry)) {
      for (const [lon, lat] of ring) {
        if (Number.isFinite(lon)) lons.push(wrapLon(lon));
        if (Number.isFinite(lat)) { minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat); }
      }
    }
  }
  if (!lons.length) return null;
  return { minLon: Math.min(...lons), maxLon: Math.max(...lons), minLat, maxLat };
}
