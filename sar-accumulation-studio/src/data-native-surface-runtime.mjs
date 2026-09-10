import { buildTerrainReliefSurface, buildTerrainShapedSarSurface } from './data-native-surface-core.mjs';
import { drawMeshCellByBlades } from './sar-blade-geometry.mjs';

const map=document.querySelector('#map'),wrap=map?.closest('.map-wrap');
let layer=null,canvas=null,ctx=null,dpr=1,reliefCanvas=null,regionalCanvas=null,exactCanvas=null,lastTerrainKey='',lastRegionalKey='',lastExactKey='',raf=0;
const state={state:'INITIALIZING',active:true,surface:'WORLD_RELIEF',terrainReady:false,regionalReady:false,exactReady:false,renderedAt:null,regionalStats:null,exactStats:null,boundary:'This renderer changes display only. Calibrated SAR dB/power remain untouched measurement arrays. DEM relief and drainage potential are derived visual/context fields; no missing SAR pixels, water depth, or 3-D geometry are synthesized.'};
globalThis.OMEGA_DATA_NATIVE_SURFACE=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function terrainState(){return globalThis.OMEGA_DATA_NATIVE_TERRAIN||null;}
function regionalPatch(){const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;return r?.state==='READY'&&r?.patch?.evidence?.measured===true?r.patch:null;}
function exactPatch(){const p=renderer()?.sarOverlay?.patch;return p?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&p?.evidence?.measured===true?p:null;}
function rgbaCanvas(surface){if(!surface?.rgba)return null;const c=document.createElement('canvas');c.width=surface.width;c.height=surface.height;const q=c.getContext('2d');const image=q.createImageData(surface.width,surface.height);image.data.set(surface.rgba);q.putImageData(image,0,0);return c;}
function terrainKey(t){return t?.terrain?`${t.updatedAt}:${t.terrain.z}:${t.terrain.width}x${t.terrain.height}:${t.terrain.bbox?.join(',')}`:'';}
function patchKey(p,t){return p?`${p.id}:${p.startTime}:${p.width}x${p.height}:${p.stats?.p02}:${p.stats?.p98}:${terrainKey(t)}`:'';}
function ensureAssets(){
  const t=terrainState();if(t?.state==='READY'&&t.terrain){const key=terrainKey(t);if(key&&key!==lastTerrainKey){const surface=buildTerrainReliefSurface(t.terrain,t.water);reliefCanvas=rgbaCanvas(surface);lastTerrainKey=key;state.terrainReady=!!reliefCanvas;state.reliefStats=surface?.stats||null;}}
  const rp=regionalPatch();if(rp){const key=patchKey(rp,t);if(key!==lastRegionalKey){const surface=buildTerrainShapedSarSurface(rp,t?.terrain,t?.water,{reliefStrength:.36,textureStrength:.14});regionalCanvas=rgbaCanvas(surface);lastRegionalKey=key;state.regionalStats=surface?.stats||null;state.regionalReady=!!regionalCanvas;}}
  else{regionalCanvas=null;lastRegionalKey='';state.regionalReady=false;state.regionalStats=null;}
  const ep=exactPatch();if(ep){const key=patchKey(ep,t);if(key!==lastExactKey){const surface=buildTerrainShapedSarSurface(ep,t?.terrain,t?.water,{reliefStrength:.29,textureStrength:.17});exactCanvas=rgbaCanvas(surface);lastExactKey=key;state.exactStats=surface?.stats||null;state.exactReady=!!exactCanvas;}}
  else{exactCanvas=null;lastExactKey='';state.exactReady=false;state.exactStats=null;}
}
function drawRelief(r){
  const t=terrainState()?.terrain;if(!reliefCanvas||!t?.bbox)return false;const [w,s,e,n]=t.bbox,a=r.project(w,n),b=r.project(e,s),x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]),dw=Math.abs(b[0]-a[0]),dh=Math.abs(b[1]-a[1]);if(dw<1||dh<1)return false;
  // This is a dedicated transparent overlay. soft-light against transparency collapses
  // the DEM signal, so R256 composites the already alpha-shaped source DEM raster with
  // source-over. The per-pixel alpha is part of the data-derived relief surface itself.
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Number(r.view.scale)<4?.94:.72;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(reliefCanvas,x,y,dw,dh);ctx.restore();return true;
}
function drawPatch(r,patch,image,alpha=1){
  const mesh=patch?.geoMesh;if(!image||!mesh?.nodes||mesh.validNodeCount<4)return 0;const n=mesh.segments||mesh.nodes.length-1;let cells=0;ctx.save();ctx.globalCompositeOperation='source-over';
  for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;
    const dest=[r.project(q00.lon,q00.lat),r.project(q10.lon,q10.lat),r.project(q01.lon,q01.lat),r.project(q11.lon,q11.lat)];if(drawMeshCellByBlades(ctx,image,mesh.sourceWindow,[q00,q10,q01,q11],dest,{alpha,filter:'contrast(1.06) saturate(.90)'}))cells++;
  }
  ctx.restore();return cells;
}
function drawEvents(r){
  const events=globalThis.OMEGA_EARTH_AWARENESS?.events||[],bbox=r.viewBounds?.();if(!Array.isArray(bbox)||!events.length)return;const [w,s,e,n]=bbox,visible=events.filter(v=>v.lon>=w&&v.lon<=e&&v.lat>=s&&v.lat<=n).slice(0,80);if(!visible.length)return;
  ctx.save();for(const event of visible){const [x,y]=r.project(event.lon,event.lat),quake=event.authority==='USGS',m=Number.isFinite(event.magnitude)?event.magnitude:2.5,rad=quake?Math.min(8,2+m*.75):3.2;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fillStyle=quake?'rgba(245,236,225,.44)':'rgba(205,235,242,.34)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.30)';ctx.lineWidth=.6;ctx.stroke();}ctx.restore();
}
function forceOpacity(selector,value){const node=document.querySelector(selector);if(!node)return;if(value==null)node.style.removeProperty('opacity');else node.style.setProperty('opacity',String(value),'important');}
function applyLayerHierarchy(surface){
  const shaped=surface==='REGIONAL_SHAPED_SAR'||surface==='EXACT_SHAPED_SAR',exact=surface==='EXACT_SHAPED_SAR';
  forceOpacity('.omega-regional-sar-layer canvas',surface==='REGIONAL_SHAPED_SAR'?.02:null);
  forceOpacity('.omega-global-sar-fabric canvas',shaped?.006:null);
  forceOpacity('.omega-woven-motion canvas',shaped?.018:null);
  forceOpacity('.omega-earth-awareness-layer canvas',0);
  forceOpacity('#map',exact?.02:null);
  const oldBadge=document.querySelector('#omegaRegionalSarBadge');if(oldBadge)oldBadge.style.setProperty('display','none','important');
}
function updateDomState(surface){state.surface=surface;state.renderedAt=new Date().toISOString();document.body.dataset.dataNativeSurface=surface.toLowerCase();applyLayerHierarchy(surface);const badge=document.querySelector('#omegaDataNativeBadge');if(badge)badge.textContent=surface==='EXACT_SHAPED_SAR'?'EXACT MEASURED SAR · TERRAIN-SHAPED DISPLAY':surface==='REGIONAL_SHAPED_SAR'?'REGIONAL MEASURED SAR · TERRAIN-SHAPED DISPLAY':'DATA-NATIVE EARTH RELIEF · SOURCE DEM';}
function draw(){
  if(!ctx||!canvas||!map)return;ensureAssets();const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);const r=renderer();if(!r)return;const scale=Number(r.view.scale)||1;
  drawRelief(r);
  let surface='WORLD_RELIEF';const rp=regionalPatch(),ep=exactPatch();
  if(scale>900&&ep&&exactCanvas&&drawPatch(r,ep,exactCanvas,1)>0)surface='EXACT_SHAPED_SAR';
  else if(scale>=240&&scale<=950&&rp&&regionalCanvas&&drawPatch(r,rp,regionalCanvas,1)>0)surface='REGIONAL_SHAPED_SAR';
  drawEvents(r);updateDomState(surface);
}
function scheduleDraw(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);scheduleDraw();}
function install(){
  if(!wrap||layer)return;const style=document.createElement('style');style.id='omegaDataNativeSurfaceStyle';style.textContent=`
  .omega-data-native-surface{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}.omega-data-native-surface canvas{position:absolute;inset:0;width:100%;height:100%;display:block}.omega-data-native-badge{position:absolute;z-index:11;left:10px;top:10px;padding:5px 7px;border-radius:7px;border:1px solid rgba(255,255,255,.10);background:rgba(3,7,9,.48);backdrop-filter:blur(10px);font:700 7px Inter,Segoe UI,sans-serif;letter-spacing:.07em;color:rgba(236,244,246,.74);pointer-events:none}
  body[data-data-native-surface=regional_shaped_sar][data-sar-surface=regional_measured] .omega-regional-sar-layer canvas{opacity:.02!important}
  body[data-data-native-surface=regional_shaped_sar] .omega-global-sar-fabric canvas,body[data-data-native-surface=exact_shaped_sar] .omega-global-sar-fabric canvas{opacity:.006!important}
  body[data-data-native-surface=regional_shaped_sar] .omega-woven-motion canvas,body[data-data-native-surface=exact_shaped_sar] .omega-woven-motion canvas{opacity:.018!important}
  body[data-data-native-surface=exact_shaped_sar] #map{opacity:.02!important}
  body.omega-experience .omega-earth-awareness-layer canvas{opacity:0!important}
  body.omega-experience .omega-jrc-water-layer canvas{opacity:.16!important;mix-blend-mode:screen!important;filter:saturate(.72) contrast(.94)!important}
  body.omega-experience #omegaRegionalSarBadge{display:none!important}
  @media(max-width:760px){.omega-data-native-badge{display:none}}
  `;document.head.append(style);layer=document.createElement('div');layer.className='omega-data-native-surface';canvas=document.createElement('canvas');ctx=canvas.getContext('2d');layer.append(canvas);const badge=document.createElement('div');badge.id='omegaDataNativeBadge';badge.className='omega-data-native-badge';badge.textContent='DATA-NATIVE EARTH SURFACE · LOADING';wrap.append(layer,badge);new ResizeObserver(resize).observe(map);resize();
  map.addEventListener('omega-map-view',scheduleDraw);window.addEventListener('omega-data-native-terrain',()=>{lastTerrainKey='';lastRegionalKey='';lastExactKey='';scheduleDraw();});window.addEventListener('omega-regional-sar-measurement',()=>{lastRegionalKey='';scheduleDraw();});window.addEventListener('omega-calibrated-sar-patch',()=>{lastExactKey='';scheduleDraw();});window.addEventListener('omega-calibrated-sar-patch-clear',()=>{lastExactKey='';scheduleDraw();});window.addEventListener('omega-earth-awareness-update',scheduleDraw);state.state='READY';state.redraw=draw;state.applyLayerHierarchy=applyLayerHierarchy;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);
