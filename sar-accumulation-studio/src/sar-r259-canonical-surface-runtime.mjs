import { buildMeasuredSpatialCalculus } from './sar-measured-calculus-core.mjs';
import { drawMeshCellByBlades } from './sar-blade-geometry.mjs';
import { buildCanonicalMeasuredSurface, surfaceAdmission } from './sar-r259-canonical-surface-core.mjs';

const $=s=>document.querySelector(s),map=$('#map'),wrap=map?.closest('.map-wrap');
let layer=null,canvas=null,ctx=null,dpr=1,raf=0,image=null,activePatch=null,calculus=null,lastKey='',lastSurface=null;
const state={state:'INITIALIZING',release:'R259',mode:'canon',surface:null,source:null,renderedCells:0,layerVisible:false,boundary:'The R259 image plane is source-bound. Full Overall Canon, Unified Coherence and Mode 188 control admission/detail weighting only; they cannot manufacture physical observation.'};
globalThis.OMEGA_SAR_R259_CANONICAL_SURFACE=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function cube(){return globalThis.OMEGA_CANONICAL_EARTH_CUBE||null;}
function terrain(){return globalThis.OMEGA_DATA_NATIVE_TERRAIN||null;}
function measuredPatch(){
  const r=renderer(),scale=Number(r?.view?.scale)||1,exact=r?.sarOverlay?.patch,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch;
  if(scale>900&&exact?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&exact?.evidence?.measured===true)return exact;
  if(regional?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&regional?.evidence?.measured===true)return regional;
  return exact?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&exact?.evidence?.measured===true?exact:null;
}
function keyFor(p){const t=terrain(),c=cube();return p?`${p.id}|${p.startTime||''}|${p.width}x${p.height}|${p.stats?.p02}|${p.stats?.p98}|${t?.updatedAt||''}|${c?.revision||0}|${state.mode}`:'';}
function rgbaCanvas(surface){const c=document.createElement('canvas');c.width=surface.width;c.height=surface.height;const q=c.getContext('2d'),data=q.createImageData(surface.width,surface.height);data.data.set(surface.rgba);q.putImageData(data,0,0);return c;}
function frameForSurface(){const c=cube();return c?.frame?{...c.frame,directive:c.directive}:null;}
function activeMode(){return ['canon','structure','terrain'].includes(state.mode);}
function ensureSurface(){
  const p=measuredPatch();if(!p||!activeMode())return false;const key=keyFor(p);if(key===lastKey&&image&&activePatch===p)return true;
  const nextCalculus=buildMeasuredSpatialCalculus(p),admission=surfaceAdmission({patch:p,calculus:nextCalculus,frame:frameForSurface(),mode:state.mode});
  if(!admission.accepted){state.state='CONDITIONAL';state.admission=admission;return false;}
  const surface=buildCanonicalMeasuredSurface(p,nextCalculus,terrain(),frameForSurface(),{mode:state.mode}),next=rgbaCanvas(surface);if(!next)return false;
  activePatch=p;calculus=nextCalculus;image=next;lastSurface=surface;lastKey=key;state.surface=surface;state.admission=admission;state.source={id:p.id,startTime:p.startTime||null,width:p.width,height:p.height,quantity:p.quantity||null,polarization:p.polarization||null};state.state='READY';return true;
}
function drawPatch(r,p,img){const mesh=p?.geoMesh;if(!img||!mesh?.nodes||mesh.validNodeCount<4)return 0;const n=mesh.segments||mesh.nodes.length-1;let cells=0;ctx.save();ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
  const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;const dest=[r.project(q00.lon,q00.lat),r.project(q10.lon,q10.lat),r.project(q01.lon,q01.lat),r.project(q11.lon,q11.lat)];if(drawMeshCellByBlades(ctx,img,mesh.sourceWindow,[q00,q10,q01,q11],dest,{alpha:1,filter:state.mode==='structure'?'contrast(1.10)':'contrast(1.08) brightness(.995)'}))cells++;
 }ctx.restore();return cells;}
function drawGeodesy(r){const g=globalThis.OMEGA_EARTHSCOPE_GEODESY;if(!g?.stations?.length)return;const measured=new Set((g.measurements||[]).map(x=>x.station));ctx.save();for(const s of g.stations.slice(0,80)){const [x,y]=r.project(s.lon,s.lat);if(x<-8||y<-8||x>r.w+8||y>r.h+8)continue;const has=measured.has(s.id),rad=has?3.2:1.7;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fillStyle=has?'rgba(237,246,247,.86)':'rgba(211,229,233,.38)';ctx.fill();if(has){ctx.beginPath();ctx.arc(x,y,rad+3.1,0,Math.PI*2);ctx.strokeStyle='rgba(174,226,236,.32)';ctx.lineWidth=.8;ctx.stroke();}}
  ctx.restore();}
