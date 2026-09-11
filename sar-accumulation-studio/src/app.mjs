import { fetchAsf, buildAsfQuery } from './asf.mjs';
import { normalizeFeatureCollection } from './normalize.mjs';
import { dedupeAndSort, frameState, maturityWarnings, revisitStats, knownMissionWarnings } from './engine.mjs';
import { fetchSentinel1Cog, buildStacBody } from './stac.mjs';
import { chronologyMetrics, freshnessLabel, formatHours, temporalPosition } from './analytics.mjs';
import { renderCog, dataAssetChoices, probeStack as probeCogStack, sampleCogNeighborhood } from './raster.mjs';
import { buildGibsWmsUrl, GIBS_LAYERS, contextualTimestamp, gibsContextManifest, gibsTransportUrl, fallbackDates } from './gibs.mjs';
import { atlasHierarchy, deweyAtlasEstimate } from './atlas.mjs';
import { buildManifest, downloadJson } from './export.mjs';
import { WorldRenderer } from './render.mjs';

const $ = s => document.querySelector(s);
const state = {
  records: [], frame: 0, playing: false, playTimer: null, temporalRaf: null,
  query: null, sourceUrl: null, errors: [], contextWarnings: [], mode: 'accumulate', visual: 'earth',
  metrics: chronologyMetrics([]), liveTimer: null, fetching: false, probeResults: [],
  virtualTime: null, previousWall: null, sourceMode: 'stac',
  gibsContext: null, gibsKey: null, gibsTimer: null, gibsGeneration: 0,
  inference: null, selectedAtlas: null
};

const renderer = new WorldRenderer($('#map'));
renderer.redraw = drawMap;
renderer.onPoint = point => { updatePoint(point); renderAtlas(point); };
renderer.onViewChange = bbox => scheduleGibs(bbox);

function dateInput(daysAgo = 0) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
}
$('#start').value = dateInput(30);
$('#end').value = dateInput(0);

function optionsFromForm() {
  return {
    dataset: $('#dataset').value,
    start: `${$('#start').value}T00:00:00Z`,
    end: `${$('#end').value}T23:59:59Z`,
    processingLevel: $('#level').value.trim(),
    dataMaturity: $('#maturity').value,
    flightDirection: $('#direction').value,
    polarization: $('#polarization').value.trim(),
    relativeOrbit: $('#relativeOrbit').value.trim(),
    intersectsWith: $('#aoi').value.trim(),
    maxResults: Number($('#maxResults').value)
  };
}

function setStatus(text, kind = '') { const el = $('#status'); el.textContent = text; el.dataset.kind = kind; }
function currentState() { return frameState(state.records, state.frame, state.mode); }
function currentRecord() { return currentState().current; }
function fmtNum(v) { return Number.isFinite(v) ? (Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(3)) : '—'; }

function configureSourceMode() {
  state.sourceMode = $('#sourceMode').value;
  const stac = state.sourceMode === 'stac';
  if (stac) { $('#dataset').value = 'SENTINEL-1'; $('#dataset').disabled = true; $('#level').value = 'GRD'; $('#maturity').value = ''; }
  else $('#dataset').disabled = false;
  $('#maturity').disabled = stac;
  $('#relativeOrbit').disabled = stac;
  $('#load').textContent = stac ? 'Load live COG stack' : 'Load ASF catalog';
  $('#sourceBadge').textContent = stac ? 'S1 COG' : 'ASF';
  previewRequest();
}

function setRecords(records, errors = [], context = {}, { preserveCurrent = false } = {}) {
  const previousId = preserveCurrent ? currentRecord()?.id : null;
  const previousWasLast = preserveCurrent && state.frame === Math.max(0, state.records.length - 1);
  state.records = dedupeAndSort(records);
  state.errors = errors;
  state.metrics = chronologyMetrics(state.records);
  if (previousId) {
    const i = state.records.findIndex(r => r.id === previousId);
    state.frame = previousWasLast ? Math.max(0, state.records.length - 1) : (i >= 0 ? i : Math.max(0, state.records.length - 1));
  } else state.frame = Math.max(0, state.records.length - 1);
  $('#timeline').max = Math.max(0, state.records.length - 1);
  $('#timeline').value = state.frame;
  state.query = context.query || null;
  state.sourceUrl = context.url || null;
  state.contextWarnings = context.warnings || [];
  state.probeResults = [];
  state.inference = null;
  resetInference();
  renderWarnings(); renderDiagnostics(); draw(); renderTable(); updateFreshness();
}

