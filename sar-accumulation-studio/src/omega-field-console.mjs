import { WorldRenderer } from './render.mjs';
import { loadEarthGrid } from './earth-grid.mjs';
import { buildOmegaContinuousField, anchorsFromCalibratedPatch, anchorsFromCalibratedStack, OMEGA_SKINS } from './omega-field-core.mjs';

const $=s=>document.querySelector(s);
const runtime={
  grid:null,field:null,previous:null,patch:null,patchAnchors:[],view:{bbox:[-180,-90,180,90],scale:1},timer:null,generation:0,enabled:true,lastKey:null
};

globalThis.OMEGA_SAR_FIELD_RUNTIME=runtime;

function fieldCellStyle(cell){
  const t=Number.isFinite(cell?.displayValue)?Math.max(0,Math.min(1,cell.displayValue)):.5;
  const byte=Math.round(18+225*Math.pow(t,.92));
  const state=String(cell?.state||'');
  let alpha=state==='CONTEXT_PRIOR'?.17:state.includes('HIGH')?.58:state.includes('MEASURED')?.68:state.includes('RECONSTRUCTED')?.44:.12;
  alpha*=.55+.45*Math.max(0,Math.min(1,Number(cell?.confidence)||0));
  return {byte,alpha};
}

function drawOmegaField(renderer,field){
  if(!runtime.enabled||!field?.cells?.length)return false;
  const c=renderer.ctx;
  c.save();
  c.globalCompositeOperation='source-over';
  const lonStep=(field.bbox[2]-field.bbox[0])/field.cols;
  const latStep=(field.bbox[3]-field.bbox[1])/field.rows;
  const pw=Math.max(1.15,Math.abs(lonStep*(renderer.w/360)*renderer.view.scale)+1.2);
  const ph=Math.max(1.15,Math.abs(latStep*(renderer.h/180)*renderer.view.scale)+1.2);
  for(const cell of field.cells){
    if(!Number.isFinite(cell.displayValue))continue;
    const [x,y]=renderer.project(cell.lon,cell.lat);
    if(x<-pw||x>renderer.w+pw||y<-ph||y>renderer.h+ph)continue;
    const {byte,alpha}=fieldCellStyle(cell);
    c.fillStyle=`rgba(${byte},${byte},${Math.min(255,byte+4)},${alpha})`;
    c.fillRect(x-pw/2,y-ph/2,pw,ph);
  }
  c.restore();
  return true;
}

if(!WorldRenderer.prototype.__omegaContinuousFieldPatched){
  WorldRenderer.prototype.__omegaContinuousFieldPatched=true;
  const original=WorldRenderer.prototype._drawSarOverlay;
  WorldRenderer.prototype._drawSarOverlay=function(){
    drawOmegaField(this,globalThis.OMEGA_SAR_CONTINUOUS_FIELD);
    return original.call(this);
  };
}

function forceRedraw(){
  const visual=$('#visual');
  if(visual)visual.dispatchEvent(new Event('change',{bubbles:true}));
}

function selectedPoint(){
  const text=$('#point')?.textContent||'';
  const m=text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if(!m)return null;
  const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;
}

function currentTime(){
  const text=($('#currentTime')?.textContent||'').trim();
  return text&&text!=='—'?text:new Date().toISOString();
}

function temporalAnchors(){
  const p=selectedPoint();
  return p?anchorsFromCalibratedStack(globalThis.OMEGA_SAR_CALIBRATED_STACK||[],p.lon,p.lat):[];
}

function allAnchors(){
  const map=new Map();
  for(const a of [...runtime.patchAnchors,...temporalAnchors()]){
    if(!Number.isFinite(a?.value))continue;
    map.set(`${a.id}|${a.lon.toFixed(6)}|${a.lat.toFixed(6)}|${a.time||''}`,a);
  }
  return [...map.values()];
}

function fieldResolution(){
  const scale=runtime.view.scale||1;
  if(scale<=1.4)return {cols:72,rows:36};
  if(scale<=4)return {cols:84,rows:48};
  if(scale<=10)return {cols:96,rows:60};
  return {cols:112,rows:72};
}

function bboxKey(bbox){return bbox.map(v=>Number(v).toFixed(4)).join(',');}

function updateHud(field,reason=''){
  const hud=$('#omegaFieldHud');if(!hud||!field)return;
  const s=field.summary||{},states=s.states||{},anchors=field.anchors?.count||0;
  const calibrated=field.contextFit?.state==='CONTEXT_SAR_FIT_READY';
  const mode=calibrated?'SAR-CALIBRATED RECONSTRUCTION':'WORLD STRUCTURAL PRIOR';
  const reconstructed=Object.entries(states).filter(([k])=>k.includes('RECONSTRUCTED')||k.includes('MEASURED')).reduce((n,[,v])=>n+v,0);
  const pct=field.cells.length?100*reconstructed/field.cells.length:0;
  hud.innerHTML=`<div><span>Ω CONTINUOUS SAR</span><b>${mode}</b></div><div><span>CONFIDENCE</span><b>${Math.round((s.meanConfidence||0)*100)}%</b></div><div><span>MEASURED ANCHORS</span><b>${anchors}</b></div><div><span>RECONSTRUCTED FIELD</span><b>${pct.toFixed(0)}%</b></div><small>${reason||'Evidence → geometry → relativity → continuity → Atlas → forecast → prune → admission → coherence'}</small>`;
  hud.dataset.calibrated=calibrated?'true':'false';
}

