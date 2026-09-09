import { WorldRenderer } from './render.mjs';
import { loadEarthGrid } from './earth-grid.mjs';
import { anchorsFromCalibratedPatch, anchorsFromCalibratedStack } from './omega-field-core.mjs';
import { buildFullOmegaField, FULL_OMEGA_MODE_STACK } from './omega-mode-stack.mjs';

const $=s=>document.querySelector(s);
const runtime={
  grid:null,field:null,previous:null,patch:null,patchAnchors:[],view:{bbox:[-180,-90,180,90],scale:1},timer:null,generation:0,enabled:true,lastKey:null
};

globalThis.OMEGA_SAR_FIELD_RUNTIME=runtime;

function fieldCellStyle(cell){
  const t=Number.isFinite(cell?.displayValue)?Math.max(0,Math.min(1,cell.displayValue)):.5;
  const byte=Math.round(12+236*Math.pow(t,.9));
  const state=String(cell?.state||'');
  let alpha=state==='CONTEXT_PRIOR'?.15:state.includes('HIGH')?.62:state.includes('MEASURED')?.74:state.includes('RECONSTRUCTED')?.48:state.includes('RECOVERED')?.32:.1;
  alpha*=.5+.5*Math.max(0,Math.min(1,Number(cell?.confidence)||0));
  return {byte,alpha};
}

function drawOmegaField(renderer,field){
  if(!runtime.enabled||!field?.cells?.length)return false;
  const c=renderer.ctx;
  c.save();
  c.globalCompositeOperation='source-over';
  const lonStep=(field.bbox[2]-field.bbox[0])/field.cols;
  const latStep=(field.bbox[3]-field.bbox[1])/field.rows;
  const pw=Math.max(1.15,Math.abs(lonStep*(renderer.w/360)*renderer.view.scale)+1.25);
  const ph=Math.max(1.15,Math.abs(latStep*(renderer.h/180)*renderer.view.scale)+1.25);
  for(const cell of field.cells){
    if(!Number.isFinite(cell.displayValue))continue;
    const [x,y]=renderer.project(cell.lon,cell.lat);
    if(x<-pw||x>renderer.w+pw||y<-ph||y>renderer.h+ph)continue;
    const {byte,alpha}=fieldCellStyle(cell);
    c.fillStyle=`rgba(${byte},${byte},${Math.min(255,byte+3)},${alpha})`;
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
  const s=field.summary||{},anchors=field.anchors?.count||0;
  const calibrated=field.contextFit?.state==='CONTEXT_SAR_FIT_READY';
  const mode=calibrated?'CALIBRATED Ω RECONSTRUCTION':'GLOBAL Ω STRUCTURAL PRIOR';
  const admitted=Math.round((s.admittedFraction||0)*100),prior=Math.round((s.priorFraction||0)*100);
  hud.innerHTML=`<div class="omega-title"><span>Ω CONTINUOUS SAR</span><b>${mode}</b></div><div><span>COHERENCE</span><b>${Math.round((s.meanConfidence||0)*100)}%</b></div><div><span>MEASURED</span><b>${anchors} anchors</b></div><div><span>ADMITTED</span><b>${admitted}%</b></div><div><span>PRIOR</span><b>${prior}%</b></div><small>${reason||'Evidence → geometry → relativity → continuity → Full Sphere → forecast → prune → admission → coherence'}</small>`;
  hud.dataset.calibrated=calibrated?'true':'false';
}

function updateCellInspector(point){
  const el=$('#omegaCellInspector'),field=runtime.field;if(!el||!field||!point)return;
  let best=null,bestD=Infinity;
  for(const cell of field.cells){const dx=(cell.lon-point.lon)*Math.cos(point.lat*Math.PI/180),dy=cell.lat-point.lat,d=dx*dx+dy*dy;if(d<bestD){bestD=d;best=cell;}}
  if(!best)return;
  const value=Number.isFinite(best.value)?`${best.value.toFixed(2)} dB`:'relative structural prior';
  const gamma=best.gammaAdmission||'UNRESOLVED';
  el.innerHTML=`<b>${best.state.replaceAll('_',' ')}</b><span>${value}</span><small>${Math.round((best.confidence||0)*100)}% confidence · ${gamma.replaceAll('_',' ')} · guidance ${Math.round((best.guidanceNeed||0)*100)}%</small>`;
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
    const field=buildFullOmegaField({bbox:runtime.view.bbox,cols,rows,time:currentTime(),anchors,grid:runtime.grid,previousField:previous});
    if(my!==runtime.generation)return;
    runtime.previous=field;runtime.field=field;runtime.lastKey=key;
    globalThis.OMEGA_SAR_CONTINUOUS_FIELD=field;
    globalThis.OMEGA_SAR_SKINS=FULL_OMEGA_MODE_STACK;
    updateHud(field,reason);forceRedraw();
    const p=selectedPoint();if(p)updateCellInspector(p);
  }catch(error){
    if(hud)hud.innerHTML=`<div class="omega-title"><span>Ω CONTINUOUS SAR</span><b>FIELD UNRESOLVED</b></div><small>${error.message}</small>`;
  }finally{if(hud)hud.classList.remove('busy');}
}