async function loadLive({ refresh = false } = {}) {
  if (state.fetching) return;
  state.fetching = true;
  const opts = optionsFromForm();
  const source = $('#sourceMode').value;
  setStatus(refresh ? 'Refreshing source…' : source === 'stac' ? 'Querying Earth Search Sentinel-1 COGs…' : 'Querying ASF DAAC…');
  previewRequest();
  try {
    if (source === 'stac') {
      const result = await fetchSentinel1Cog({ start: opts.start, end: opts.end, intersectsWith: opts.intersectsWith, maxResults: opts.maxResults, flightDirection: opts.flightDirection, polarization: opts.polarization });
      const records = refresh ? dedupeAndSort([...state.records, ...result.records]) : result.records;
      setRecords(records, [], { query: result.requestBody, url: result.source.endpoint, warnings: [] }, { preserveCurrent: refresh });
      setStatus(`${state.records.length} Sentinel-1 acquisitions · ${state.metrics.pixelReady} actual COG raster scenes · ${result.pageCount} STAC page(s)`, 'ok');
    } else {
      const result = await fetchAsf(opts);
      const normalized = normalizeFeatureCollection(result.featureCollection, result.source);
      const records = refresh ? dedupeAndSort([...state.records, ...normalized.records]) : normalized.records;
      setRecords(records, normalized.errors, { query: result.source.query, url: result.url, warnings: knownMissionWarnings(opts) }, { preserveCurrent: refresh });
      setStatus(`${state.records.length} authoritative ASF acquisitions loaded${normalized.errors.length ? ` · ${normalized.errors.length} rejected` : ''}`, 'ok');
    }
  } catch (error) { setStatus(error.message, 'error'); }
  finally { state.fetching = false; }
}

async function importFile(file) {
  stop();
  const json = JSON.parse(await file.text());
  const normalized = normalizeFeatureCollection(json, { authority: 'IMPORTED', importedFile: file.name, fetchedAt: new Date().toISOString() });
  state.sourceMode = 'import'; $('#sourceBadge').textContent = 'IMPORT';
  setRecords(normalized.records, normalized.errors, { query: { importedFile: file.name } });
  setStatus(`${state.records.length} acquisitions imported from ${file.name}${normalized.errors.length ? ` · ${normalized.errors.length} rejected` : ''}`, 'ok');
}

function drawMap() {
  renderer.displayMode = state.visual;
  renderer.clear();
  const f = currentState();
  renderer.drawRecords(f.visible, f.current?.id, state.visual, renderer.motionPhase);
}

function draw() {
  const f = currentState();
  drawMap();
  $('#timeline').value = f.index;
  $('#frameIndex').textContent = state.records.length ? `${f.index + 1} / ${state.records.length}` : '0 / 0';
  $('#obsCount').textContent = f.count;
  $('#currentTime').textContent = f.current?.startTime || '—';
  $('#currentScene').textContent = f.current?.sceneName || '—';
  $('#grade').textContent = f.current?.evidence?.grade || '—';
  $('#gradeReason').textContent = f.current?.evidence?.reason || 'No acquisition selected';
  $('#orbit').textContent = f.current ? `${f.current.flightDirection || '—'} · abs ${f.current.absoluteOrbit ?? '—'} · rel ${f.current.relativeOrbit ?? '—'}` : '—';
  $('#platform').textContent = f.current ? `${f.current.platform}${f.current.processingLevel ? ` · ${f.current.processingLevel}` : ''}${f.current.maturity ? ` · ${f.current.maturity}` : ''}` : '—';
  $('#medianCadence').textContent = formatHours(state.metrics.cadence.median);
  $('#pixelReady').textContent = state.metrics.pixelReady;
  refreshAssetChoices(f.current); updateBrowse(f.current);
  if (renderer.point) updatePoint(renderer.point, false);
  if ($('#gibsTime').value === 'frame') scheduleGibs(renderer.viewBounds());
}

