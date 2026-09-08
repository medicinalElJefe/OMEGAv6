import { fetchAsf, buildAsfQuery } from './asf.mjs';
import { normalizeFeatureCollection } from './normalize.mjs';
import { dedupeAndSort, frameState, maturityWarnings, revisitStats, knownMissionWarnings } from './engine.mjs';
import { fetchSentinel1Cog, buildStacBody } from './stac.mjs';
import { chronologyMetrics, freshnessLabel, formatHours, temporalPosition } from './analytics.mjs';
import { renderCog, dataAssetChoices, probeStack as probeCogStack } from './raster.mjs';
import { buildManifest, downloadJson } from './export.mjs';
import { WorldRenderer } from './render.mjs';

const $ = s => document.querySelector(s);
const state = {
  records: [], frame: 0, playing: false, playTimer: null, temporalRaf: null,
  query: null, sourceUrl: null, errors: [], contextWarnings: [], mode:'accumulate', visual:'footprints',
  metrics: chronologyMetrics([]), liveTimer:null, fetching:false, lastFetch:null, probeResults:[],
  virtualTime:null, previousWall:null, sourceMode:'stac'
};

const renderer = new WorldRenderer($('#map'));
renderer.redraw = drawMap;
renderer.onPoint = point => updatePoint(point);

