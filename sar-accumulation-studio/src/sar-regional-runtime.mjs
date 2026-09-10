import { calibratedRegionalViewport } from './sar-regional-measurement.mjs';
import { paintCalibratedPatch } from './sentinel1-calibration-core.mjs';
import { drawMeshCellByBlades } from './sar-blade-geometry.mjs';
import { sarAuthority } from './sar-authority.mjs';

const $=s=>document.querySelector(s);
const map=$('#map'),wrap=map?.closest('.map-wrap');
// Full Sentinel-1 GRD products are hundreds of MB. Regional measured rendering is
// admitted only once the authoritative camera is narrow enough that a bounded COG
// window can be read without pretending a browse image is measurement. R257 raises
// the display sampling budget substantially while keeping the read bounded to real
// COG support and retaining the previous Earth surface while the new view resolves.
const MIN_MEASURED_SCALE=260,MAX_MEASURED_SCALE=900,LOAD_BUDGET_MS=32000;
let layer=null,canvas=null,ctx=null,dpr=1,patch=null,image=null,generation=0,abort=null,timer=null;
const state={state:'IDLE',stage:null,scene:null,visible:false,patch:null,error:null,requestedBbox:null,updatedAt:null,source:'CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT',scalePolicy:{minMeasured:MIN_MEASURED_SCALE,maxMeasured:MAX_MEASURED_SCALE,loadBudgetMs:LOAD_BUDGET_MS,detailSamples:[448,640,768]}};
globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT=state;

