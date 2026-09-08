function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(stable(value));
}

export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function buildManifest(records, context = {}) {
  const acquisitions = records.map(r => ({
    id: r.id,
    sceneName: r.sceneName,
    platform: r.platform,
    sensor: r.sensor,
    beamMode: r.beamMode,
    polarization: r.polarization,
    processingLevel: r.processingLevel,
    maturity: r.maturity,
    flightDirection: r.flightDirection,
    absoluteOrbit: r.absoluteOrbit,
    relativeOrbit: r.relativeOrbit,
    frameNumber: r.frameNumber,
    startTime: r.startTime,
    stopTime: r.stopTime,
    evidence: r.evidence,
    geometry: r.geometry,
    source: r.source
  }));
  const core = {
    schema: 'omega.sar.accumulation.manifest.v1',
    generatedAt: new Date().toISOString(),
    semantics: {
      observationRule: 'Only source acquisitions are observations. Animation interpolation is display-only and never adds observations.',
      geometryRule: 'Footprints are catalog/product geometry, not calibrated SAR pixel arrays or InSAR displacement.'
    },
    context,
    acquisitions
  };
  const canonical = canonicalJson({ ...core, generatedAt: null });
  return { ...core, deterministicDigest: await sha256Hex(canonical) };
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
