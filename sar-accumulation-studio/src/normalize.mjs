const FIRST = (...values) => values.find(v => v !== undefined && v !== null && v !== "");

export function parseUtc(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export function stableId(props = {}, feature = {}) {
  return String(FIRST(
    props.fileID,
    props.sceneName,
    props.granuleName,
    props.granuleUR,
    props.productID,
    props.native_id,
    feature.id,
    `${FIRST(props.platform, "UNKNOWN")}:${FIRST(props.startTime, props.start, "NO_TIME")}:${FIRST(props.orbit, props.absoluteOrbit, "NO_ORBIT")}`
  ));
}

export function normalizeGeometry(geometry) {
  if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type)) return null;
  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates)) return null;
  return { type: geometry.type, coordinates };
}

function truthyPreciseOrbit(props) {
  const values = [
    props.orbitEphemerisType,
    props.orbitQuality,
    props.ephemerisType,
    props.auxOrbitType,
    props.podType
  ].filter(Boolean).map(v => String(v).toUpperCase());
  return values.some(v => v === "POE" || v.includes("PRECISE"));
}

function maturityOf(props) {
  const v = FIRST(props.dataMaturity, props.maturity, props.productMaturity, props.validationStatus);
  return v ? String(v).toUpperCase() : null;
}

export function evidenceGrade({ geometry, startTime, source, properties }) {
  if (!geometry || !startTime) return { grade: "C", reason: "Missing authoritative footprint or acquisition time" };
  if (truthyPreciseOrbit(properties)) return { grade: "A", reason: "Footprint/time present and precise-orbit evidence declared in source metadata" };
  if (source?.authority === "ASF DAAC") return { grade: "B", reason: "Authoritative ASF catalog geometry/time; precise ephemeris not independently bound" };
  return { grade: "C", reason: "Imported geometry/time; source authority not independently verified by this runtime" };
}

export function normalizeFeature(feature, source = {}) {
  if (!feature || feature.type !== "Feature") throw new Error("Expected GeoJSON Feature");
  const p = feature.properties || {};
  const geometry = normalizeGeometry(feature.geometry);
  const startTime = parseUtc(FIRST(p.startTime, p.start, p.beginningDateTime, p.acquisitionStart));
  const stopTime = parseUtc(FIRST(p.stopTime, p.end, p.endingDateTime, p.acquisitionStop)) || startTime;
  const record = {
    id: stableId(p, feature),
    sceneName: FIRST(p.sceneName, p.fileID, p.granuleName, p.productID, feature.id, "UNKNOWN"),
    platform: FIRST(p.platform, p.dataset, p.mission, "UNKNOWN"),
    sensor: FIRST(p.sensor, p.instrument, null),
    beamMode: FIRST(p.beamModeType, p.beamMode, p.mode, null),
    polarization: FIRST(p.polarization, p.polarizations, null),
    processingLevel: FIRST(p.processingLevel, p.processingType, p.productType, null),
    maturity: maturityOf(p),
    flightDirection: FIRST(p.flightDirection, p.passDirection, p.ascendingDescending, null),
    absoluteOrbit: FIRST(p.orbit, p.absoluteOrbit, p.orbitNumber, null),
    relativeOrbit: FIRST(p.pathNumber, p.relativeOrbit, p.track, null),
    frameNumber: FIRST(p.frameNumber, p.frame, p.asfFrame, null),
    startTime,
    stopTime,
    geometry,
    source: {
      authority: source.authority || "IMPORTED",
      endpoint: source.endpoint || null,
      query: source.query || null,
      fetchedAt: source.fetchedAt || new Date().toISOString(),
      importedFile: source.importedFile || null
    },
    sourceProperties: typeof structuredClone === 'function' ? structuredClone(p) : JSON.parse(JSON.stringify(p))
  };
  record.evidence = evidenceGrade({ geometry, startTime, source: record.source, properties: p });
  record.measured = true;
  record.inferred = false;
  return record;
}

export function normalizeFeatureCollection(fc, source = {}) {
  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    throw new Error("Expected a GeoJSON FeatureCollection");
  }
  const errors = [];
  const records = [];
  fc.features.forEach((feature, index) => {
    try {
      const record = normalizeFeature(feature, source);
      if (!record.geometry || !record.startTime) throw new Error("Feature lacks footprint or valid acquisition time");
      records.push(record);
    } catch (error) {
      errors.push({ index, message: error.message });
    }
  });
  return { records, errors };
}