function currentRecord(){const id=($('#currentScene')?.textContent||'').trim();if(!id||id==='—')return null;return {id,startTime:($('#currentTime')?.textContent||'').trim()||null,platform:(($('#platform')?.textContent||'sentinel-1').split('·')[0]||'sentinel-1').trim()};}
function selectedPolarization(){return String($('#assetSelect')?.value||'vv').toLowerCase();}
function selectedQuantity(){return $('#sarCalQuantity')?.value||'sigmaNought';}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function scaleClass(){const s=Number(renderer()?.view?.scale)||1;if(s<MIN_MEASURED_SCALE)return 'SOURCE_CONTEXT_SCALE';if(s>MAX_MEASURED_SCALE)return 'EXACT_LOCAL_SCALE';return 'REGIONAL_MEASURED_SCALE';}
function allowedScale(){return scaleClass()==='REGIONAL_MEASURED_SCALE';}
function detailBudget(){const s=Number(renderer()?.view?.scale)||1;return s<360?448:s<620?640:768;}
function emit(){window.dispatchEvent(new CustomEvent('omega-regional-sar-measurement',{detail:{...state,patch:patch?{state:patch.state,id:patch.id,startTime:patch.startTime,width:patch.width,height:patch.height,stats:patch.stats,evidence:patch.evidence,coverageBbox:patch.coverageBbox,overview:patch.overview,geolocation:patch.geolocation}:null}}));}
function setState(next,error=null,stage=null){state.state=next;state.stage=stage??state.stage;state.error=error?String(error.message||error):null;state.scene=patch?.id||currentRecord()?.id||null;state.visible=!!(canvas?.dataset.visible==='true');state.updatedAt=new Date().toISOString();state.patch=patch;emit();updateBadge();}
function ensureLayer(){
  if(!wrap||layer)return;
  const style=document.createElement('style');style.id='omegaRegionalSarStyle';style.textContent=`
  .omega-regional-sar-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.omega-regional-sar-layer canvas{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:.92;transition:opacity .28s cubic-bezier(.2,.75,.2,1),filter .28s cubic-bezier(.2,.75,.2,1)}.omega-regional-sar-badge{position:absolute;z-index:7;left:14px;top:14px;max-width:min(620px,62%);padding:7px 9px;border-radius:9px;background:rgba(3,7,9,.80);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.14);font:600 9px Inter,Segoe UI,sans-serif;color:#e9eef0;letter-spacing:.035em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-regional-sar-badge[data-state=READY]{border-color:rgba(202,238,246,.30)}.omega-regional-sar-badge[data-state=ERROR]{border-color:rgba(255,125,125,.26);color:#f3c4c4}@media(max-width:760px){.omega-regional-sar-badge{left:10px;top:10px;right:58px;max-width:none}}
  `;document.head.append(style);
  layer=document.createElement('div');layer.className='omega-regional-sar-layer';canvas=document.createElement('canvas');canvas.dataset.visible='false';ctx=canvas.getContext('2d');const badge=document.createElement('div');badge.id='omegaRegionalSarBadge';badge.className='omega-regional-sar-badge';badge.textContent='REGIONAL MEASURED SAR · WAITING';layer.append(canvas,badge);wrap.append(layer);
  new ResizeObserver(resize).observe(map);resize();
}
function updateBadge(){const b=$('#omegaRegionalSarBadge');if(!b)return;b.dataset.state=state.state==='READY'?'READY':state.state==='ERROR'||state.state==='DEGRADED_SOURCE_CONTEXT'?'ERROR':'WAIT';
  if(state.state==='READY'&&patch)b.textContent=`REGIONAL MEASURED SAR · ${patch.polarization} ${patch.quantity} · ${patch.width}×${patch.height} display samples · ${patch.stats.validCount.toLocaleString()} valid · ${patch.geolocation.quality} · SOURCE MEASURED`;
  else if(state.state==='LOADING')b.textContent=`REGIONAL MEASURED SAR · ${String(state.stage||'COG').replaceAll('_',' ')}…`;
  else if(state.state==='SOURCE_CONTEXT_SCALE')b.textContent=`WIDE CAMERA · source SAR + Earth awareness · zoom to ${MIN_MEASURED_SCALE}× for measured regional COG`;
  else if(state.state==='EXACT_LOCAL_SCALE')b.textContent='EXACT LOCAL SAR SCALE · calibrated target patch has priority';
  else if(state.state==='NO_COVERAGE')b.textContent='REGIONAL MEASURED SAR · current scene does not cover this camera';
  else if(state.state==='DEGRADED_SOURCE_CONTEXT')b.textContent='REGIONAL COG BUDGET EXCEEDED · source context retained · exact SAR remains available';
  else if(state.error)b.textContent=`REGIONAL MEASURED SAR · ${state.error}`;
  else b.textContent='REGIONAL MEASURED SAR · WAITING';
}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function clear(){if(!ctx||!canvas)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);canvas.dataset.visible='false';state.visible=false;}
function draw(){
  if(!ctx||!canvas||!map)return;clear();if(!patch||!image||!allowedScale())return;const r=renderer(),mesh=patch.geoMesh;if(!r||!mesh?.nodes||mesh.validNodeCount<4)return;
  const n=mesh.segments||mesh.nodes.length-1;let cells=0;ctx.save();ctx.globalCompositeOperation='source-over';
  for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;
    const dest=[r.project(q00.lon,q00.lat),r.project(q10.lon,q10.lat),r.project(q01.lon,q01.lat),r.project(q11.lon,q11.lat)];
    if(drawMeshCellByBlades(ctx,image,mesh.sourceWindow,[q00,q10,q01,q11],dest,{alpha:.94,filter:'contrast(1.15) brightness(.99)'}))cells++;
  }
  ctx.restore();
  // No dashed coverage rectangle in R257. The measured pixels and their blade-registered
  // support are the visual geometry; footprint proof remains available in DATA/PROOF.
  if(cells){canvas.dataset.visible='true';state.visible=true;}
}
function deadline(ms,controller){return new Promise((_,reject)=>setTimeout(()=>{controller?.abort?.();const error=new Error(`Regional COG exceeded ${Math.round(ms/1000)}s bounded load budget`);error.code='REGIONAL_COG_BUDGET';reject(error);},ms));}
async function load(){
  ensureLayer();const r=renderer(),record=currentRecord();if(!r||!record)return;
  const cls=scaleClass();if(cls!=='REGIONAL_MEASURED_SCALE'){abort?.abort();patch=null;image=null;clear();setState(cls,null,cls);return;}
  const bbox=r.viewBounds?.();if(!Array.isArray(bbox)||bbox.length!==4)return;
  abort?.abort();abort=new AbortController();const my=++generation,snapshot=sarAuthority.capture(),controller=abort;state.requestedBbox=[...bbox];state.stage='REGIONAL_RESOLVE_PRODUCT';setState('LOADING');
  try{
    const regional=calibratedRegionalViewport(record,bbox,{polarization:selectedPolarization(),quantity:selectedQuantity(),maxSamples:detailBudget(),signal:controller.signal,onStage:stage=>{if(my===generation){state.stage=stage;updateBadge();globalThis.OMEGA_SAR_R257_EXPERIENCE?.refresh?.();}}});
    const next=await Promise.race([regional,deadline(LOAD_BUDGET_MS,controller)]);
    if(my!==generation||controller.signal.aborted)return;
    if(!sarAuthority.accepts(snapshot,{target:true,camera:true,scene:true}))return;
    patch=next;image=document.createElement('canvas');paintCalibratedPatch(patch,image);draw();setState('READY',null,'REGIONAL_READY');
  }catch(error){if(my!==generation||error?.name==='AbortError')return;patch=null;image=null;clear();if(error?.code==='REGIONAL_COG_BUDGET')setState('DEGRADED_SOURCE_CONTEXT',error,'REGIONAL_BUDGET_EXCEEDED');else setState(/does not intersect|could not be inverted/i.test(error.message)?'NO_COVERAGE':'ERROR',error,'REGIONAL_FAILED');}
}
function schedule(delay=500){clearTimeout(timer);timer=setTimeout(()=>load().catch(error=>setState('ERROR',error,'UNHANDLED')),delay);}
function install(){ensureLayer();map?.addEventListener('omega-map-view',()=>{draw();schedule(620);});window.addEventListener('omega-source-sar-frame',()=>schedule(80));window.addEventListener('omega-calibrated-sar-patch',()=>draw());window.addEventListener('omega-calibrated-sar-patch-clear',()=>draw());$('#assetSelect')?.addEventListener('change',()=>schedule(70));$('#sarCalQuantity')?.addEventListener('change',()=>schedule(70));const scene=$('#currentScene');if(scene)new MutationObserver(()=>schedule(70)).observe(scene,{childList:true,subtree:true,characterData:true});schedule(900);}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}

state.reload=()=>load();state.draw=()=>draw();state.detailBudget=detailBudget;