function dateInput(daysAgo=0) {
  const d = new Date(Date.now()-daysAgo*86400000);
  return d.toISOString().slice(0,10);
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

function setStatus(text, kind='') { const el=$('#status'); el.textContent=text; el.dataset.kind=kind; }
function currentState() { return frameState(state.records,state.frame,state.mode); }
function currentRecord(){return currentState().current}

function configureSourceMode(){
  state.sourceMode=$('#sourceMode').value;
  const stac=state.sourceMode==='stac';
  if(stac){$('#dataset').value='SENTINEL-1';$('#dataset').disabled=true;$('#level').value='GRD';$('#maturity').value='';}
  else $('#dataset').disabled=false;
  $('#maturity').disabled=stac;
  $('#relativeOrbit').disabled=stac;
  $('#load').textContent=stac?'Load live COG stack':'Load ASF catalog';
  $('#sourceBadge').textContent=stac?'S1 COG':'ASF';
  previewRequest();
}

function setRecords(records, errors=[], context={}, {preserveCurrent=false}={}) {
  const previousId = preserveCurrent ? currentRecord()?.id : null;
  const previousWasLast = preserveCurrent && state.frame === Math.max(0,state.records.length-1);
  state.records = dedupeAndSort(records);
  state.errors = errors;
  state.metrics = chronologyMetrics(state.records);
  if(previousId){
    const i=state.records.findIndex(r=>r.id===previousId);
    state.frame=previousWasLast?Math.max(0,state.records.length-1):(i>=0?i:Math.max(0,state.records.length-1));
  } else state.frame = Math.max(0,state.records.length-1);
  $('#timeline').max = Math.max(0,state.records.length-1);
  $('#timeline').value = state.frame;
  state.query = context.query || null;
  state.sourceUrl = context.url || null;
  state.contextWarnings = context.warnings || [];
  state.lastFetch = new Date().toISOString();
  renderWarnings(); renderDiagnostics(); draw(); renderTable(); updateFreshness();
}

async function loadLive({refresh=false}={}) {
  if(state.fetching)return;
  state.fetching=true;
  const opts=optionsFromForm();
  const source=$('#sourceMode').value;
  setStatus(refresh?'Refreshing source…':source==='stac'?'Querying Earth Search Sentinel-1 COGs…':'Querying ASF DAAC…');
  previewRequest();
  try {
    if(source==='stac'){
      const result=await fetchSentinel1Cog({
        start:opts.start,end:opts.end,intersectsWith:opts.intersectsWith,maxResults:opts.maxResults,
        flightDirection:opts.flightDirection,polarization:opts.polarization
      });
      const records=refresh?dedupeAndSort([...state.records,...result.records]):result.records;
      setRecords(records,[],{query:result.requestBody,url:result.source.endpoint,warnings:[]},{preserveCurrent:refresh});
      setStatus(`${state.records.length} Sentinel-1 COG acquisitions loaded · ${state.metrics.pixelReady} with actual raster assets · ${result.pageCount} STAC page(s)`,'ok');
    } else {
      const result=await fetchAsf(opts);
      const normalized=normalizeFeatureCollection(result.featureCollection,result.source);
      const records=refresh?dedupeAndSort([...state.records,...normalized.records]):normalized.records;
      setRecords(records,normalized.errors,{query:result.source.query,url:result.url,warnings:knownMissionWarnings(opts)},{preserveCurrent:refresh});
      setStatus(`${state.records.length} authoritative ASF acquisitions loaded${normalized.errors.length?` · ${normalized.errors.length} rejected`:''}`,'ok');
    }
  } catch(error) {
    setStatus(error.message,'error');
  } finally {state.fetching=false}
}

async function importFile(file) {
  stop();
  const text=await file.text();
  const json=JSON.parse(text);
  const normalized=normalizeFeatureCollection(json,{authority:'IMPORTED',importedFile:file.name,fetchedAt:new Date().toISOString()});
  state.sourceMode='import';
  $('#sourceBadge').textContent='IMPORT';
  setRecords(normalized.records,normalized.errors,{query:{importedFile:file.name}});
  setStatus(`${state.records.length} acquisitions imported from ${file.name}${normalized.errors.length?` · ${normalized.errors.length} rejected`:''}`,'ok');
}

function drawMap(){
  renderer.clear();
  const f=currentState();
  renderer.drawRecords(f.visible,f.current?.id,state.visual,renderer.motionPhase);
}

function draw() {
  const f=currentState();
  drawMap();
  $('#timeline').value=f.index;
  $('#frameIndex').textContent=state.records.length?`${f.index+1} / ${state.records.length}`:'0 / 0';
  $('#obsCount').textContent=f.count;
  $('#currentTime').textContent=f.current?.startTime || '—';
  $('#currentScene').textContent=f.current?.sceneName || '—';
  $('#grade').textContent=f.current?.evidence?.grade || '—';
  $('#gradeReason').textContent=f.current?.evidence?.reason || 'No acquisition selected';
  $('#orbit').textContent=f.current ? `${f.current.flightDirection||'—'} · abs ${f.current.absoluteOrbit??'—'} · rel ${f.current.relativeOrbit??'—'}` : '—';
  $('#platform').textContent=f.current ? `${f.current.platform}${f.current.processingLevel?` · ${f.current.processingLevel}`:''}${f.current.maturity?` · ${f.current.maturity}`:''}` : '—';
  $('#medianCadence').textContent=formatHours(state.metrics.cadence.median);
  $('#pixelReady').textContent=state.metrics.pixelReady;
  refreshAssetChoices(f.current);
  updateBrowse(f.current);
  if (renderer.point) updatePoint(renderer.point,false);
}

function renderWarnings() {
  const list=$('#warnings'); list.innerHTML='';
  const warnings=[...maturityWarnings(state.records), ...state.contextWarnings];
  if(state.metrics.anomalousGaps.length) warnings.push(`${state.metrics.anomalousGaps.length} chronology gap(s) exceed the robust cadence threshold; treat them as missing-observation intervals until explained.`);
  if (state.errors.length) warnings.push(`${state.errors.length} input feature(s) were rejected by normalization.`);
  if (!warnings.length) warnings.push('No maturity, authority, or chronology warning detected in the loaded metadata.');
  warnings.forEach(w=>{const li=document.createElement('li');li.textContent=w;list.append(li)});
}

function renderDiagnostics(){
  $('#spanMetric').textContent=formatHours(state.metrics.spanHours);
  $('#meanCadence').textContent=formatHours(state.metrics.cadence.mean);
  $('#maxGap').textContent=formatHours(state.metrics.cadence.max);
  $('#anomalyCount').textContent=state.metrics.anomalousGaps.length;
  $('#gradeMix').textContent=`A${state.metrics.grades.A} · B${state.metrics.grades.B} · C${state.metrics.grades.C}`;
  $('#gapList').textContent=state.metrics.anomalousGaps.slice(0,5).map(g=>`${formatHours(g.hours)} · ${g.from} → ${g.to}`).join('  |  ') || 'No robust cadence outlier identified.';
}

function renderTable() {
  const body=$('#rows'); body.innerHTML='';
  const f=currentState();
  const start=Math.max(0,f.index-12), end=Math.min(state.records.length,f.index+13);
  for (let i=start;i<end;i++) {
    const r=state.records[i]; const tr=document.createElement('tr');
    if(i===f.index) tr.className='current';
    const pixel=Object.keys(r.dataAssets||{}).length?'YES':'—';
    [i+1,r.startTime,r.platform,r.processingLevel||'—',r.flightDirection||'—',r.relativeOrbit??'—',r.evidence?.grade||'—',pixel,r.sceneName].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});
    tr.onclick=()=>{stop();state.frame=i;draw();renderTable()}; body.append(tr);
  }
}