function schedule(reason,delay=180){
  clearTimeout(runtime.timer);runtime.timer=setTimeout(()=>rebuild(reason),delay);
}

function installStyles(){
  if($('#omegaFieldStyle'))return;
  const style=document.createElement('style');style.id='omegaFieldStyle';style.textContent=`
  .omega-field-hud{position:absolute;z-index:5;right:14px;top:14px;display:grid;grid-template-columns:minmax(180px,1.8fr) repeat(4,minmax(72px,.7fr));gap:8px;max-width:min(760px,72%);padding:10px 12px;border-radius:12px;background:linear-gradient(180deg,rgba(8,11,13,.84),rgba(6,8,10,.72));backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.16);box-shadow:0 14px 40px rgba(0,0,0,.34);pointer-events:none;color:#f2f3f4;font-family:Inter,Segoe UI,sans-serif}
  .omega-field-hud>div{min-width:0}.omega-field-hud span{display:block;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#a8adb1}.omega-field-hud b{display:block;margin-top:3px;font-size:11px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-field-hud .omega-title b{font-size:12px}.omega-field-hud small{grid-column:1/-1;color:#a9afb3;font-size:9px;line-height:1.35}.omega-field-hud[data-calibrated=true]{border-color:rgba(224,228,232,.34)}.omega-field-hud.busy{opacity:.66}
  .omega-cell-inspector{position:absolute;z-index:5;right:14px;bottom:14px;display:flex;flex-direction:column;gap:3px;max-width:390px;padding:10px 12px;border-radius:10px;background:rgba(7,9,11,.78);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.14);pointer-events:none;color:#f3f4f5;font-family:Inter,Segoe UI,sans-serif}.omega-cell-inspector b{font-size:11px}.omega-cell-inspector span{font-size:11px;color:#d2d5d8}.omega-cell-inspector small{font-size:9px;color:#9ea4a9}
  .omega-continuous-toggle{margin-top:10px!important;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)}
  .map-corners{display:none!important}.map-note{background:rgba(6,8,10,.7)!important;border-color:rgba(255,255,255,.12)!important;color:#c7cbcf!important;font-family:Inter,Segoe UI,sans-serif!important;font-size:9px!important}.map-hud{opacity:.72}.map-wrap{background:#060708!important;border-color:rgba(255,255,255,.14)!important;box-shadow:0 24px 80px rgba(0,0,0,.38)!important}
  @media(max-width:980px){.omega-field-hud{left:12px;right:12px;max-width:none;grid-template-columns:repeat(2,minmax(0,1fr));top:12px}.omega-field-hud .omega-title{grid-column:1/-1}.omega-cell-inspector{left:12px;right:12px;max-width:none}.map-hud{display:none}}
  `;document.head.append(style);
}

function installUi(){
  installStyles();
  const wrap=$('.map-wrap');
  if(wrap&&!$('#omegaFieldHud')){
    const hud=document.createElement('div');hud.id='omegaFieldHud';hud.className='omega-field-hud';
    hud.innerHTML='<div class="omega-title"><span>Ω CONTINUOUS SAR</span><b>INITIALIZING FIELD</b></div><small>Loading correlated Earth skins…</small>';
    wrap.append(hud);
    const inspect=document.createElement('div');inspect.id='omegaCellInspector';inspect.className='omega-cell-inspector';inspect.innerHTML='<b>WORLD FIELD</b><span>Click Earth to inspect reconstructed state</span>';wrap.append(inspect);
  }
  const earthCard=[...document.querySelectorAll('.control-card')].find(x=>x.textContent.includes('EARTH SURFACE'));
  if(earthCard&&!$('#omegaContinuousEnabled')){
    const label=document.createElement('label');label.className='inline-check omega-continuous-toggle';
    label.innerHTML='<input id="omegaContinuousEnabled" type="checkbox" checked> Ω continuous correlated SAR field';earthCard.append(label);
    $('#omegaContinuousEnabled').addEventListener('change',e=>{runtime.enabled=e.target.checked;if(!runtime.enabled){globalThis.OMEGA_SAR_CONTINUOUS_FIELD=null;forceRedraw();}else schedule('reconstruction enabled',0);});
  }
  const banner=$('.mission-banner b');if(banner)banner.textContent='CONTINUOUS EARTH STATE · MEASURED SAR + CORRELATED SKINS + ATLAS CONTINUITY + FORECAST';
  const chain=$('.truth-chain');if(chain)chain.textContent='EVIDENCE → GEOMETRY → RELATIVITY → CONTINUITY → FULL SPHERE → FORECAST → ADMISSION → COHERENCE';
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
  globalThis.OMEGA_SAR_SKINS=FULL_OMEGA_MODE_STACK;
  schedule('full correlated-skin initialization',0);
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeOmegaContinuousField,{once:true});
  else queueMicrotask(initializeOmegaContinuousField);
}
