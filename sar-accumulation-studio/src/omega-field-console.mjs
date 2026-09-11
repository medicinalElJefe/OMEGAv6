import { WorldRenderer } from './render.mjs';
import { loadEarthGrid } from './earth-grid.mjs';
import { anchorsFromCalibratedPatch } from './omega-field-core.mjs';
import { buildFullOmegaField, FULL_OMEGA_MODE_STACK } from './omega-mode-stack.mjs';
import { captureSatelliteContext } from './omega-satellite-skin.mjs';
import './omega-nisar-bridge.mjs';

const $=s=>document.querySelector(s);
const FIELD_MAX_SCHEDULE_WAIT_MS=1500;
const runtime={
  grid:null,field:null,previous:null,patch:null,patchAnchors:[],nisarAnchors:[],satelliteContext:null,activeChannel:null,
  view:{bbox:[-180,-90,180,90],scale:1},timer:null,deadlineTimer:null,pendingReason:null,generation:0,revision:0,building:false,queued:false,queuedReason:null,enabled:true,lastKey:null,lastCommitAt:null
};
const fieldCanvasCache=new WeakMap();

globalThis.OMEGA_SAR_FIELD_RUNTIME=runtime;

function normalizeQuantity(q){
  q=String(q||'').toLowerCase();
  if(q==='sigmanought'||q==='sigma0'||q==='sigma0_db')return 'sigma0_db';
  if(q==='gamma'||q==='gamma0'||q==='gamma0_db')return 'gamma0_db';
  if(q==='betanought'||q==='beta0'||q==='beta0_db')return 'beta0_db';
  return q||'unknown';
}
function normalizePolarization(p){return String(p||'').toUpperCase().replace(/[^A-Z]/g,'')||'UNKNOWN';}
function channelOf(quantity,polarization){return `${normalizeQuantity(quantity)}:${normalizePolarization(polarization)}`;}
function selectedChannel(){
  const quantity=$('#sarCalQuantity')?.value||runtime.patch?.quantity||'gamma';
  const polarization=$('#assetSelect')?.value||runtime.patch?.polarization||'vv';
  return channelOf(quantity,polarization);
}
function enrichPatchAnchors(patch){
  const quantity=normalizeQuantity(patch?.quantity),polarization=normalizePolarization(patch?.polarization),channel=channelOf(quantity,polarization);
  return anchorsFromCalibratedPatch(patch,{stride:1}).map(a=>({...a,quantity,polarization,channel,platform:'SENTINEL-1'}));
}
function temporalAnchors(){
  const p=selectedPoint();if(!p)return [];
  return (globalThis.OMEGA_SAR_CALIBRATED_STACK||[]).filter(s=>s?.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE'&&Number.isFinite(s.db)).map((s,i)=>{
    const quantity=normalizeQuantity(s.quantity),polarization=normalizePolarization(s.polarization),channel=channelOf(quantity,polarization);
    return {id:s.id||`S1-stack-${i}`,lon:p.lon,lat:p.lat,time:s.startTime,value:Number(s.db),measured:true,inferred:false,grade:s.evidence?.grade||'B',source:'CALIBRATED_SENTINEL1_TEMPORAL_STACK',platform:'SENTINEL-1',quantity,polarization,channel};
  });
}
function allAnchorBanks(){
  const map=new Map();
  for(const a of [...runtime.patchAnchors,...temporalAnchors(),...runtime.nisarAnchors]){
    if(!Number.isFinite(a?.value)||!Number.isFinite(a?.lon)||!Number.isFinite(a?.lat))continue;
    const channel=a.channel||channelOf(a.quantity,a.polarization);const item={...a,channel};
    map.set(`${item.id}|${item.lon.toFixed(6)}|${item.lat.toFixed(6)}|${item.time||''}|${channel}`,item);
  }
  return [...map.values()];
}
function allAnchors(){
  const bank=allAnchorBanks(),preferred=selectedChannel(),exact=bank.filter(a=>a.channel===preferred);
  if(exact.length){runtime.activeChannel=preferred;return exact;}
  const counts=new Map();for(const a of bank)counts.set(a.channel,(counts.get(a.channel)||0)+1);
  const dominant=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||preferred;
  runtime.activeChannel=dominant;return bank.filter(a=>a.channel===dominant);
}

