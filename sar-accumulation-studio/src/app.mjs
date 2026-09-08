import { fetchAsf, buildAsfQuery } from './asf.mjs';
import { normalizeFeatureCollection } from './normalize.mjs';
import { dedupeAndSort, frameState, maturityWarnings, revisitStats, knownMissionWarnings } from './engine.mjs';
import { buildManifest, downloadJson } from './export.mjs';
import { WorldRenderer } from './render.mjs';

const $ = s => document.querySelector(s);
const state = { records: [], frame: 0, playing: false, timer: null, query: null, sourceUrl: null, errors: [], contextWarnings: [], mode:'accumulate', visual:'footprints' };
const renderer = new WorldRenderer($('#map'));
renderer.redraw = draw;
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
function setRecords(records, errors=[], context={}) {
  state.records = dedupeAndSort(records);
  state.errors = errors;
  state.frame = Math.max(0,state.records.length-1);
  $('#timeline').max = Math.max(0,state.records.length-1);
  $('#timeline').value = state.frame;
  state.query = context.query || null;
  state.sourceUrl = context.url || null;
  state.contextWarnings = context.warnings || [];
  renderWarnings(); draw(); renderTable();
}

async function loadLive() {
  stop();
  const opts=optionsFromForm();
  setStatus('Querying ASF DAAC…');
  $('#queryPreview').textContent=buildAsfQuery(opts);
  try {
    const result=await fetchAsf(opts);
    const normalized=normalizeFeatureCollection(result.featureCollection,result.source);
    setRecords(normalized.records,normalized.errors,{query:result.source.query,url:result.url,warnings:knownMissionWarnings(opts)});
    setStatus(`${state.records.length} authoritative acquisitions loaded${normalized.errors.length?` · ${normalized.errors.length} rejected`:''}`,'ok');
  } catch(error) {
    setStatus(error.message,'error');
  }
}

async function importFile(file) {
  stop();
  const text=await file.text();
  const json=JSON.parse(text);
  const normalized=normalizeFeatureCollection(json,{authority:'IMPORTED',importedFile:file.name,fetchedAt:new Date().toISOString()});
  setRecords(normalized.records,normalized.errors,{query:{importedFile:file.name}});
  setStatus(`${state.records.length} acquisitions imported from ${file.name}${normalized.errors.length?` · ${normalized.errors.length} rejected`:''}`,'ok');
}

function currentState() { return frameState(state.records,state.frame,state.mode); }
function draw() {
  renderer.clear();
  const f=currentState();
  renderer.drawRecords(f.visible,f.current?.id,state.visual);
  $('#timeline').value=f.index;
  $('#frameIndex').textContent=state.records.length?`${f.index+1} / ${state.records.length}`:'0 / 0';
  $('#obsCount').textContent=f.count;
  $('#currentTime').textContent=f.current?.startTime || '—';
  $('#currentScene').textContent=f.current?.sceneName || '—';
  $('#grade').textContent=f.current?.evidence?.grade || '—';
  $('#gradeReason').textContent=f.current?.evidence?.reason || 'No acquisition selected';
  $('#orbit').textContent=f.current ? `${f.current.flightDirection||'—'} · abs ${f.current.absoluteOrbit??'—'} · rel ${f.current.relativeOrbit??'—'}` : '—';
  $('#platform').textContent=f.current ? `${f.current.platform}${f.current.processingLevel?` · ${f.current.processingLevel}`:''}${f.current.maturity?` · ${f.current.maturity}`:''}` : '—';
  if (renderer.point) updatePoint(renderer.point,false);
}

function renderWarnings() {
  const list=$('#warnings'); list.innerHTML='';
  const warnings=[...maturityWarnings(state.records), ...state.contextWarnings];
  if (state.errors.length) warnings.push(`${state.errors.length} input feature(s) were rejected by normalization.`);
  if (!warnings.length) warnings.push('No maturity/authority warning detected in the loaded metadata.');
  warnings.forEach(w=>{const li=document.createElement('li');li.textContent=w;list.append(li)});
}

function renderTable() {
  const body=$('#rows'); body.innerHTML='';
  const f=currentState();
  const start=Math.max(0,f.index-6), end=Math.min(state.records.length,f.index+7);
  for (let i=start;i<end;i++) {
    const r=state.records[i]; const tr=document.createElement('tr');
    if(i===f.index) tr.className='current';
    [i+1,r.startTime,r.platform,r.processingLevel||'—',r.flightDirection||'—',r.relativeOrbit??'—',r.evidence.grade,r.sceneName].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});
    tr.onclick=()=>{state.frame=i;draw();renderTable()}; body.append(tr);
  }
}

function updatePoint(point, redraw=true) {
  const stats=revisitStats(state.records,point.lon,point.lat,state.frame);
  $('#point').textContent=`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`;
  $('#pointHits').textContent=stats.hitCount;
  $('#pointFirst').textContent=stats.first||'—';
  $('#pointLast').textContent=stats.last||'—';
  $('#pointMean').textContent=stats.meanHours===null?'—':`${stats.meanHours.toFixed(2)} h`;
  if(redraw) draw();
}

function play() {
  if (!state.records.length || state.playing) return;
  state.playing=true; $('#play').textContent='Pause';
  const tick=()=>{
    if(!state.playing)return;
    if(state.frame>=state.records.length-1) state.frame=0; else state.frame++;
    draw(); renderTable();
    state.timer=setTimeout(tick,Math.max(50,1100-Number($('#speed').value)));
  }; tick();
}
function stop(){state.playing=false;clearTimeout(state.timer);$('#play').textContent='Play'}

$('#load').onclick=loadLive;
$('#file').onchange=e=>e.target.files[0]&&importFile(e.target.files[0]).catch(err=>setStatus(err.message,'error'));
$('#play').onclick=()=>state.playing?stop():play();
$('#prev').onclick=()=>{stop();state.frame=Math.max(0,state.frame-1);draw();renderTable()};
$('#next').onclick=()=>{stop();state.frame=Math.min(Math.max(0,state.records.length-1),state.frame+1);draw();renderTable()};
$('#timeline').oninput=e=>{stop();state.frame=Number(e.target.value);draw();renderTable()};
$('#mode').onchange=e=>{state.mode=e.target.value;draw()};
$('#visual').onchange=e=>{state.visual=e.target.value;draw()};
$('#preview').onclick=()=>{$('#queryPreview').textContent=buildAsfQuery(optionsFromForm())};
$('#export').onclick=async()=>{
  if(!state.records.length)return;
  const manifest=await buildManifest(state.records,{query:state.query,sourceUrl:state.sourceUrl});
  downloadJson(`sar-accumulation-${new Date().toISOString().slice(0,10)}.manifest.json`,manifest);
};

$('#queryPreview').textContent=buildAsfQuery(optionsFromForm());
renderWarnings(); draw();