function updateCellInspector(point){
  const el=$('#omegaCellInspector'),field=runtime.field;if(!el||!field||!point)return;
  let best=null,bestD=Infinity;
  for(const cell of field.cells){const dx=(cell.lon-point.lon)*Math.cos(point.lat*Math.PI/180),dy=cell.lat-point.lat,d=dx*dx+dy*dy;if(d<bestD){bestD=d;best=cell;}}
  if(!best)return;
  const value=Number.isFinite(best.value)?`${best.value.toFixed(2)} dB`:'relative prior';
  el.innerHTML=`<b>${best.state.replaceAll('_',' ')}</b><span>${value} · confidence ${Math.round((best.confidence||0)*100)}% · guidance ${Math.round((best.skins?.GUIDANCE_FIELD||0)*100)}%</span>`;
}

async function rebuild(reason='state update'){
  if(!runtime.enabled)return;
  const my=++runtime.generation;
  const hud=$('#omegaFieldHud');if(hud)hud.classList.add('busy');
  try{
    runtime.grid ||= await loadEarthGrid();
    if(my!==runtime.generation)return;
    const anchors=allAnchors();
    const {cols,rows}=fieldResolution();
    const key=bboxKey(runtime.view.bbox);
    const previous=runtime.lastKey===key?runtime.previous:null;
    const field=buildOmegaContinuousField({bbox:runtime.view.bbox,cols,rows,time:currentTime(),anchors,grid:runtime.grid,previousField:previous});
    if(my!==runtime.generation)return;
    runtime.previous=field;runtime.field=field;runtime.lastKey=key;
    globalThis.OMEGA_SAR_CONTINUOUS_FIELD=field;
    updateHud(field,reason);forceRedraw();
  }catch(error){
    if(hud)hud.innerHTML=`<div><span>Ω CONTINUOUS SAR</span><b>FIELD UNRESOLVED</b></div><small>${error.message}</small>`;
  }finally{if(hud)hud.classList.remove('busy');}
}

function schedule(reason,delay=180){
  clearTimeout(runtime.timer);runtime.timer=setTimeout(()=>rebuild(reason),delay);
}

function installUi(){
  const wrap=$('.map-wrap');
  if(wrap&&!$('#omegaFieldHud')){
    const hud=document.createElement('div');hud.id='omegaFieldHud';hud.className='omega-field-hud';
    hud.innerHTML='<div><span>Ω CONTINUOUS SAR</span><b>INITIALIZING FIELD</b></div><small>Loading correlated Earth skin…</small>';
    wrap.append(hud);
    const inspect=document.createElement('div');inspect.id='omegaCellInspector';inspect.className='omega-cell-inspector';inspect.innerHTML='<b>WORLD FIELD</b><span>click Earth to inspect reconstructed state</span>';wrap.append(inspect);
  }
  const earthCard=[...document.querySelectorAll('.control-card')].find(x=>x.textContent.includes('EARTH SURFACE'));
  if(earthCard&&!$('#omegaContinuousEnabled')){
    const label=document.createElement('label');label.className='inline-check omega-continuous-toggle';
    label.innerHTML='<input id="omegaContinuousEnabled" type="checkbox" checked> Ω continuous SAR reconstruction';earthCard.append(label);
    $('#omegaContinuousEnabled').addEventListener('change',e=>{runtime.enabled=e.target.checked;if(!runtime.enabled){globalThis.OMEGA_SAR_CONTINUOUS_FIELD=null;forceRedraw();}else schedule('reconstruction enabled',0);});
  }
  const banner=$('.mission-banner b');if(banner)banner.textContent='CONTINUOUS EARTH STATE · MEASURED SAR + CORRELATED SKINS + ATLAS CONTINUITY + FORECAST';
}

function wire(){
  const map=$('#map');if(!map)return;
  map.addEventListener('omega-map-view',e=>{const d=e.detail||{};if(Array.isArray(d.bbox)){runtime.view={bbox:d.bbox,scale:Number(d.scale)||1};schedule('viewport relativity update',260);}});
  map.addEventListener('omega-map-select',e=>{updateCellInspector(e.detail);schedule('selected Earth frame',120);});
  window.addEventListener('omega-calibrated-sar-patch',e=>{
    runtime.patch=e.detail?.patch||null;
    runtime.patchAnchors=anchorsFromCalibratedPatch(runtime.patch,{stride:1});
    schedule('calibrated Sentinel-1 patch bound',20);
  });
  window.addEventListener('omega-calibrated-sar-patch-clear',()=>{runtime.patch=null;runtime.patchAnchors=[];schedule('measurement patch cleared',60);});
  const probe=$('#pixelProbeStatus');if(probe)new MutationObserver(()=>{if(/calibrated Sentinel-1/i.test(probe.textContent||''))schedule('calibrated temporal stack bound',60);}).observe(probe,{childList:true,subtree:true,characterData:true});
  const current=$('#currentTime');if(current)new MutationObserver(()=>schedule('temporal frame advanced',120)).observe(current,{childList:true,subtree:true,characterData:true});
}

export function initializeOmegaContinuousField(){
  if(typeof document==='undefined'||globalThis.__OMEGA_CONTINUOUS_INITIALIZED)return;
  globalThis.__OMEGA_CONTINUOUS_INITIALIZED=true;installUi();wire();
  globalThis.OMEGA_SAR_SKINS=OMEGA_SKINS;
  schedule('full correlated-skin initialization',0);
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeOmegaContinuousField,{once:true});
  else queueMicrotask(initializeOmegaContinuousField);
}