function fieldCellStyle(cell){
  const t=Number.isFinite(cell?.displayValue)?Math.max(0,Math.min(1,cell.displayValue)):.5;
  const byte=Math.round(8+242*Math.pow(t,.9));
  const state=String(cell?.state||'');
  let alpha=state==='CONTEXT_PRIOR'?.12:state.includes('MEASURED')?.82:state.includes('HIGH')?.67:state.includes('SATELLITE')?.55:state.includes('RECONSTRUCTED')?.47:state.includes('RECOVERED')?.30:.08;
  alpha*=.48+.52*Math.max(0,Math.min(1,Number(cell?.confidence)||0));
  return {byte,alpha};
}

function fieldRaster(field){
  if(fieldCanvasCache.has(field))return fieldCanvasCache.get(field);
  const canvas=document.createElement('canvas');canvas.width=field.cols;canvas.height=field.rows;
  const ctx=canvas.getContext('2d'),image=ctx.createImageData(field.cols,field.rows);
  for(const cell of field.cells){
    if(!Number.isFinite(cell.displayValue))continue;
    const y=field.rows-1-cell.iy,x=cell.ix,j=(y*field.cols+x)*4,{byte,alpha}=fieldCellStyle(cell);
    image.data[j]=byte;image.data[j+1]=byte;image.data[j+2]=Math.min(255,byte+3);image.data[j+3]=Math.round(255*alpha);
  }
  ctx.putImageData(image,0,0);fieldCanvasCache.set(field,canvas);return canvas;
}

function drawOmegaField(renderer,field){
  if(!runtime.enabled||!field?.cells?.length)return false;
  const c=renderer.ctx,[minLon,minLat,maxLon,maxLat]=field.bbox;
  const [x0,y0]=renderer.project(minLon,maxLat),[x1,y1]=renderer.project(maxLon,minLat);
  const w=x1-x0,h=y1-y0;if(!Number.isFinite(w)||!Number.isFinite(h)||Math.abs(w)<2||Math.abs(h)<2)return false;
  c.save();c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(fieldRaster(field),x0,y0,w,h);c.restore();return true;
}

if(!WorldRenderer.prototype.__omegaContinuousFieldPatched){
  WorldRenderer.prototype.__omegaContinuousFieldPatched=true;
  const originalOverlay=WorldRenderer.prototype._drawSarOverlay;
  WorldRenderer.prototype._drawSarOverlay=function(){drawOmegaField(this,globalThis.OMEGA_SAR_CONTINUOUS_FIELD);return originalOverlay.call(this);};

  const originalSetBase=WorldRenderer.prototype.setBaseImage;
  WorldRenderer.prototype.setBaseImage=async function(url,meta=null){
    const result=await originalSetBase.call(this,url,meta);
    if(this.baseImage){try{runtime.satelliteContext=captureSatelliteContext(this.baseImage,this.baseMeta||meta||{});schedule('real-time satellite skin synchronized',40);}catch{runtime.satelliteContext=null;}}
    else{runtime.satelliteContext=null;schedule('satellite context cleared',40);}
    return result;
  };
}

function forceRedraw(){const visual=$('#visual');if(visual)visual.dispatchEvent(new Event('change',{bubbles:true}));}
function selectedPoint(){const text=$('#point')?.textContent||'',m=text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;}
function currentTime(){const text=($('#currentTime')?.textContent||'').trim();return text&&text!=='—'?text:new Date().toISOString();}
function fieldResolution(){const scale=runtime.view.scale||1;if(scale<=1.4)return {cols:96,rows:48};if(scale<=4)return {cols:112,rows:64};if(scale<=10)return {cols:128,rows:80};return {cols:160,rows:96};}
function bboxKey(bbox){return bbox.map(v=>Number(v).toFixed(4)).join(',');}

