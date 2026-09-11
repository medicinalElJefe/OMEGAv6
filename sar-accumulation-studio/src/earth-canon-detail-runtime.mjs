import { buildMeasuredSpatialCalculus } from './sar-measured-calculus-core.mjs';
import { buildTerrainShapedSarSurface } from './data-native-surface-core.mjs';
import { drawMeshCellByBlades } from './sar-blade-geometry.mjs';

const map=document.querySelector('#map'),wrap=map?.closest('.map-wrap');
let layer=null,canvas=null,ctx=null,dpr=1,raf=0,lastKey='',image=null,activePatch=null,stats=null;
const state={state:'INITIALIZING',release:'R259',mode:'CANONICAL_MEASURED_SHAPE',source:null,terrainBlend:false,renderedCells:0,stats:null,boundary:'R259 Canonical Shape is a display transform only. Calibrated Sentinel-1 backscatter remains the measured luminance anchor. Spatial derivatives and source DEM may reveal structure but do not create new pixels, resolution, elevation from SAR, displacement, phase, coherence or physical law.'};
globalThis.OMEGA_EARTH_CANON_DETAIL=state;

const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function selectedPatch(){const r=renderer(),scale=Number(r?.view?.scale)||1,exact=r?.sarOverlay?.patch,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch;if(scale>900&&exact?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&exact?.evidence?.measured===true)return exact;if(regional?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&regional?.evidence?.measured===true)return regional;return exact?.evidence?.measured===true?exact:null;}
function terrainState(){return globalThis.OMEGA_DATA_NATIVE_TERRAIN||null;}
function patchKey(p,t){return p?`${p.id}|${p.startTime||''}|${p.width}x${p.height}|${p.stats?.p02}|${p.stats?.p98}|${t?.updatedAt||''}|${t?.terrain?.z||''}`:'';}
function rgbaCanvas(width,height,rgba){const c=document.createElement('canvas');c.width=width;c.height=height;const q=c.getContext('2d');const im=q.createImageData(width,height);im.data.set(rgba);q.putImageData(im,0,0);return c;}
function norm(v,max){return finite(v)&&finite(max)&&max>0?clamp(Math.abs(Number(v))/Number(max)):0;}
function buildCanonicalSurface(patch){
  const calc=buildMeasuredSpatialCalculus(patch),{width,height,arrays,scales}=calc,n=width*height,rgba=new Uint8ClampedArray(n*4),terrain=terrainState();let terrainSurface=null,terrainCoverage=0;
  if(terrain?.state==='READY'&&terrain?.terrain){terrainSurface=buildTerrainShapedSarSurface(patch,terrain.terrain,terrain.water,{reliefStrength:.30,textureStrength:.16});terrainCoverage=Number(terrainSurface?.stats?.terrainCoverage)||0;if(terrainCoverage<.36)terrainSurface=null;}
  const terrainRgba=terrainSurface?.rgba||null;
  for(let i=0;i<n;i++){
    const raw=Number(arrays.raw[i]);if(!finite(raw))continue;const detail=finite(arrays.detail[i])?Number(arrays.detail[i]):raw,g=norm(arrays.gradient[i],scales.gradientP98),curvMax=Number(scales.absCurvatureP98)||0,curv=curvMax>0&&finite(arrays.curvature[i])?clamp(Number(arrays.curvature[i])/curvMax,-1,1):0,texture=norm(arrays.texture[i],scales.textureP98),orientation=finite(arrays.orientation[i])?Number(arrays.orientation[i]):0;
    // Multi-scale source shaping: measured backscatter remains dominant. Gradient,
    // curvature, texture and orientation only change display contrast/shading.
    const directional=Math.cos(orientation-5.49778714378)*g,structure=.67*raw+.23*detail+.055*g+.035*texture+.028*directional-.022*curv,tone=Math.pow(clamp(structure),.88);let v=tone;
    if(terrainRgba){const j=i*4,terrainLum=(Number(terrainRgba[j])+Number(terrainRgba[j+1])+Number(terrainRgba[j+2]))/(3*255);v=clamp(.80*tone+.20*terrainLum);}
    // Very small local S-curve increases readable shape without inventing frequency content.
    v=clamp(.5+.5*Math.tanh((v-.5)*2.35));const b=Math.round(v*255),j=i*4;rgba[j]=b;rgba[j+1]=b;rgba[j+2]=b;rgba[j+3]=255;
  }
  return {canvas:rgbaCanvas(width,height,rgba),calc,terrainCoverage,terrainBlend:!!terrainRgba,stats:{valid:calc.stats.validCount,validFraction:calc.stats.validFraction,metric:calc.metric,terrainCoverage},boundary:state.boundary};
}
function ensureImage(){const patch=selectedPatch();if(!patch){activePatch=null;image=null;lastKey='';return false;}const t=terrainState(),key=patchKey(patch,t);if(key!==lastKey){const built=buildCanonicalSurface(patch);activePatch=patch;image=built.canvas;stats=built.stats;lastKey=key;state.source={id:patch.id,startTime:patch.startTime||null,width:patch.width,height:patch.height,quantity:patch.quantity,polarization:patch.polarization};state.terrainBlend=built.terrainBlend;state.stats=built.stats;}return !!image;}
function draw(){
  if(!ctx||!canvas||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);state.renderedCells=0;
  const requested=globalThis.OMEGA_SAR_R258_CALCULUS?.mode||'detail';if(requested!=='detail'){state.state='STANDBY_SPECIALIZED_VIEW';document.body.dataset.canonShape='standby';return;}
  if(!ensureImage()){state.state='WAITING_FOR_MEASURED_SAR';document.body.dataset.canonShape='waiting';return;}const r=renderer(),mesh=activePatch?.geoMesh;if(!r||!mesh?.nodes||mesh.validNodeCount<4){state.state='WAITING_FOR_REGISTERED_MESH';document.body.dataset.canonShape='waiting';return;}const n=mesh.segments||mesh.nodes.length-1;let cells=0;ctx.save();ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>finite(q?.lon)&&finite(q?.lat)))continue;const dest=[r.project(q00.lon,q00.lat),r.project(q10.lon,q10.lat),r.project(q01.lon,q01.lat),r.project(q11.lon,q11.lat)];if(drawMeshCellByBlades(ctx,image,mesh.sourceWindow,[q00,q10,q01,q11],dest,{alpha:1,filter:'contrast(1.035)'}))cells++;
  }
  ctx.restore();state.renderedCells=cells;state.state=cells?'READY':'UNRESOLVED';document.body.dataset.canonShape=cells?'ready':'unresolved';
}
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}
function install(){
  if(!wrap||layer)return;const style=document.createElement('style');style.id='omegaEarthCanonDetailStyle';style.textContent=`.omega-earth-canon-detail{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden}.omega-earth-canon-detail canvas{position:absolute;inset:0;width:100%;height:100%;display:block}body[data-canon-shape=ready] .omega-r258-calculus-layer{opacity:0!important}body[data-canon-shape=ready] .omega-data-native-surface{opacity:.06!important}`;document.head.append(style);layer=document.createElement('div');layer.className='omega-earth-canon-detail';canvas=document.createElement('canvas');ctx=canvas.getContext('2d');layer.append(canvas);wrap.append(layer);new ResizeObserver(resize).observe(map);resize();
  const invalidate=()=>{lastKey='';image=null;activePatch=null;schedule();};for(const e of ['omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-regional-sar-measurement','omega-data-native-terrain','omega-earth-canon-update'])window.addEventListener(e,e==='omega-earth-canon-update'?schedule:invalidate);map.addEventListener('omega-map-view',schedule);map.addEventListener('omega-map-select',invalidate);document.querySelector('#omegaR258LayerSelect')?.addEventListener('change',schedule);state.redraw=schedule;state.state='READY';
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
