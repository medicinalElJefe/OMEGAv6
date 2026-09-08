const ENDPOINT = 'https://api.daac.asf.alaska.edu/services/search/param';

export function buildAsfQuery({ dataset, start, end, processingLevel, dataMaturity, flightDirection, polarization, relativeOrbit, intersectsWith, maxResults = 5000 }) {
  const params = new URLSearchParams();
  params.set('dataset', dataset || 'SENTINEL-1');
  if (start) params.set('start', new Date(start).toISOString());
  if (end) params.set('end', new Date(end).toISOString());
  if (processingLevel) params.set('processingLevel', processingLevel);
  if (dataMaturity) params.set('dataMaturity', dataMaturity);
  if (flightDirection) params.set('flightDirection', flightDirection);
  if (polarization) params.set('polarization', polarization);
  if (relativeOrbit) params.set('relativeOrbit', relativeOrbit);
  if (intersectsWith) params.set('intersectsWith', intersectsWith);
  params.set('maxResults', String(Math.max(1, Math.min(Number(maxResults) || 5000, 10000))));
  params.set('output', 'geojson');
  return `${ENDPOINT}?${params.toString()}`;
}

export async function fetchAsf(options, signal) {
  const url = buildAsfQuery(options);
  const response = await fetch(url, { signal, headers: { 'Accept': 'application/geo+json, application/json' } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ASF Search API ${response.status}: ${body.slice(0, 500)}`);
  }
  const json = await response.json();
  if (json.type !== 'FeatureCollection') throw new Error('ASF response was not a GeoJSON FeatureCollection');
  return {
    featureCollection: json,
    source: {
      authority: 'ASF DAAC',
      endpoint: ENDPOINT,
      query: Object.fromEntries(new URL(url).searchParams.entries()),
      fetchedAt: new Date().toISOString()
    },
    url
  };
}