function updateHud(field,reason=''){
  const hud=$('#omegaFieldHud');if(!hud||!field)return;
  const s=field.summary||{},anchors=field.anchors?.count||0,atlasCal=field.contextFit?.state==='CONTEXT_SAR_FIT_READY',satCal=field.satelliteFit?.state==='SATELLITE_SAR_FIT_READY';
  const mode=satCal?'REAL-TIME SATELLITE + SAR Ω FIELD':atlasCal?'CALIBRATED Ω RECONSTRUCTION':'GLOBAL Ω STRUCTURAL PRIOR';
  const admitted=Math.round((s.admittedFraction||0)*100),sat=satCal?`${Math.round((field.satelliteFit.confidence||0)*100)}%`:'—',channel=(runtime.activeChannel||selectedChannel()).replace('_db','').toUpperCase();
  hud.innerHTML=`<div class="omega-title"><span>Ω CONTINUOUS SAR</span><b>${mode}</b></div><div><span>CHANNEL</span><b>${channel}</b></div><div><span>MEASURED</span><b>${anchors} anchors</b></div><div><span>SAT FUSION</span><b>${sat}</b></div><div><span>ADMITTED</span><b>${admitted}%</b></div><small>${reason||'Evidence → geometry → relativity → continuity → Full Sphere → satellite fusion → forecast → prune → admission → coherence'}</small>`;
  hud.dataset.calibrated=atlasCal||satCal?'true':'false';
}

function updateCellInspector(point){
  const el=$('#omegaCellInspector'),field=runtime.field;if(!el||!field||!point)return;
  let best=null,bestD=Infinity;for(const cell of field.cells){const dx=(cell.lon-point.lon)*Math.cos(point.lat*Math.PI/180),dy=cell.lat-point.lat,d=dx*dx+dy*dy;if(d<bestD){bestD=d;best=cell;}}
  if(!best)return;
  const value=Number.isFinite(best.value)?`${best.value.toFixed(2)} dB`:'relative structural prior',gamma=best.gammaAdmission||'UNRESOLVED',p=best.provenance||{},parts=[];
  if((p.directSar||0)>.01)parts.push(`SAR ${Math.round(100*p.directSar)}%`);if((p.realtimeSatellite||0)>.01)parts.push(`sat ${Math.round(100*p.realtimeSatellite)}%`);if((p.atlas||0)>.01)parts.push(`Atlas ${Math.round(100*p.atlas)}%`);if((p.forecast||0)>.01)parts.push(`forecast ${Math.round(100*p.forecast)}%`);
  el.innerHTML=`<b>${best.state.replaceAll('_',' ')}</b><span>${value}</span><small>${Math.round((best.confidence||0)*100)}% confidence · ${gamma.replaceAll('_',' ')} · ${parts.join(' · ')||'context prior'} · guidance ${Math.round((best.guidanceNeed||0)*100)}%</small>`;
}