function renderWarnings() {
  const list = $('#warnings'); list.innerHTML = '';
  const warnings = [...maturityWarnings(state.records), ...state.contextWarnings];
  if (state.metrics.anomalousGaps.length) warnings.push(`${state.metrics.anomalousGaps.length} chronology gap(s) exceed the robust cadence threshold; these remain missing-observation intervals unless resolved by source data.`);
  if (state.errors.length) warnings.push(`${state.errors.length} input feature(s) were rejected by normalization.`);
  if (!warnings.length) warnings.push('No maturity, authority, or chronology warning detected in the loaded metadata.');
  warnings.forEach(w => { const li = document.createElement('li'); li.textContent = w; list.append(li); });
}

function renderDiagnostics() {
  $('#spanMetric').textContent = formatHours(state.metrics.spanHours);
  $('#meanCadence').textContent = formatHours(state.metrics.cadence.mean);
  $('#maxGap').textContent = formatHours(state.metrics.cadence.max);
  $('#anomalyCount').textContent = state.metrics.anomalousGaps.length;
  $('#gradeMix').textContent = `A${state.metrics.grades.A} · B${state.metrics.grades.B} · C${state.metrics.grades.C}`;
  $('#gapList').textContent = state.metrics.anomalousGaps.slice(0, 5).map(g => `${formatHours(g.hours)} · ${g.from} → ${g.to}`).join('  |  ') || 'No robust cadence outlier identified.';
}

function renderTable() {
  const body = $('#rows'); body.innerHTML = '';
  const f = currentState(), start = Math.max(0, f.index - 12), end = Math.min(state.records.length, f.index + 13);
  for (let i = start; i < end; i++) {
    const r = state.records[i], tr = document.createElement('tr');
    if (i === f.index) tr.className = 'current';
    const pixel = Object.keys(r.dataAssets || {}).length ? 'YES' : '—';
    [i + 1, r.startTime, r.platform, r.processingLevel || '—', r.flightDirection || '—', r.relativeOrbit ?? '—', r.evidence?.grade || '—', pixel, r.sceneName].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    tr.onclick = () => { stop(); state.frame = i; state.inference = null; resetInference(); draw(); renderTable(); };
    body.append(tr);
  }
}

function refreshAssetChoices(record) {
  const select = $('#assetSelect'), previous = select.value, assets = dataAssetChoices(record);
  select.innerHTML = '';
  for (const a of assets) { const o = document.createElement('option'); o.value = a.key; o.textContent = a.title || a.key.toUpperCase(); select.append(o); }
  if (assets.some(a => a.key === previous)) select.value = previous;
  $('#loadRaster').disabled = !assets.length;
  $('#probeStack').disabled = !renderer.point || !state.metrics.pixelReady;
  $('#inferGap').disabled = !renderer.point || !state.metrics.pixelReady;
}

function updateBrowse(record) {
  const img = $('#browseImage'), empty = $('#browseEmpty');
  if (record?.browse) {
    img.src = record.browse; img.style.display = 'block'; empty.style.display = 'none';
    $('#browseCaption').textContent = `${record.sceneName} · source browse/thumbnail only · not promoted to calibrated raster evidence.`;
  } else { img.removeAttribute('src'); img.style.display = 'none'; empty.style.display = 'grid'; $('#browseCaption').textContent = 'No source browse image is attached to this acquisition.'; }
}

async function loadCurrentRaster() {
  const r = currentRecord(), key = $('#assetSelect').value, asset = r?.dataAssets?.[key];
  if (!asset) return;
  $('#rasterEmpty').textContent = 'Reading Cloud Optimized GeoTIFF ranges…'; $('#rasterEmpty').style.display = 'grid';
  try {
    const meta = await renderCog(asset.href, $('#raster'));
    $('#rasterEmpty').style.display = 'none'; $('#raster').classList.remove('flash'); void $('#raster').offsetWidth; $('#raster').classList.add('flash');
    const s = meta.stats;
    $('#rasterStats').textContent = `ACTUAL GRD · ${asset.key.toUpperCase()} · source ${meta.sourceWidth}×${meta.sourceHeight} · display ${meta.renderedWidth}×${meta.renderedHeight} · sampled valid ${s.sampledCount.toLocaleString()} · p02 ${fmtNum(s.p02)} · median ${fmtNum(s.p50)} · p98 ${fmtNum(s.p98)} · mean ${fmtNum(s.mean)} · display stretch only, no radiometric calibration claim.`;
  } catch (error) { $('#rasterEmpty').style.display = 'grid'; $('#rasterEmpty').textContent = `Raster unavailable: ${error.message}`; $('#rasterStats').textContent = 'No raster evidence loaded.'; }
}

