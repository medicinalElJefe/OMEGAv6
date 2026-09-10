import { normalizeStacItem } from './stac.mjs';
import { geometryContainsPoint, geometryRings } from './geometry.mjs';
import { atlasLodForScale, translateFabricCell } from './lemma-state-calculus.mjs';

const $=s=>document.querySelector(s),map=$('#map'),wrap=map?.closest('.map-wrap');
const cache=new Map();
let layer=null,canvas=null,ctx=null,dpr=1,timer=null,generation=0,transitionRaf=0;
const state={state:'INITIALIZING',records:[],fabric:null,previousFabric:null,transitionStart:0,queries:0,lastKey:null,updatedAt:null,error:null,enabled:true,source:'EARTH_SEARCH_SENTINEL1_GRD_METADATA',boundary:'Global fabric is source-backed acquisition coverage/time/COG availability plus bounded continuity visualization. It is not a global calibrated SAR mosaic and does not synthesize missing backscatter pixels.'};
globalThis.OMEGA_SAR_GLOBAL_FABRIC=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function daysAgoIso(days){return new Date(Date.now()-Math.max(1,days)*86400000).toISOString();}
function normalizeBBox(b){if(!Array.isArray(b)||b.length!==4)return [-180,-85,180,85];const [w,s,e,n]=b.map(Number);if(![w,s,e,n].every(Number.isFinite)||e<=w||n<=s)return [-180,-85,180,85];return [Math.max(-180,w),Math.max(-85,s),Math.min(180,e),Math.min(85,n)];}
function bboxKey(b,scale){const q=scale<2.5?5:scale<12?2:scale<60?0.5:0.15;return [...b.map(v=>Math.round(v/q)*q),Math.round(Math.log2(Math.max(1,scale)))].join(':');}
function splitBBox(b,lonStep,latStep){const out=[];for(let south=b[1];south<b[3]-1e-9;south+=latStep){const north=Math.min(b[3],south+latStep);for(let west=b[0];west<b[2]-1e-9;west+=lonStep){const east=Math.min(b[2],west+lonStep);if(east>west&&north>south)out.push([west,south,east,north]);}}return out;}
function sectorsFor(b,scale){
  const lonSpan=b[2]-b[0],latSpan=b[3]-b[1];
  if(scale<=2.4||lonSpan>150)return splitBBox([-180,-85,180,85],60,56.6666667); // 18 spatially balanced world sectors.
  if(lonSpan>70||latSpan>42)return splitBBox(b,45,32);
  if(lonSpan>28||latSpan>22)return splitBBox(b,24,18);
  return [b];
}
async function querySector(bbox,signal,{days=365,limit=80}={}){
  const body={collections:['sentinel-1-grd'],bbox,datetime:`${daysAgoIso(days)}/..`,limit,sortby:[{field:'properties.datetime',direction:'desc'}]};
  const response=await fetch('/api/stac/search',{method:'POST',headers:{'content-type':'application/json','accept':'application/geo+json,application/json'},body:JSON.stringify(body),signal});
  if(!response.ok)throw new Error(`Global SAR STAC ${response.status}`);const fc=await response.json(),fetchedAt=new Date().toISOString();return (fc.features||[]).map(x=>normalizeStacItem(x,fetchedAt));
}
async function querySectors(sectors,signal,options){const groups=[];for(let i=0;i<sectors.length;i+=6){if(signal?.aborted)throw new DOMException('Global SAR query superseded','AbortError');groups.push(...await Promise.all(sectors.slice(i,i+6).map(b=>querySector(b,signal,options))));}return groups;}
function recordBbox(record){const b=record?.bbox;if(Array.isArray(b)&&b.length===4&&b.every(Number.isFinite))return b;const pts=[];for(const ring of geometryRings(record?.geometry))for(const p of ring)if(Number.isFinite(p?.[0])&&Number.isFinite(p?.[1]))pts.push(p);if(!pts.length)return null;return [Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];}
function prepareRecords(records){return records.map(r=>({...r,_fabricBbox:recordBbox(r),_fabricTime:new Date(r.startTime||0).getTime()})).filter(r=>r._fabricBbox&&Number.isFinite(r._fabricTime));}
function inBbox(lon,lat,b){return lon>=b[0]&&lon<=b[2]&&lat>=b[1]&&lat<=b[3];}
function previousLemmaAt(previous,ix,iy,cols,rows){if(!previous||previous.cols!==cols||previous.rows!==rows)return null;return previous.cells?.[iy*cols+ix]?.lemma||null;}
function buildFabric(records,bbox,view,previous=null){
  const lod=atlasLodForScale(view.scale,{width:view.width,height:view.height}),cols=lod.cols,rows=lod.rows,cells=[],now=Date.now();
  for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
    const lon=bbox[0]+(bbox[2]-bbox[0])*(ix+.5)/cols,lat=bbox[3]-(bbox[3]-bbox[1])*(iy+.5)/rows,hits=[];
    for(const r of records){if(!inBbox(lon,lat,r._fabricBbox))continue;if(geometryContainsPoint(r.geometry,lon,lat))hits.push(r);}
    let newest=null,sumAge=0,asc=0,desc=0,cog=0;
    for(const h of hits){const age=Math.max(0,(now-h._fabricTime)/3600000);if(newest==null||age<newest)newest=age;sumAge+=age;if(h.flightDirection==='ASCENDING')asc++;if(h.flightDirection==='DESCENDING')desc++;if(Object.keys(h.dataAssets||{}).length)cog++;}
    const mean=hits.length?sumAge/hits.length:null,orbitMix=hits.length?(asc-desc)/hits.length:0,lemma=translateFabricCell({coverage:hits.length,newestAgeHours:newest,meanAgeHours:mean,orbitMix,previous:previousLemmaAt(previous,ix,iy,cols,rows)});
    cells.push({ix,iy,lon,lat,coverage:hits.length,cog,newestAgeHours:newest,meanAgeHours:mean,orbitMix,lemma});
  }
  // Woven continuity is display continuity only: give source-adjacent empty cells a bounded support score without claiming SAR pixels.
  for(const c of cells){if(c.coverage)continue;let support=0,n=0;for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){if(!ox&&!oy)continue;const x=c.ix+ox,y=c.iy+oy;if(x<0||y<0||x>=cols||y>=rows)continue;const q=cells[y*cols+x];if(q.coverage)support+=Math.min(1,q.coverage/3);n++;}c.wovenDisplaySupport=n?support/n:0;}
  return {schema:'omega.sar.global-fabric.v1',bbox:[...bbox],cols,rows,cells,lod,recordCount:records.length,generatedAt:new Date().toISOString(),boundary:state.boundary};
}
function ensureLayer(){
  if(!wrap||layer)return;const style=document.createElement('style');style.id='omegaGlobalSarFabricStyle';style.textContent=`
  .omega-global-sar-fabric{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.omega-global-sar-fabric canvas{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen}.omega-global-sar-fabric-hud{position:absolute;z-index:10;left:14px;bottom:118px;min-width:250px;max-width:40%;padding:7px 9px;border-radius:9px;background:rgba(3,7,9,.76);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(14px);font-family:Inter,Segoe UI,sans-serif;color:#dce7ea;pointer-events:none}.omega-global-sar-fabric-hud b{display:block;font-size:8px;letter-spacing:.08em}.omega-global-sar-fabric-hud span{display:block;margin-top:2px;font-size:7px;color:#88989e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:900px){.omega-global-sar-fabric-hud{display:none}}
  `;document.head.append(style);layer=document.createElement('div');layer.className='omega-global-sar-fabric';canvas=document.createElement('canvas');ctx=canvas.getContext('2d');layer.append(canvas);wrap.append(layer);const hud=document.createElement('div');hud.id='omegaGlobalSarFabricHud';hud.className='omega-global-sar-fabric-hud';hud.innerHTML='<b>GLOBAL SAR FABRIC · MODE 188</b><span data-k="state">WAITING FOR CAMERA</span>';wrap.append(hud);new ResizeObserver(resize).observe(map);resize();
}
function colorFor(cell){
  const cov=cell.coverage,lemma=cell.lemma,recency=lemma.temporalSupport||0;if(cov){const alpha=Math.min(.34,.04+.04*Math.log1p(cov)+.12*recency);return `rgba(165,220,234,${alpha})`;}
  const w=cell.wovenDisplaySupport||0;return w>.08?`rgba(108,164,180,${Math.min(.06,.012+.05*w)})`:null;
}
function drawFabric(fabric,alpha=1){
  if(!fabric||!ctx)return;const r=renderer();if(!r)return;const {cols,rows,bbox,cells}=fabric,cw=(bbox[2]-bbox[0])/cols,ch=(bbox[3]-bbox[1])/rows;ctx.save();ctx.globalAlpha=alpha;
  for(const cell of cells){const fill=colorFor(cell);if(!fill)continue;const west=bbox[0]+cell.ix*cw,east=west+cw,north=bbox[3]-cell.iy*ch,south=north-ch,p0=r.project(west,north),p1=r.project(east,south),x=Math.min(p0[0],p1[0]),y=Math.min(p0[1],p1[1]),w=Math.abs(p1[0]-p0[0])+1,h=Math.abs(p1[1]-p0[1])+1;if(w<.2||h<.2)continue;ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(cell.coverage>=3&&w>7&&h>5){ctx.strokeStyle=`rgba(213,239,245,${Math.min(.22,.035+.018*cell.coverage)})`;ctx.lineWidth=.5;ctx.strokeRect(x+.25,y+.25,w-.5,h-.5);}}
  ctx.restore();
}
function draw(now=performance.now()){
  if(!canvas||!ctx||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);if(!state.enabled)return;const t=state.transitionStart?Math.max(0,Math.min(1,(now-state.transitionStart)/520)):1;if(state.previousFabric&&t<1)drawFabric(state.previousFabric,1-t);drawFabric(state.fabric,t);if(t<1){transitionRaf=requestAnimationFrame(draw);}else{state.previousFabric=null;state.transitionStart=0;transitionRaf=0;}updateHud();
}
function updateHud(){const h=$('#omegaGlobalSarFabricHud [data-k=state]');if(!h)return;if(state.error)h.textContent=`${state.state} · ${state.error}`;else if(state.fabric){const covered=state.fabric.cells.filter(c=>c.coverage>0).length,total=state.fabric.cells.length,cogs=state.fabric.cells.reduce((s,c)=>s+c.cog,0);h.textContent=`${state.records.length} recent scenes · ${covered}/${total} camera cells source-covered · ${cogs} COG supports · ${state.fabric.lod.atlasAddress} atlas LOD`;}else h.textContent=state.state.replaceAll('_',' ');}
function resize(){if(!canvas||!map)return;const rect=map.getBoundingClientRect();dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
async function refresh(){
  ensureLayer();const r=renderer();if(!r||!state.enabled)return;const bbox=normalizeBBox(r.viewBounds?.()),key=bboxKey(bbox,r.view.scale);if(key===state.lastKey&&state.fabric){draw();return;}const cached=cache.get(key);if(cached&&Date.now()-cached.at<300000){const previous=state.fabric;state.records=cached.records;state.previousFabric=previous;state.fabric=buildFabric(state.records,bbox,{scale:r.view.scale,width:r.w,height:r.h},previous);state.transitionStart=performance.now();state.lastKey=key;draw();return;}
  const my=++generation,controller=new AbortController();globalThis.OMEGA_GLOBAL_SAR_FABRIC_ABORT?.abort?.();globalThis.OMEGA_GLOBAL_SAR_FABRIC_ABORT=controller;state.state='QUERYING_GLOBAL_SAR';state.error=null;updateHud();
  try{const sectors=sectorsFor(bbox,r.view.scale),world=r.view.scale<=2.4||bbox[2]-bbox[0]>150,groups=await querySectors(sectors,controller.signal,{days:world?365:240,limit:world?24:Math.max(60,Math.ceil(180/Math.max(1,sectors.length)))});if(my!==generation||controller.signal.aborted)return;const byId=new Map();for(const group of groups)for(const rec of group)byId.set(rec.id,rec);const records=prepareRecords([...byId.values()]);cache.set(key,{at:Date.now(),records});if(cache.size>18)cache.delete(cache.keys().next().value);const previous=state.fabric;state.previousFabric=previous;state.records=records;state.fabric=buildFabric(records,bbox,{scale:r.view.scale,width:r.w,height:r.h},previous);state.transitionStart=performance.now();state.lastKey=key;state.queries+=sectors.length;state.updatedAt=new Date().toISOString();state.state='READY';if(transitionRaf)cancelAnimationFrame(transitionRaf);draw();window.dispatchEvent(new CustomEvent('omega-global-sar-fabric-update',{detail:snapshot()}));}
  catch(error){if(my!==generation||error?.name==='AbortError')return;state.state='ERROR';state.error=error.message;updateHud();}
}
function schedule(delay=700){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(()=>{}),delay);}
function snapshot(){return {state:state.state,recordCount:state.records.length,queries:state.queries,updatedAt:state.updatedAt,fabric:state.fabric?{bbox:state.fabric.bbox,cols:state.fabric.cols,rows:state.fabric.rows,lod:state.fabric.lod,recordCount:state.fabric.recordCount,coveredCells:state.fabric.cells.filter(c=>c.coverage>0).length}:null,boundary:state.boundary};}
function install(){ensureLayer();map?.addEventListener('omega-map-view',()=>{draw();schedule(850);});window.addEventListener('omega-camera-motion-settled',()=>schedule(80));window.addEventListener('omega-calibrated-sar-patch',draw);window.addEventListener('omega-regional-sar-measurement',draw);schedule(500);}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
state.refresh=refresh;state.snapshot=snapshot;state.draw=draw;