function refreshAssetChoices(record){
  const select=$('#assetSelect');
  const previous=select.value;
  const assets=dataAssetChoices(record);
  select.innerHTML='';
  for(const a of assets){const o=document.createElement('option');o.value=a.key;o.textContent=a.title||a.key.toUpperCase();select.append(o)}
  if(assets.some(a=>a.key===previous))select.value=previous;
  $('#loadRaster').disabled=!assets.length;
  $('#probeStack').disabled=!renderer.point || !state.metrics.pixelReady;
}

function updateBrowse(record){
  const img=$('#browseImage'), empty=$('#browseEmpty');
  if(record?.browse){
    img.src=record.browse;img.style.display='block';empty.style.display='none';
    $('#browseCaption').textContent=`${record.sceneName} · source browse/thumbnail only · not promoted to calibrated raster evidence.`;
  }else{img.removeAttribute('src');img.style.display='none';empty.style.display='grid';$('#browseCaption').textContent='No source browse image is attached to this acquisition.'}
}

async function loadCurrentRaster(){
  const r=currentRecord();const key=$('#assetSelect').value;const asset=r?.dataAssets?.[key];
  if(!asset)return;
  $('#rasterEmpty').textContent='Reading Cloud Optimized GeoTIFF ranges…';$('#rasterEmpty').style.display='grid';
  try{
    const meta=await renderCog(asset.href,$('#raster'));
    $('#rasterEmpty').style.display='none';
    $('#raster').classList.remove('flash');void $('#raster').offsetWidth;$('#raster').classList.add('flash');
    const s=meta.stats;
    $('#rasterStats').textContent=`ACTUAL GRD · ${asset.key.toUpperCase()} · source ${meta.sourceWidth}×${meta.sourceHeight} · display ${meta.renderedWidth}×${meta.renderedHeight} · sampled valid ${s.sampledCount.toLocaleString()} · p02 ${fmtNum(s.p02)} · median ${fmtNum(s.p50)} · p98 ${fmtNum(s.p98)} · mean ${fmtNum(s.mean)} · display stretch only, no radiometric calibration claim.`;
  }catch(error){$('#rasterEmpty').style.display='grid';$('#rasterEmpty').textContent=`Raster unavailable: ${error.message}`;$('#rasterStats').textContent='No raster evidence loaded.'}
}

function fmtNum(v){return Number.isFinite(v)?(Math.abs(v)>=1000?v.toFixed(0):v.toFixed(3)):'—'}