function drawEvents(r){const e=globalThis.OMEGA_EARTH_AWARENESS?.events||[];if(!e.length||Number(r.view?.scale)<8)return;const b=r.viewBounds?.();ctx.save();for(const event of e.slice(0,160)){if(b&&(event.lon<b[0]||event.lon>b[2]||event.lat<b[1]||event.lat>b[3]))continue;const [x,y]=r.project(event.lon,event.lat),m=Number.isFinite(event.magnitude)?event.magnitude:2.5,rad=Math.min(7,1.5+.65*m);ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.strokeStyle=event.authority==='USGS'?'rgba(245,230,218,.40)':'rgba(211,235,240,.30)';ctx.lineWidth=.7;ctx.stroke();}ctx.restore();}
function hierarchy(on){
  const selectors=['.omega-r258-calculus-layer canvas','.omega-data-native-surface canvas','.omega-regional-sar-layer canvas','.omega-earth-awareness-layer canvas','.omega-jrc-water-layer canvas'];for(const sel of selectors){const n=$(sel);if(!n)continue;if(on)n.style.setProperty('opacity',sel.includes('regional')?'.008':'0','important');else n.style.removeProperty('opacity');}
  const f=$('.omega-global-sar-fabric canvas');if(f){if(on)f.style.setProperty('opacity','.003','important');else f.style.removeProperty('opacity');}
  document.body?.toggleAttribute('data-r259-canonical-surface',!!on);
}
function draw(){
  if(!ctx||!canvas||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);state.layerVisible=false;state.renderedCells=0;const r=renderer();if(!r)return;
  const ready=ensureSurface();if(!ready){hierarchy(false);updateReadout();return;}const cells=drawPatch(r,activePatch,image);if(cells){state.layerVisible=true;state.renderedCells=cells;hierarchy(true);drawGeodesy(r);drawEvents(r);}else hierarchy(false);updateReadout();
}
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1));canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}
function humanMode(){return state.mode==='canon'?'CANON HD':state.mode==='structure'?'SOURCE STRUCTURE':'SAR + TERRAIN';}
function updateReadout(){const el=$('#omegaR258CalculusReadout');if(!el||!activeMode())return;const s=lastSurface,src=state.source,c=cube();el.textContent=s&&state.layerVisible?`${humanMode()} · ${src?.width||0}×${src?.height||0} source · ${Number(s.stats?.validSar||0).toLocaleString()} measured · DEM ${(100*(s.stats?.terrainCoverage||0)).toFixed(0)}% · M188 ${c?.frame?.fusion?.mode188?.decision||'—'}`:`${humanMode()} · WAITING FOR CALIBRATED SOURCE`;el.title=s?.boundary||state.boundary;}
function installModes(){const select=$('#omegaR258LayerSelect');if(!select)return;for(const [value,label] of [['canon','CANON HD'],['structure','STRUCTURE'],['terrain','SAR+TERRAIN']])if(!select.querySelector(`option[value="${value}"]`)){const o=document.createElement('option');o.value=value;o.textContent=label;select.prepend(o);}select.value='canon';state.mode='canon';select.addEventListener('change',()=>{state.mode=select.value;lastKey='';if(!activeMode())hierarchy(false);schedule();updateReadout();});}
function installStyle(){if($('#omegaR259CanonicalSurfaceStyle'))return;const style=document.createElement('style');style.id='omegaR259CanonicalSurfaceStyle';style.textContent=`.omega-r259-canonical-surface{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden}.omega-r259-canonical-surface canvas{position:absolute;inset:0;width:100%;height:100%;display:block}body[data-r259-canonical-surface] #omegaDataNativeBadge{opacity:.16!important}body[data-r259-canonical-surface] #omegaGlobalSarFabricHud{opacity:.12!important}.omega-canonical-cube-panel{grid-column:1/-1!important}`;document.head.append(style);}
function invalidate(){lastKey='';schedule();}
function install(){if(!wrap||layer)return;installStyle();installModes();layer=document.createElement('div');layer.className='omega-r259-canonical-surface';canvas=document.createElement('canvas');ctx=canvas.getContext('2d',{alpha:true});layer.append(canvas);wrap.append(layer);new ResizeObserver(resize).observe(map);resize();for(const name of ['omega-canonical-earth-cube','omega-regional-sar-measurement','omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-data-native-terrain','omega-earthscope-geodesy','omega-earth-awareness-update'])window.addEventListener(name,invalidate);map?.addEventListener('omega-map-view',schedule);map?.addEventListener('omega-map-select',invalidate);state.state='READY';}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.setMode=mode=>{if(['canon','structure','terrain'].includes(mode)){state.mode=mode;const select=$('#omegaR258LayerSelect');if(select)select.value=mode;lastKey='';schedule();}};state.redraw=schedule;