function updatePoint(point, redraw = true) {
  const stats = revisitStats(state.records, point.lon, point.lat, state.frame);
  $('#point').textContent = `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`;
  $('#pointHits').textContent = stats.hitCount; $('#pointFirst').textContent = stats.first || '—'; $('#pointLast').textContent = stats.last || '—';
  $('#pointMean').textContent = stats.meanHours === null ? '—' : formatHours(stats.meanHours);
  $('#probeStack').disabled = !state.metrics.pixelReady; $('#inferGap').disabled = !state.metrics.pixelReady;
  state.inference = null; resetInference();
  if (redraw) drawMap();
}

async function runPixelProbe() {
  if (!renderer.point) return;
  const key = $('#assetSelect').value;
  $('#probeStack').disabled = true; $('#pixelProbeStatus').textContent = 'Probing COG pixels…';
  try {
    state.probeResults = await probeCogStack(state.records.slice(0, state.frame + 1), renderer.point.lon, renderer.point.lat, key, { maxScenes: 96, onProgress: (a, b) => { $('#pixelProbeStatus').textContent = `Probing actual pixels ${a}/${b}…`; } });
    const valid = state.probeResults.filter(x => Number.isFinite(x.value));
    $('#pixelProbeStatus').textContent = `${valid.length} actual pixel samples from ${state.probeResults.length} candidate COG scenes · raw GRD values; no cross-scene radiometric calibration claim.`;
    drawProbeChart(state.probeResults); $('#inferGap').disabled = valid.length < 1;
  } catch (error) { $('#pixelProbeStatus').textContent = error.message; }
  finally { $('#probeStack').disabled = !state.metrics.pixelReady; }
}

function drawProbeChart(results) {
  const canvas = $('#probeChart'), rect = canvas.getBoundingClientRect(), dpr = Math.max(1, devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
  const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); const w = rect.width, h = rect.height;
  c.clearRect(0, 0, w, h); c.fillStyle = '#061017'; c.fillRect(0, 0, w, h);
  const valid = results.filter(r => Number.isFinite(r.value));
  if (!valid.length) { c.fillStyle = '#79939f'; c.font = '11px ui-monospace,monospace'; c.fillText('No actual COG samples at this point.', 12, 22); return; }
  const times = valid.map(r => new Date(r.startTime).getTime()), vals = valid.map(r => r.value);
  const minT = Math.min(...times), maxT = Math.max(...times), minV = Math.min(...vals), maxV = Math.max(...vals), pad = 26;
  const x = t => pad + (w - 2 * pad) * (maxT === minT ? .5 : (t - minT) / (maxT - minT));
  const y = v => h - pad - (h - 2 * pad) * (maxV === minV ? .5 : (v - minV) / (maxV - minV));
  c.strokeStyle = 'rgba(140,180,194,.22)'; c.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad); c.beginPath();
  valid.forEach((r, i) => { const px = x(times[i]), py = y(vals[i]); if (i) c.lineTo(px, py); else c.moveTo(px, py); });
  c.strokeStyle = 'rgba(132,235,244,.82)'; c.lineWidth = 1.5; c.stroke();
  valid.forEach((r, i) => { c.beginPath(); c.arc(x(times[i]), y(vals[i]), 2.6, 0, Math.PI * 2); c.fillStyle = 'rgba(245,252,255,.92)'; c.fill(); });
  c.fillStyle = '#7795a1'; c.font = '9px ui-monospace,monospace'; c.fillText(`min ${fmtNum(minV)}`, 4, h - pad + 3); c.fillText(`max ${fmtNum(maxV)}`, 4, pad + 3);
  c.fillText(new Date(minT).toISOString().slice(0, 10), pad, h - 7); const right = new Date(maxT).toISOString().slice(0, 10); c.fillText(right, w - pad - c.measureText(right).width, h - 7);
}

function renderAtlas(point) {
  state.selectedAtlas = atlasHierarchy(point.lon, point.lat);
  $('#atlasAddress').textContent = state.selectedAtlas.map(a => `${a.address} · nominal ${a.nominalScaleKm.toFixed(1)} km`).join('  →  ');
}

