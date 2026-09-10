import { lonLatToTile, terrariumElevation, deriveWaterGeometry, waterGeometrySummary } from './water-geometry-core.mjs';
import { sarAuthority } from './sar-authority.mjs';

const map=document.querySelector('#map');
const TILE=256,MAX_TILES=24,MAX_GRID=256;
const tileCache=new Map();
let timer=null,generation=0,controller=null;
const state={state:'INITIALIZING',stage:null,terrain:null,water:null,updatedAt:null,error:null,tileCache,policy:{maxTiles:MAX_TILES,maxGrid:MAX_GRID,source:'AWS_OPEN_DATA_TERRAIN_TILES_TERRARIUM'},boundary:'Elevation is source terrain context. Derived slope/aspect/curvature/drainage are computed display/context fields and are not SAR measurements, observed water, or surveyed 3-D geometry.'};
globalThis.OMEGA_DATA_NATIVE_TERRAIN=state;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function wrapX(x,n){return ((x%n)+n)%n;}
function chooseZoom(scale){return clamp(Math.round(Math.log2(Math.max(1,Number(scale)||1))+2),2,11);}
function tileSelection(bbox,scale){
  if(!Array.isArray(bbox)||bbox.length!==4||!bbox.every(Number.isFinite))return null;
  let [west,south,east,north]=bbox;west=clamp(west,-180,180);east=clamp(east,-180,180);south=clamp(south,-85.05112878,85.05112878);north=clamp(north,-85.05112878,85.05112878);
  if(!(east>west&&north>south))return null;
  let z=chooseZoom(scale),result=null;
  while(z>=1){
    const nw=lonLatToTile(west,north,z),se=lonLatToTile(east,south,z),n=2**z,x0=Math.floor(nw.x),x1=Math.max(x0,Math.ceil(se.x-1e-10)-1),y0=clamp(Math.floor(nw.y),0,n-1),y1=clamp(Math.max(y0,Math.ceil(se.y-1e-10)-1),0,n-1),unique=new Map();
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const xx=wrapX(x,n),key=`${z}/${xx}/${y}`;unique.set(key,{z,x:xx,y,key});}
    const tiles=[...unique.values()];result={z,tiles};if(tiles.length<=MAX_TILES)break;z--;
  }
  return result;
}
async function loadTile(tile,signal){
  if(tileCache.has(tile.key))return tileCache.get(tile.key);
  const promise=(async()=>{const response=await fetch(`/api/terrain?z=${tile.z}&x=${tile.x}&y=${tile.y}`,{signal,headers:{accept:'image/png'}});if(!response.ok)throw new Error(`terrain ${response.status} ${tile.key}`);const bitmap=await createImageBitmap(await response.blob()),c=document.createElement('canvas');c.width=TILE;c.height=TILE;const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(bitmap,0,0);bitmap.close?.();return {...tile,data:q.getImageData(0,0,TILE,TILE).data};})();
  tileCache.set(tile.key,promise);try{return await promise;}catch(error){tileCache.delete(tile.key);throw error;}
}
function elevationAt(tileMap,lon,lat,z){
  const p=lonLatToTile(lon,lat,z),n=2**z,x=wrapX(Math.floor(p.x),n),y=clamp(Math.floor(p.y),0,n-1),tile=tileMap.get(`${z}/${x}/${y}`);if(!tile)return NaN;
  const px=clamp(Math.floor((p.x-Math.floor(p.x))*TILE),0,TILE-1),py=clamp(Math.floor((p.y-Math.floor(p.y))*TILE),0,TILE-1),i=(py*TILE+px)*4;return terrariumElevation(tile.data[i],tile.data[i+1],tile.data[i+2]);
}
function gridSize(bbox,scale){
  const lonSpan=Math.max(.0001,bbox[2]-bbox[0]),latSpan=Math.max(.0001,bbox[3]-bbox[1]),detail=clamp(Math.round(144+Math.log2(Math.max(1,scale))*16),144,MAX_GRID),ratio=clamp((latSpan/lonSpan)*2,.28,1.25),width=detail,height=clamp(Math.round(detail*ratio),64,MAX_GRID);return {width,height};
}
function emit(){window.dispatchEvent(new CustomEvent('omega-data-native-terrain',{detail:{state:state.state,stage:state.stage,terrain:state.terrain?{bbox:state.terrain.bbox,width:state.terrain.width,height:state.terrain.height,z:state.terrain.z,min:state.terrain.min,max:state.terrain.max,tileCount:state.terrain.tileCount,source:state.terrain.source}:null,water:state.water?{summary:state.water.summary}:null,error:state.error,updatedAt:state.updatedAt}}));}
async function load(){
  const r=renderer();if(!r)return;const bbox=r.viewBounds?.(),selection=tileSelection(bbox,r.view.scale);if(!selection)return;
  controller?.abort();controller=new AbortController();const signal=controller.signal,my=++generation,snapshot=sarAuthority.capture();state.state='LOADING';state.stage='TERRAIN_TILES';state.error=null;emit();
  try{
    const tiles=await Promise.all(selection.tiles.map(t=>loadTile(t,signal)));if(signal.aborted||my!==generation)return;if(!sarAuthority.accepts(snapshot,{target:false,camera:true,scene:false}))return;
    state.stage='TERRAIN_GRID';const tileMap=new Map(tiles.map(t=>[t.key,t])),size=gridSize(bbox,r.view.scale),elevation=new Float64Array(size.width*size.height);let min=Infinity,max=-Infinity,valid=0;
    for(let y=0;y<size.height;y++){const lat=bbox[3]-(bbox[3]-bbox[1])*(y/(size.height-1));for(let x=0;x<size.width;x++){const lon=bbox[0]+(bbox[2]-bbox[0])*(x/(size.width-1)),z=elevationAt(tileMap,lon,lat,selection.z),i=y*size.width+x;elevation[i]=z;if(Number.isFinite(z)){min=Math.min(min,z);max=Math.max(max,z);valid++;}}}
    if(valid<size.width*size.height*.88)throw new Error(`terrain grid support ${Math.round(valid/(size.width*size.height)*100)}% below 88%`);
    state.stage='WATER_GEOMETRY';const waterGeometry=deriveWaterGeometry(elevation,size.width,size.height,{lonSpanDeg:bbox[2]-bbox[0],latSpanDeg:bbox[3]-bbox[1],centerLat:(bbox[1]+bbox[3])/2});
    state.terrain={schema:'omega.data-native.terrain.v1',bbox:[...bbox],width:size.width,height:size.height,z:selection.z,elevation,min,max,tileCount:tiles.length,source:'AWS_OPEN_DATA_TERRAIN_TILES',rawDem:true,measuredSar:false};state.water={geometry:waterGeometry,summary:waterGeometrySummary(waterGeometry),source:'DERIVED_FROM_DEM',observedWater:false};state.state='READY';state.stage='READY';state.updatedAt=new Date().toISOString();state.error=null;emit();
  }catch(error){if(signal.aborted||my!==generation)return;state.state='ERROR';state.stage='FAILED';state.error=error.message;emit();}
}
function schedule(delay=520){clearTimeout(timer);timer=setTimeout(()=>load().catch(error=>{state.state='ERROR';state.error=error.message;emit();}),delay);}
function install(){map?.addEventListener('omega-map-view',()=>schedule(620));map?.addEventListener('omega-map-select',()=>schedule(120));window.addEventListener('omega-sar-authority-change',event=>{if(['TARGET','CAMERA'].includes(event.detail?.kind))schedule(300);});schedule(900);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);
state.reload=()=>load();state.schedule=schedule;
