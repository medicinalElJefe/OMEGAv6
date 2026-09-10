import { lonLatToTile, tileToLonLat } from './water-geometry-core.mjs';
import { sarAuthority } from './sar-authority.mjs';

const $=s=>document.querySelector(s),map=$('#map'),wrap=map?.closest('.map-wrap');
const MAX_TILES=20,STRIPS=12;
const cache=new Map();
let layer=null,canvas=null,ctx=null,dpr=1,timer=null,generation=0;
const state={state:'INITIALIZING',enabled:true,layer:'occurrence',tiles:[],visibleTiles:0,updatedAt:null,error:null,period:'1984-2024',source:'EC_JRC_GLOBAL_SURFACE_WATER_2024',attribution:'Source: EC JRC/Google',analysisBoundary:'The JRC web map service is an RGB cartographic representation. It is used here as observed historical surface-water context and is not decoded as numeric occurrence, depth, discharge, flood extent, or SAR measurement.'};
globalThis.OMEGA_WATER_OBSERVATION=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function wrapX(x,n){return ((x%n)+n)%n;}
function scaleZoom(scale){return Math.max(3,Math.min(13,Math.round(Math.log2(Math.max(1,Number(scale)||1))+2)));}
function viewSpan(b){return Array.isArray(b)&&b.length===4?{lon:b[2]-b[0],lat:b[3]-b[1]}:null;}
function chooseTiles(bbox,scale){
  const span=viewSpan(bbox);if(!span||span.lon<=0||span.lat<=0||span.lon>170||span.lat>85)return null;
  let z=scaleZoom(scale),selection=null;
  while(z>=2){
    const nw=lonLatToTile(bbox[0],bbox[3],z),se=lonLatToTile(bbox[2],bbox[1],z),n=2**z,x0=Math.floor(nw.x),x1=Math.floor(se.x),y0=Math.max(0,Math.floor(nw.y)),y1=Math.min(n-1,Math.floor(se.y)),tiles=[];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tiles.push({z,x:wrapX(x,n),y});
    selection={z,tiles};if(tiles.length<=MAX_TILES)break;z--;
  }
  return selection?.tiles?.length?selection:null;
}
async function loadTile(tile,signal){
  const key=`${state.layer}/${tile.z}/${tile.x}/${tile.y}`;if(cache.has(key))return cache.get(key);
  const promise=(async()=>{const response=await fetch(`/api/water/jrc?layer=${encodeURIComponent(state.layer)}&z=${tile.z}&x=${tile.x}&y=${tile.y}`,{signal,headers:{accept:'image/png'}});if(!response.ok)throw new Error(`JRC water ${response.status} ${key}`);const bitmap=await createImageBitmap(await response.blob());return {...tile,key,bitmap};})();
  cache.set(key,promise);try{return await promise;}catch(error){cache.delete(key);throw error;}
}
function ensureLayer(){
  if(!wrap||layer)return;
  const style=document.createElement('style');style.id='omegaJrcWaterStyle';style.textContent=`
  .omega-jrc-water-layer{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}.omega-jrc-water-layer canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.46}.omega-jrc-water-control{position:absolute;z-index:10;right:14px;top:166px;display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:9px;background:rgba(3,7,9,.82);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.13);font:700 7px Inter,Segoe UI,sans-serif;color:#a9b5ba;letter-spacing:.07em}.omega-jrc-water-control button{border:1px solid rgba(255,255,255,.14);border-radius:6px;background:rgba(255,255,255,.04);color:#dce7ea;padding:3px 5px;font:700 7px Inter,Segoe UI,sans-serif;cursor:pointer}.omega-jrc-water-control[data-ready=true]{border-color:rgba(103,204,235,.28)}@media(max-width:900px){.omega-jrc-water-control{right:8px;top:124px}}
  `;document.head.append(style);
  layer=document.createElement('div');layer.className='omega-jrc-water-layer';canvas=document.createElement('canvas');ctx=canvas.getContext('2d');layer.append(canvas);wrap.append(layer);
  const control=document.createElement('div');control.id='omegaJrcWaterControl';control.className='omega-jrc-water-control';control.innerHTML='<span data-label>JRC WATER 1984–2024 · WAITING</span><button type="button">ON</button>';control.querySelector('button').onclick=()=>{state.enabled=!state.enabled;control.querySelector('button').textContent=state.enabled?'ON':'OFF';draw();if(state.enabled)schedule(50);};wrap.append(control);
  new ResizeObserver(resize).observe(map);resize();
}
function updateControl(){const c=$('#omegaJrcWaterControl');if(!c)return;c.dataset.ready=state.state==='READY'?'true':'false';const label=c.querySelector('[data-label]');if(state.state==='READY')label.textContent=`JRC WATER ${state.period} · ${state.visibleTiles} TILES`;else if(state.error)label.textContent=`JRC WATER · ${state.error}`;else label.textContent=`JRC WATER ${state.period} · ${state.state.replaceAll('_',' ')}`;}
function drawTileWarp(r,tile){
  const {z,x,y,bitmap}=tile,c=ctx;if(!bitmap)return;const west=tileToLonLat(x,y,z).lon,east=tileToLonLat(x+1,y,z).lon;
  c.save();c.globalAlpha=.58;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  for(let s=0;s<STRIPS;s++){
    const f0=s/STRIPS,f1=(s+1)/STRIPS,lat0=tileToLonLat(x,y+f0,z).lat,lat1=tileToLonLat(x,y+f1,z).lat,pNW=r.project(west,lat0),pSE=r.project(east,lat1),dx=Math.min(pNW[0],pSE[0]),dy=Math.min(pNW[1],pSE[1]),dw=Math.abs(pSE[0]-pNW[0]),dh=Math.abs(pSE[1]-pNW[1]);if(dw<.2||dh<.2)continue;c.drawImage(bitmap,0,bitmap.height*f0,bitmap.width,bitmap.height*(f1-f0),dx,dy,dw+.7,dh+.7);
  }
  c.restore();
}
function draw(){
  if(!canvas||!ctx||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);state.visibleTiles=0;if(!state.enabled)return;const r=renderer();if(!r)return;for(const tile of state.tiles){drawTileWarp(r,tile);state.visibleTiles++;}updateControl();
}
async function load(){
  ensureLayer();const r=renderer();if(!r||!state.enabled)return;const bbox=r.viewBounds?.(),selection=chooseTiles(bbox,r.view.scale);if(!selection){state.tiles=[];state.state='OUT_OF_SCALE';state.error=null;draw();updateControl();return;}
  const my=++generation,snapshot=sarAuthority.capture(),controller=new AbortController();globalThis.OMEGA_JRC_WATER_ABORT?.abort?.();globalThis.OMEGA_JRC_WATER_ABORT=controller;state.state='LOADING';state.error=null;updateControl();
  try{const tiles=await Promise.all(selection.tiles.map(t=>loadTile(t,controller.signal)));if(my!==generation||controller.signal.aborted)return;if(!sarAuthority.accepts(snapshot,{target:false,camera:true,scene:false}))return;state.tiles=tiles;state.state='READY';state.updatedAt=new Date().toISOString();draw();window.dispatchEvent(new CustomEvent('omega-water-observation-update',{detail:snapshotState()}));}catch(error){if(my!==generation||error?.name==='AbortError')return;state.tiles=[];state.state='ERROR';state.error=error.message;draw();updateControl();}
}
function schedule(delay=500){clearTimeout(timer);timer=setTimeout(()=>load().catch(error=>{state.state='ERROR';state.error=error.message;updateControl();}),delay);}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function snapshotState(){return {state:state.state,enabled:state.enabled,layer:state.layer,period:state.period,source:state.source,attribution:state.attribution,visibleTiles:state.visibleTiles,updatedAt:state.updatedAt,analysisBoundary:state.analysisBoundary};}
function install(){ensureLayer();map?.addEventListener('omega-map-view',()=>{draw();schedule(650);});window.addEventListener('omega-sar-authority-change',event=>{if(event.detail?.kind==='CAMERA')schedule(650);});schedule(1100);}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
state.reload=()=>load();state.snapshot=snapshotState;