function resetInference() {
  $('#inferState').textContent = 'UNRESOLVED'; $('#inferValue').textContent = '—'; $('#inferUncertainty').textContent = '—'; $('#inferConfidence').textContent = '—'; $('#inferLevel').textContent = '—'; $('#inferSupport').textContent = '—';
  $('#inferExplanation').textContent = 'Inference is used only where source measurement is absent. Estimated values remain non-observational and retain uncertainty and support metadata.';
}

async function inferGap() {
  if (!renderer.point) return;
  const point = renderer.point, targetRecord = currentRecord(), targetTime = targetRecord?.startTime || new Date().toISOString(), key = $('#assetSelect').value;
  if (!state.probeResults.length) await runPixelProbe();
  const measuredAtTarget = state.probeResults.find(r => r.id === targetRecord?.id && Number.isFinite(r.value));
  if (measuredAtTarget) {
    state.inference = { state: 'MEASURED_AVAILABLE', measured: true, inferred: false, value: measuredAtTarget.value, id: targetRecord.id, time: targetTime };
    $('#inferState').textContent = 'MEASURED AVAILABLE'; $('#inferValue').textContent = fmtNum(measuredAtTarget.value); $('#inferConfidence').textContent = 'SOURCE'; $('#inferExplanation').textContent = 'No gap fill was performed because an actual source pixel exists for this acquisition and location.';
    return;
  }
  const anchors = state.probeResults.filter(r => Number.isFinite(r.value)).map(r => {
    const source = state.records.find(x => x.id === r.id);
    return { id: r.id, lon: point.lon, lat: point.lat, time: r.startTime, value: r.value, grade: source?.evidence?.grade || 'B', measured: true };
  });
  const asset = targetRecord?.dataAssets?.[key] || Object.values(targetRecord?.dataAssets || {})[0];
  if (asset) {
    try {
      const neighbors = await sampleCogNeighborhood(asset.href, point.lon, point.lat, { epsg: targetRecord.projection?.epsg || 4326, radiusPixels: 3 });
      neighbors.forEach(n => anchors.push({ id: `${targetRecord.id}:px:${n.pixel.join(':')}`, lon: n.lon, lat: n.lat, time: targetTime, value: n.value, grade: targetRecord.evidence?.grade || 'B', measured: true }));
    } catch (error) { $('#inferExplanation').textContent = `Spatial neighborhood unavailable: ${error.message}. Temporal measured anchors will be used if sufficient.`; }
  }
  state.inference = deweyAtlasEstimate(anchors, { lon: point.lon, lat: point.lat, time: targetTime });
  renderInference(state.inference);
}

function renderInference(result) {
  $('#inferState').textContent = result.state || 'UNRESOLVED';
  $('#inferValue').textContent = Number.isFinite(result.value) ? fmtNum(result.value) : '—';
  $('#inferUncertainty').textContent = Number.isFinite(result.uncertainty) ? `± ${fmtNum(result.uncertainty)}` : '—';
  $('#inferConfidence').textContent = Number.isFinite(result.confidence) ? `${(result.confidence * 100).toFixed(1)}%` : '—';
  $('#inferLevel').textContent = result.level ? `A${result.level}` : '—';
  $('#inferSupport').textContent = result.support ? `${result.support.count} anchors · ${result.support.spatialLocations} spatial` : '—';
  $('#inferExplanation').textContent = result.semantics || result.reason || 'No inference result.';
}

function gibsLayers() {
  const mode = $('#gibsLayer').value;
  if (mode === 'trueColor+fires') return [GIBS_LAYERS.trueColor, GIBS_LAYERS.fires];
  if (mode === 'night') return [GIBS_LAYERS.night];
  return [GIBS_LAYERS.trueColor];
}

function scheduleGibs(bbox = renderer.viewBounds()) {
  clearTimeout(state.gibsTimer);
  state.gibsTimer = setTimeout(() => refreshGibs(bbox), 180);
}