async function rebuild(reason='state update'){
  if(!runtime.enabled)return;
  if(runtime.building){runtime.queued=true;runtime.queuedReason=reason;return;}
  runtime.building=true;runtime.generation++;
  clearTimeout(runtime.timer);runtime.timer=null;
  if(runtime.deadlineTimer){clearTimeout(runtime.deadlineTimer);runtime.deadlineTimer=null;}
  const hud=$('#omegaFieldHud');if(hud)hud.classList.add('busy');
  try{
    runtime.grid ||= await loadEarthGrid();
    const anchors=allAnchors(),{cols,rows}=fieldResolution(),key=bboxKey(runtime.view.bbox),previous=runtime.lastKey===key?runtime.previous:null;
    const field=buildFullOmegaField({bbox:runtime.view.bbox,cols,rows,time:currentTime(),anchors,grid:runtime.grid,previousField:previous,satelliteContext:runtime.satelliteContext});
    runtime.previous=field;runtime.field=field;runtime.lastKey=key;runtime.revision++;runtime.lastCommitAt=new Date().toISOString();globalThis.OMEGA_SAR_CONTINUOUS_FIELD=field;globalThis.OMEGA_SAR_SKINS=FULL_OMEGA_MODE_STACK;
    window.dispatchEvent(new CustomEvent('omega-continuous-field-update',{detail:{revision:runtime.revision,cellCount:field.cells?.length||0,reason,committedAt:runtime.lastCommitAt}}));
    updateHud(field,reason);forceRedraw();const p=selectedPoint();if(p)updateCellInspector(p);
  }catch(error){if(hud)hud.innerHTML=`<div class="omega-title"><span>Ω CONTINUOUS SAR</span><b>FIELD UNRESOLVED</b></div><small>${error.message}</small>`;}
  finally{
    runtime.building=false;if(hud)hud.classList.remove('busy');
    if(runtime.queued){const next=runtime.queuedReason||'queued state update';runtime.queued=false;runtime.queuedReason=null;schedule(next,40);}
  }
}
function schedule(reason,delay=180){
  runtime.pendingReason=reason;clearTimeout(runtime.timer);
  runtime.timer=setTimeout(()=>{runtime.timer=null;rebuild(runtime.pendingReason||reason);},Math.max(0,Number(delay)||0));
  if(!runtime.deadlineTimer)runtime.deadlineTimer=setTimeout(()=>{runtime.deadlineTimer=null;clearTimeout(runtime.timer);runtime.timer=null;rebuild(runtime.pendingReason||reason);},FIELD_MAX_SCHEDULE_WAIT_MS);
}
runtime.rebuild=rebuild;runtime.schedule=schedule;

function installStyles(){
  if($('#omegaFieldStyle'))return;const style=document.createElement('style');style.id='omegaFieldStyle';style.textContent=`
  .omega-field-hud{position:absolute;z-index:5;right:14px;top:14px;display:grid;grid-template-columns:minmax(230px,1.8fr) repeat(4,minmax(78px,.7fr));gap:9px;max-width:min(820px,76%);padding:11px 13px;border-radius:13px;background:linear-gradient(180deg,rgba(8,10,12,.86),rgba(5,7,9,.74));backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 48px rgba(0,0,0,.36);pointer-events:none;color:#f4f5f5;font-family:Inter,Segoe UI,sans-serif}
  .omega-field-hud>div{min-width:0}.omega-field-hud span{display:block;font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:#a8adb1}.omega-field-hud b{display:block;margin-top:3px;font-size:11px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-field-hud .omega-title b{font-size:12px}.omega-field-hud small{grid-column:1/-1;color:#a9afb3;font-size:9px;line-height:1.35}.omega-field-hud[data-calibrated=true]{border-color:rgba(231,234,236,.34)}.omega-field-hud.busy{opacity:.65}
  .omega-cell-inspector{position:absolute;z-index:5;right:14px;bottom:14px;display:flex;flex-direction:column;gap:3px;max-width:470px;padding:11px 13px;border-radius:11px;background:rgba(6,8,10,.8);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.14);pointer-events:none;color:#f3f4f5;font-family:Inter,Segoe UI,sans-serif}.omega-cell-inspector b{font-size:11px}.omega-cell-inspector span{font-size:11px;color:#d5d8da}.omega-cell-inspector small{font-size:9px;color:#a2a7ab;line-height:1.4}
  .omega-continuous-toggle{margin-top:10px!important;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)}
  .map-corners{display:none!important}.map-note{background:rgba(6,8,10,.68)!important;border-color:rgba(255,255,255,.11)!important;color:#c8cbce!important;font-family:Inter,Segoe UI,sans-serif!important;font-size:9px!important}.map-hud{opacity:.58}.map-wrap{background:#050607!important;border-color:rgba(255,255,255,.14)!important;box-shadow:0 28px 90px rgba(0,0,0,.40)!important}
  @media(max-width:980px){.omega-field-hud{left:12px;right:12px;max-width:none;grid-template-columns:repeat(2,minmax(0,1fr));top:12px}.omega-field-hud .omega-title{grid-column:1/-1}.omega-cell-inspector{left:12px;right:12px;max-width:none}.map-hud{display:none}}
  `;document.head.append(style);
}

