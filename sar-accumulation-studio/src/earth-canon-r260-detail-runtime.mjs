import { buildMeasuredSpatialCalculus } from './sar-measured-calculus-core.mjs';
import { buildTerrainShapedSarSurface } from './data-native-surface-core.mjs';
import { buildCanonicalMeasuredVisualSurface } from './earth-canon-visual-core.mjs';
import { drawMeshCellByBlades } from './sar-blade-geometry.mjs';

const map=document.querySelector('#map'),wrap=map?.closest('.map-wrap');
let layer=null,canvas=null,ctx=null,dpr=1,raf=0,lastKey='',image=null,activePatch=null,lastSurface=null;
const state={state:'INITIALIZING',release:'R260',source:null,stats:null,terrainCoverage:0,renderedCells:0,field:null,boundary:'R260 high-detail output is source-derived image formation. Calibrated Sentinel-1 remains the measured luminance authority; local tensor/derivative structure and coherent DEM relief shape display only. No missing sensor detail or physical quantity is invented.'};
globalThis.OMEGA_EARTH_CANON_R260_DETAIL=state;

const finite=v=>Number.isFinite(Number(v));
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function selectedPatch(){const r=renderer(),scale=Number(r?.view?.scale)||1,exact=r?.sarOverlay?.patch,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch;if(scale>900&&exact?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&exact?.evidence?.measured===true)return exact;if(regional?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&regional?.evidence?.measured===true)return regional;return exact?.evidence?.measured===true?exact:null;}
function terrainState(){return globalThis.OMEGA_DATA_NATIVE_TERRAIN||null;}
function field(){return globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD?.field||globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD_STATE||null;}
function rgbaCanvas(surface){const c=document.createElement('canvas');c.width=surface.width;c.height=surface.height;const q=c.getContext('2d');const im=q.createImageData(surface.width,surface.height);im.data.set(surface.rgba);q.putImageData(im,0,0);return c;}
function directiveKey(){const c=field()?.channels;return c?Object.values(c).map(v=>Number(v).toFixed(3)).join(','):'default';}
function patchKey(p,t){return p?`${p.id}|${p.startTime||''}|${p.width}x${p.height}|${p.stats?.p02}|${p.stats?.p98}|${t?.updatedAt||''}|${t?.terrain?.z||''}|${directiveKey()}`:'';}
function buildSurface(patch){
  const calc=buildMeasuredSpatialCalculus(patch),terrain=terrainState();let terrainSurface=null,terrainCoverage=0;
  if(terrain?.state==='READY'&&terrain?.terrain){const shaped=buildTerrainShapedSarSurface(patch,terrain.terrain,terrain.water,{reliefStrength:.28,textureStrength:.10});terrainCoverage=Number(shaped?.stats?.terrainCoverage)||0;if(terrainCoverage>=.36)terrainSurface=shaped;}
  const visual=buildCanonicalMeasuredVisualSurface(patch,calc,{terrainRgba:terrainSurface?.rgba||null,terrainCoverage,directives:field()?.channels||null});
  return {visual,calc,terrainCoverage,canvas:rgbaCanvas(visual)};
}
function ensureImage(){const patch=selectedPatch();if(!patch)return false;const t=terrainState(),key=patchKey(patch,t);if(key!==lastKey){const built=buildSurface(patch);activePatch=patch;image=built.canvas;lastSurface=built.visual;lastKey=key;state.source={id:patch.id,startTime:patch.startTime||null,width:patch.width,height:patch.height,quantity:patch.quantity,polarization:patch.polarization,evidence:patch.evidence};state.stats={...built.visual.stats,metric:built.calc.metric,derivativeUnits:built.calc.derivativeUnits,tensor:built.visual.tensor.stats};state.terrainCoverage=built.terrainCoverage;state.field=field()?{renderState:field().renderState,gate:field().gate,channels:field().channels}:null;window.dispatchEvent(new CustomEvent('omega-r260-detail-update',{detail:{source:state.source,stats:state.stats,terrainCoverage:state.terrainCoverage}}));}return !!image;}
function draw(){
  if(!ctx||!canvas||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);state.renderedCells=0;const requested=globalThis.OMEGA_SAR_R258_CALCULUS?.mode||'detail';
  if(requested!=='detail'){state.state='STANDBY_SPECIALIZED_VIEW';document.body.dataset.r260Detail='standby';return;}
  if(!ensureImage()){state.state='WAITING_FOR_MEASURED_SAR';document.body.dataset.r260Detail='waiting';return;}const r=renderer(),mesh=activePatch?.geoMesh;if(!r||!mesh?.nodes||mesh.validNodeCount<4){state.state='WAITING_FOR_REGISTERED_MESH';document.body.dataset.r260Detail='waiting';return;}
  const n=mesh.segments||mesh.nodes.length-1;let cells=0;ctx.save();ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>finite(q?.lon)&&finite(q?.lat)))continue;const dest=[r.project(q00.lon,q00.lat),r.project(q10.lon,q10.lat),r.project(q01.lon,q01.lat),r.project(q11.lon,q11.lat)];if(drawMeshCellByBlades(ctx,image,mesh.sourceWindow,[q00,q10,q01,q11],dest,{alpha:1,filter:'contrast(1.025)'}))cells++;
  }ctx.restore();state.renderedCells=cells;state.state=cells?'READY':'UNRESOLVED';document.body.dataset.r260Detail=cells?'ready':'unresolved';
}
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}
function invalidate(){lastKey='';schedule();}
function install(){
  if(!wrap||layer)return;const style=document.createElement('style');style.id='omegaEarthCanonR260DetailStyle';style.textContent=`.omega-earth-canon-r260-detail{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:hidden}.omega-earth-canon-r260-detail canvas{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:1;transition:opacity .16s ease-out}body[data-r260-detail=ready] .omega-earth-canon-detail{opacity:0!important}body[data-r260-detail=ready] .omega-data-native-surface{opacity:.025!important}body[data-r260-detail=ready] .omega-r258-calculus-layer{opacity:0!important}body[data-r260-detail=standby] .omega-earth-canon-r260-detail{opacity:0!important}`;document.head.append(style);layer=document.createElement('div');layer.className='omega-earth-canon-r260-detail';canvas=document.createElement('canvas');ctx=canvas.getContext('2d',{alpha:true});layer.append(canvas);wrap.append(layer);new ResizeObserver(resize).observe(map);resize();
  for(const e of ['omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-regional-sar-measurement','omega-data-native-terrain','omega-earth-canon-visual-field'])window.addEventListener(e,invalidate);map.addEventListener('omega-map-view',schedule);map.addEventListener('omega-map-select',invalidate);document.querySelector('#omegaR258LayerSelect')?.addEventListener('change',schedule);state.redraw=schedule;state.state='READY';
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