async function refreshGibs(bbox = renderer.viewBounds()) {
  if (!$('#gibsEnabled').checked) { state.gibsContext = null; state.gibsKey = null; $('#contextStamp').textContent = 'OFF'; await renderer.setBaseImage(null); return; }
  const record = $('#gibsTime').value === 'frame' ? currentRecord() : null;
  const requestedDate = $('#gibsTime').value === 'frame' ? contextualTimestamp(record, new Date()) : new Date().toISOString().slice(0, 10);
  const layers = gibsLayers();
  const width = Math.max(480, Math.round(renderer.w || 1200)), height = Math.max(240, Math.round(renderer.h || 600));
  const key = JSON.stringify({ bbox: bbox.map(v => +v.toFixed(4)), requestedDate, layers, width, height });
  if (key === state.gibsKey) return;
  state.gibsKey = key; const generation = ++state.gibsGeneration;
  const dates = fallbackDates(requestedDate, $('#gibsTime').value === 'today' ? 4 : 2);
  $('#contextStamp').textContent = `${requestedDate} · Earth loading`;
  let lastError = null;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const sourceUrl = buildGibsWmsUrl({ bbox, date, width, height, layers, transparent: false });
    const transportUrl = gibsTransportUrl(sourceUrl);
    try {
      await renderer.setBaseImage(transportUrl, { bbox, date, requestedDate, layers, sourceUrl });
      if (generation !== state.gibsGeneration) return;
      state.gibsContext = gibsContextManifest({ bbox, date, requestedDate, fallbackDays: i, layers, url: sourceUrl });
      $('#contextStamp').textContent = i ? `${date} · NASA GIBS · −${i}d` : `${date} · NASA GIBS`;
      drawMap();
      return;
    } catch (error) { lastError = error; }
  }
  if (generation === state.gibsGeneration) {
    state.gibsContext = null;
    $('#contextStamp').textContent = renderer.baseImage ? 'GIBS refresh failed · last Earth retained' : 'GIBS unavailable';
    if (!renderer.baseImage) setStatus(`Earth surface unavailable: ${lastError?.message || 'NASA GIBS image did not resolve'}. SAR evidence remains loaded, but the abstract fallback is not a substitute for Earth imagery.`, 'error');
  }
}

function jumpToLocation(lon, lat, scale = 9) {
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || lat < -90 || lat > 90 || lon < -180 || lon > 180) { setStatus('Location requires longitude −180…180 and latitude −90…90.', 'error'); return; }
  renderer.fitLocation(lon, lat, scale); renderer.point = { lon, lat }; updatePoint(renderer.point); renderAtlas(renderer.point);
  $('#jumpLat').value = lat.toFixed(6); $('#jumpLon').value = lon.toFixed(6);
}

function previewRequest() {
  const opts = optionsFromForm();
  if ($('#sourceMode').value === 'stac') $('#queryPreview').textContent = JSON.stringify({ endpoint: 'https://earth-search.aws.element84.com/v1/search', method: 'POST', body: buildStacBody({ start: opts.start, end: opts.end, intersectsWith: opts.intersectsWith, limit: opts.maxResults }) }, null, 2);
  else $('#queryPreview').textContent = buildAsfQuery(opts);
}