function updatePoint(point, redraw=true) {
  const stats=revisitStats(state.records,point.lon,point.lat,state.frame);
  $('#point').textContent=`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`;
  $('#pointHits').textContent=stats.hitCount;
  $('#pointFirst').textContent=stats.first||'—';
  $('#pointLast').textContent=stats.last||'—';
  $('#pointMean').textContent=stats.meanHours===null?'—':formatHours(stats.meanHours);
  $('#probeStack').disabled=!state.metrics.pixelReady;
  if(redraw) drawMap();
}

async function runPixelProbe(){
  if(!renderer.point)return;
  const key=$('#assetSelect').value;
  $('#probeStack').disabled=true;$('#pixelProbeStatus').textContent='Probing COG pixels…';
  try{
    state.probeResults=await probeCogStack(state.records.slice(0,state.frame+1),renderer.point.lon,renderer.point.lat,key,{maxScenes:96,onProgress:(a,b)=>{$('#pixelProbeStatus').textContent=`Probing actual pixels ${a}/${b}…`}});
    const valid=state.probeResults.filter(x=>Number.isFinite(x.value));
    $('#pixelProbeStatus').textContent=`${valid.length} actual pixel samples resolved from ${state.probeResults.length} candidate COG scenes · raw GRD values, no cross-scene radiometric calibration claim.`;
    drawProbeChart(state.probeResults);
  }catch(error){$('#pixelProbeStatus').textContent=error.message}finally{$('#probeStack').disabled=!state.metrics.pixelReady}
}

function drawProbeChart(results){
  const canvas=$('#probeChart');const rect=canvas.getBoundingClientRect();const dpr=Math.max(1,devicePixelRatio||1);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);const w=rect.width,h=rect.height;c.clearRect(0,0,w,h);c.fillStyle='#061017';c.fillRect(0,0,w,h);
  const valid=results.filter(r=>Number.isFinite(r.value));if(valid.length<1){c.fillStyle='#79939f';c.font='11px ui-monospace,monospace';c.fillText('No actual COG samples at this point.',12,22);return}
  const times=valid.map(r=>new Date(r.startTime).getTime()), vals=valid.map(r=>r.value);const minT=Math.min(...times),maxT=Math.max(...times),minV=Math.min(...vals),maxV=Math.max(...vals);const pad=26;const x=t=>pad+(w-2*pad)*(maxT===minT?.5:(t-minT)/(maxT-minT));const y=v=>h-pad-(h-2*pad)*(maxV===minV?.5:(v-minV)/(maxV-minV));
  c.strokeStyle='rgba(140,180,194,.22)';c.lineWidth=1;c.strokeRect(pad,pad,w-2*pad,h-2*pad);c.beginPath();valid.forEach((r,i)=>{const px=x(times[i]),py=y(vals[i]);if(i)c.lineTo(px,py);else c.moveTo(px,py)});c.strokeStyle='rgba(132,235,244,.82)';c.lineWidth=1.5;c.stroke();
  for(let i=0;i<valid.length;i++){c.beginPath();c.arc(x(times[i]),y(vals[i]),2.6,0,Math.PI*2);c.fillStyle='rgba(245,252,255,.92)';c.fill()}
  c.fillStyle='#7795a1';c.font='9px ui-monospace,monospace';c.fillText(`min ${fmtNum(minV)}`,4,h-pad+3);c.fillText(`max ${fmtNum(maxV)}`,4,pad+3);c.fillText(new Date(minT).toISOString().slice(0,10),pad,h-7);const right=new Date(maxT).toISOString().slice(0,10);c.fillText(right,w-pad-c.measureText(right).width,h-7);
}