function installUi(){
  installStyles();const wrap=$('.map-wrap');
  if(wrap&&!$('#omegaFieldHud')){const hud=document.createElement('div');hud.id='omegaFieldHud';hud.className='omega-field-hud';hud.innerHTML='<div class="omega-title"><span>Ω CONTINUOUS SAR</span><b>INITIALIZING FIELD</b></div><small>Loading correlated Earth skins…</small>';wrap.append(hud);const inspect=document.createElement('div');inspect.id='omegaCellInspector';inspect.className='omega-cell-inspector';inspect.innerHTML='<b>WORLD FIELD</b><span>Click Earth to inspect reconstructed state</span>';wrap.append(inspect);}
  const earthCard=[...document.querySelectorAll('.control-card')].find(x=>x.textContent.includes('EARTH SURFACE'));
  if(earthCard&&!$('#omegaContinuousEnabled')){const label=document.createElement('label');label.className='inline-check omega-continuous-toggle';label.innerHTML='<input id="omegaContinuousEnabled" type="checkbox" checked> Ω continuous correlated SAR field';earthCard.append(label);$('#omegaContinuousEnabled').addEventListener('change',e=>{runtime.enabled=e.target.checked;if(!runtime.enabled){globalThis.OMEGA_SAR_CONTINUOUS_FIELD=null;forceRedraw();}else schedule('reconstruction enabled',0);});}
  const banner=$('.mission-banner b');if(banner)banner.textContent='CONTINUOUS EARTH STATE · SENTINEL-1 + NISAR + REAL-TIME SATELLITE + CORRELATED OMEGA SKINS';const chain=$('.truth-chain');if(chain)chain.textContent='EVIDENCE → CHANNEL BINDING → GEOMETRY → RELATIVITY → CONTINUITY → FULL SPHERE → SATELLITE FUSION → FORECAST → ADMISSION → COHERENCE';
}

function wire(){
  const map=$('#map');if(!map)return;
  map.addEventListener('omega-map-view',e=>{const d=e.detail||{};if(Array.isArray(d.bbox)){runtime.view={bbox:d.bbox,scale:Number(d.scale)||1};schedule('viewport relativity update',260);}});
  map.addEventListener('omega-map-select',e=>{updateCellInspector(e.detail);schedule('selected Earth frame',120);});
  window.addEventListener('omega-calibrated-sar-patch',e=>{runtime.patch=e.detail?.patch||null;runtime.patchAnchors=enrichPatchAnchors(runtime.patch);schedule('calibrated Sentinel-1 patch bound',20);});
  window.addEventListener('omega-calibrated-sar-patch-clear',()=>{runtime.patch=null;runtime.patchAnchors=[];schedule('measurement patch cleared',60);});
  window.addEventListener('omega-nisar-sar-anchors',e=>{runtime.nisarAnchors=Array.isArray(e.detail?.anchors)?e.detail.anchors:[];schedule(runtime.nisarAnchors.length?`NISAR GCOV ${e.detail.quantity||''} ${e.detail.polarization||''} bound`:`NISAR anchor state ${e.detail?.state||'unresolved'}`,40);});
  const probe=$('#pixelProbeStatus');if(probe)new MutationObserver(()=>{if(/calibrated Sentinel-1/i.test(probe.textContent||''))schedule('calibrated temporal stack bound',60);}).observe(probe,{childList:true,subtree:true,characterData:true});
  const current=$('#currentTime');if(current)new MutationObserver(()=>schedule('temporal frame advanced',120)).observe(current,{childList:true,subtree:true,characterData:true});
  $('#sarCalQuantity')?.addEventListener('change',()=>schedule('measurement channel changed',40));$('#assetSelect')?.addEventListener('change',()=>schedule('polarization channel changed',40));
}

export function initializeOmegaContinuousField(){
  if(typeof document==='undefined'||globalThis.__OMEGA_CONTINUOUS_INITIALIZED)return;globalThis.__OMEGA_CONTINUOUS_INITIALIZED=true;installUi();wire();globalThis.OMEGA_SAR_SKINS=FULL_OMEGA_MODE_STACK;schedule('full correlated-skin initialization',0);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeOmegaContinuousField,{once:true});else queueMicrotask(initializeOmegaContinuousField);}