function updateFreshness() { const latest = state.records.at(-1)?.startTime; $('#freshness').textContent = latest ? freshnessLabel(latest) : '—'; }
function updateClock() { $('#wallClock').textContent = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC'); updateFreshness(); }
function configureLiveRefresh() { clearInterval(state.liveTimer); state.liveTimer = null; if ($('#liveRefresh').checked) { state.liveTimer = setInterval(() => loadLive({ refresh: true }), Number($('#refreshInterval').value)); $('#liveTag').textContent = 'POLLING'; } else $('#liveTag').textContent = 'LIVE READY'; }

function play() { if (!state.records.length || state.playing) return; state.playing = true; $('#play').textContent = 'Pause'; if ($('#playbackMode').value === 'temporal') startTemporalPlayback(); else startEventPlayback(); }
function startEventPlayback() { const tick = () => { if (!state.playing) return; state.frame = state.frame >= state.records.length - 1 ? 0 : state.frame + 1; state.inference = null; resetInference(); draw(); renderTable(); state.playTimer = setTimeout(tick, Math.max(50, 1100 - Number($('#speed').value))); }; tick(); }
function startTemporalPlayback() {
  state.virtualTime = new Date(currentRecord()?.startTime || state.records[0].startTime).getTime(); state.previousWall = performance.now();
  const tick = now => { if (!state.playing) return; const dt = now - state.previousWall; state.previousWall = now; state.virtualTime += dt * Number($('#timeWarp').value); const first = new Date(state.records[0].startTime).getTime(), last = new Date(state.records.at(-1).startTime).getTime(); if (state.virtualTime > last) state.virtualTime = first; const i = temporalPosition(state.records, state.virtualTime); if (i >= 0 && i !== state.frame) { state.frame = i; state.inference = null; resetInference(); draw(); renderTable(); } state.temporalRaf = requestAnimationFrame(tick); };
  state.temporalRaf = requestAnimationFrame(tick);
}
function stop() { state.playing = false; clearTimeout(state.playTimer); cancelAnimationFrame(state.temporalRaf); $('#play').textContent = 'Play'; }

$('#load').onclick = () => loadLive();
$('#file').onchange = e => e.target.files[0] && importFile(e.target.files[0]).catch(err => setStatus(err.message, 'error'));
$('#play').onclick = () => state.playing ? stop() : play();
$('#prev').onclick = () => { stop(); state.frame = Math.max(0, state.frame - 1); state.inference = null; resetInference(); draw(); renderTable(); };
$('#next').onclick = () => { stop(); state.frame = Math.min(Math.max(0, state.records.length - 1), state.frame + 1); state.inference = null; resetInference(); draw(); renderTable(); };
$('#timeline').oninput = e => { stop(); state.frame = Number(e.target.value); state.inference = null; resetInference(); draw(); renderTable(); };
$('#mode').onchange = e => { state.mode = e.target.value; draw(); };
$('#visual').onchange = e => { state.visual = e.target.value; drawMap(); if(state.visual==='earth')scheduleGibs(renderer.viewBounds()); };
$('#playbackMode').onchange = () => { if (state.playing) { stop(); play(); } };
$('#sourceMode').onchange = configureSourceMode;
$('#preview').onclick = previewRequest;
$('#loadRaster').onclick = loadCurrentRaster;
$('#probeStack').onclick = runPixelProbe;
$('#inferGap').onclick = inferGap;
$('#liveRefresh').onchange = configureLiveRefresh;
$('#refreshInterval').onchange = configureLiveRefresh;
$('#gibsEnabled').onchange = () => { state.gibsKey = null; scheduleGibs(renderer.viewBounds()); };
$('#gibsLayer').onchange = () => { state.gibsKey = null; scheduleGibs(renderer.viewBounds()); };
$('#gibsTime').onchange = () => { state.gibsKey = null; scheduleGibs(renderer.viewBounds()); };
$('#jumpLocation').onclick = () => jumpToLocation(Number($('#jumpLon').value), Number($('#jumpLat').value));
$('#worldView').onclick = () => { renderer.fitLocation(0, 0, 1); state.gibsKey = null; state.visual='earth'; if($('#visual'))$('#visual').value='earth'; scheduleGibs(renderer.viewBounds()); };
$('#deviceLocation').onclick = () => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => jumpToLocation(p.coords.longitude, p.coords.latitude, 11), e => setStatus(`Device location unavailable: ${e.message}`, 'error'), { enableHighAccuracy: true, timeout: 10000 }) : setStatus('Geolocation is not supported by this browser.', 'error');
$('#export').onclick = async () => {
  if (!state.records.length) return;
  const manifest = await buildManifest(state.records, { query: state.query, sourceUrl: state.sourceUrl, chronology: state.metrics, pixelProbe: state.probeResults, selectedPoint: renderer.point, atlas: state.selectedAtlas, inference: state.inference, satelliteContext: state.gibsContext });
  downloadJson(`sar-accumulation-${new Date().toISOString().slice(0, 10)}.manifest.json`, manifest);
};

setInterval(updateClock, 1000); updateClock(); configureSourceMode(); renderWarnings(); renderDiagnostics(); draw(); drawProbeChart([]); scheduleGibs(renderer.viewBounds());
let previousMotion = performance.now();
let lastMotionDraw = 0;
const motionFrameMs = matchMedia('(max-width:760px)').matches ? 100 : 50;
function motionLoop(now) {
  const dt = Math.min(100, now - previousMotion); previousMotion = now;
  renderer.motionPhase = (renderer.motionPhase + dt / 1800) % 1;
  const hasAnimatedEvidence = state.records.length > 0 || Boolean(renderer.point);
  if (!document.hidden && hasAnimatedEvidence && now - lastMotionDraw >= motionFrameMs) { lastMotionDraw = now; drawMap(); }
  requestAnimationFrame(motionLoop);
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(motionLoop);