function play() {
  if (!state.records.length || state.playing) return;
  state.playing=true; $('#play').textContent='Pause';
  if($('#playbackMode').value==='temporal') startTemporalPlayback(); else startEventPlayback();
}
function startEventPlayback(){
  const tick=()=>{if(!state.playing)return;if(state.frame>=state.records.length-1)state.frame=0;else state.frame++;draw();renderTable();state.playTimer=setTimeout(tick,Math.max(50,1100-Number($('#speed').value)))};tick();
}
function startTemporalPlayback(){
  state.virtualTime=new Date(currentRecord()?.startTime||state.records[0].startTime).getTime();state.previousWall=performance.now();
  const tick=now=>{if(!state.playing)return;const dt=now-state.previousWall;state.previousWall=now;state.virtualTime+=dt*Number($('#timeWarp').value);const last=new Date(state.records.at(-1).startTime).getTime();if(state.virtualTime>last)state.virtualTime=new Date(state.records[0].startTime).getTime();const i=temporalPosition(state.records,state.virtualTime);if(i>=0&&i!==state.frame){state.frame=i;draw();renderTable()}state.temporalRaf=requestAnimationFrame(tick)};state.temporalRaf=requestAnimationFrame(tick);
}
function stop(){state.playing=false;clearTimeout(state.playTimer);cancelAnimationFrame(state.temporalRaf);$('#play').textContent='Play'}

function previewRequest(){
  const opts=optionsFromForm();
  if($('#sourceMode').value==='stac') $('#queryPreview').textContent=JSON.stringify({endpoint:'https://earth-search.aws.element84.com/v1/search',method:'POST',body:buildStacBody({start:opts.start,end:opts.end,intersectsWith:opts.intersectsWith,limit:opts.maxResults})},null,2);
  else $('#queryPreview').textContent=buildAsfQuery(opts);
}

function updateFreshness(){
  const latest=state.records.at(-1)?.startTime;$('#freshness').textContent=latest?freshnessLabel(latest):'—';
}
function updateClock(){
  $('#wallClock').textContent=new Date().toISOString().replace('T',' ').replace('Z',' UTC');updateFreshness();
}

function configureLiveRefresh(){
  clearInterval(state.liveTimer);state.liveTimer=null;
  if($('#liveRefresh').checked){state.liveTimer=setInterval(()=>loadLive({refresh:true}),Number($('#refreshInterval').value));$('#liveTag').textContent='POLLING'}else $('#liveTag').textContent='LIVE READY';
}

$('#load').onclick=()=>loadLive();
$('#file').onchange=e=>e.target.files[0]&&importFile(e.target.files[0]).catch(err=>setStatus(err.message,'error'));
$('#play').onclick=()=>state.playing?stop():play();
$('#prev').onclick=()=>{stop();state.frame=Math.max(0,state.frame-1);draw();renderTable()};
$('#next').onclick=()=>{stop();state.frame=Math.min(Math.max(0,state.records.length-1),state.frame+1);draw();renderTable()};
$('#timeline').oninput=e=>{stop();state.frame=Number(e.target.value);draw();renderTable()};
$('#mode').onchange=e=>{state.mode=e.target.value;draw()};
$('#visual').onchange=e=>{state.visual=e.target.value;drawMap()};
$('#playbackMode').onchange=()=>{if(state.playing){stop();play()}};
$('#sourceMode').onchange=configureSourceMode;
$('#preview').onclick=previewRequest;
$('#loadRaster').onclick=loadCurrentRaster;
$('#probeStack').onclick=runPixelProbe;
$('#liveRefresh').onchange=configureLiveRefresh;
$('#refreshInterval').onchange=configureLiveRefresh;
$('#export').onclick=async()=>{
  if(!state.records.length)return;
  const manifest=await buildManifest(state.records,{query:state.query,sourceUrl:state.sourceUrl,chronology:state.metrics,pixelProbe:state.probeResults,selectedPoint:renderer.point});
  downloadJson(`sar-accumulation-${new Date().toISOString().slice(0,10)}.manifest.json`,manifest);
};

setInterval(updateClock,1000);updateClock();configureSourceMode();renderWarnings();renderDiagnostics();draw();drawProbeChart([]);

let previousMotion=performance.now();
function motionLoop(now){const dt=Math.min(100,now-previousMotion);previousMotion=now;renderer.motionPhase=(renderer.motionPhase+dt/1800)%1;drawMap();requestAnimationFrame(motionLoop)}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(motionLoop);
