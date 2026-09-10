import { sentinel1ProductAssets, supportTransportUrl, parseProductXml } from './sentinel1-calibration.mjs';
import { buildPatchGeoMesh } from './sar-registration.mjs';
import { drawMeshCellByBlades } from './sar-blade-geometry.mjs';

const map=document.querySelector('#map');
const wrap=map?.closest('.map-wrap');
const browse=document.querySelector('#browseImage');
const sceneEl=document.querySelector('#currentScene');
const MAX_BROWSE_MAIN_MAP_SCALE=260;
let view={centerLon:0,centerLat:0,scale:1};
let item=null,generation=0,ready=false,exactPatchVisible=false;
let layer,canvas,ctx,sourceImage,badge,geoMesh=null,registration=null;

function wrapLon(v){let x=Number(v);while(x>180)x-=360;while(x<-180)x+=360;return x;}
function project(lon,lat,width,height){const dlon=wrapLon(Number(lon)-view.centerLon);return [width/2+dlon*(width/360)*view.scale,height/2-(Number(lat)-view.centerLat)*(height/180)*view.scale];}
function itemBbox(source){
  if(Array.isArray(source?.bbox)&&source.bbox.length===4&&source.bbox.every(Number.isFinite))return source.bbox;
  const pts=[];const walk=v=>{if(Array.isArray(v)&&v.length>=2&&Number.isFinite(v[0])&&Number.isFinite(v[1]))pts.push(v);else if(Array.isArray(v))v.forEach(walk);};walk(source?.geometry?.coordinates);
  if(!pts.length)return null;return [Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];
}
function outerRing(geometry){
  const ring=geometry?.type==='Polygon'?geometry.coordinates?.[0]:geometry?.type==='MultiPolygon'?geometry.coordinates?.[0]?.[0]:null;
  if(!Array.isArray(ring))return [];
  const out=[];for(const p of ring){if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1]))continue;const q=[Number(p[0]),Number(p[1])];if(!out.length||Math.abs(out.at(-1)[0]-q[0])>1e-10||Math.abs(out.at(-1)[1]-q[1])>1e-10)out.push(q);}
  if(out.length>1&&Math.abs(out[0][0]-out.at(-1)[0])<1e-10&&Math.abs(out[0][1]-out.at(-1)[1])<1e-10)out.pop();
  return out;
}
function selectedPolarization(){return String(document.querySelector('#assetSelect')?.value||'vv').toLowerCase();}
function meshDimensions(product){
  const points=product?.points||[];
  const width=Number(product?.numberOfSamples)||Math.ceil(Math.max(0,...points.map(p=>Number(p.pixel)||0)))+1;
  const height=Number(product?.numberOfLines)||Math.ceil(Math.max(0,...points.map(p=>Number(p.line)||0)))+1;
  return width>1&&height>1?[width,height]:null;
}
function previewConforms(mesh,image){
  const [x0,y0,x1,y1]=mesh?.sourceWindow||[],sourceAspect=(x1-x0)/(y1-y0),previewAspect=Number(image?.naturalWidth)/Number(image?.naturalHeight);
  if(!(sourceAspect>0&&previewAspect>0))return {ok:false,score:0};
  const score=Math.min(sourceAspect/previewAspect,previewAspect/sourceAspect);
  return {ok:score>=.82,score};
}
async function resolveProductMesh(detail,signal){
  const assets=sentinel1ProductAssets(detail,selectedPolarization()),asset=assets?.product;
  const href=asset?.sourceHref||asset?.href;if(!href)return {mesh:null,registration:'FOOTPRINT_ONLY_NO_PRODUCT_GRID'};
  const response=await fetch(supportTransportUrl(href,'source'),{signal,headers:{accept:'application/xml,text/xml,text/plain,*/*'}});
  if(!response.ok)throw new Error(`product geolocation ${response.status}`);
  const product=parseProductXml(await response.text()),dims=meshDimensions(product);if(!dims||product.points.length<3)return {mesh:null,registration:'FOOTPRINT_ONLY_PRODUCT_GRID_INSUFFICIENT'};
  const mesh=buildPatchGeoMesh(product,[0,0,dims[0],dims[1]],12),coverage=mesh.totalNodeCount?mesh.validNodeCount/mesh.totalNodeCount:0;
  if(coverage<.82)return {mesh:null,registration:`FOOTPRINT_ONLY_GCP_COVERAGE_${Math.round(coverage*100)}`};
  return {mesh:{...mesh,sourceWindow:[0,0,dims[0],dims[1]],fullScene:true,measurementPromotion:false},registration:'SAFE_PRODUCT_GCP_FULL_SCENE_BLADE_MESH'};
}
function publishVisibility(mainMapVisible,reason){
  const detail={mainMapVisible,reason,scale:view.scale,threshold:MAX_BROWSE_MAIN_MAP_SCALE,ready,itemId:item?.id||null,registration,exactPatchVisible};
  globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY=detail;
  window.dispatchEvent(new CustomEvent('omega-source-sar-visibility',{detail}));
}
function resize(){
  if(!canvas||!map)return;const rect=map.getBoundingClientRect(),dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();
}
function drawFootprint(rect,alpha=.8){
  const ring=outerRing(item?.geometry);if(ring.length<3)return false;
  ctx.save();ctx.strokeStyle=`rgba(235,244,247,${alpha})`;ctx.lineWidth=1.1;ctx.setLineDash([5,4]);ctx.beginPath();ring.forEach(([lon,lat],i)=>{const p=project(lon,lat,rect.width,rect.height);if(i)ctx.lineTo(...p);else ctx.moveTo(...p)});ctx.closePath();ctx.stroke();ctx.restore();return true;
}
function drawRegisteredBrowse(rect){
  if(!geoMesh?.nodes||!sourceImage?.naturalWidth)return 0;
  const n=geoMesh.segments||geoMesh.nodes.length-1;let cells=0;
  for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=geoMesh.nodes[gy]?.[gx],q10=geoMesh.nodes[gy]?.[gx+1],q01=geoMesh.nodes[gy+1]?.[gx],q11=geoMesh.nodes[gy+1]?.[gx+1];
    if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;
    const dest=[project(q00.lon,q00.lat,rect.width,rect.height),project(q10.lon,q10.lat,rect.width,rect.height),project(q01.lon,q01.lat,rect.width,rect.height),project(q11.lon,q11.lat,rect.width,rect.height)];
    if(drawMeshCellByBlades(ctx,sourceImage,geoMesh.sourceWindow,[q00,q10,q01,q11],dest,{alpha:.38,filter:'grayscale(1) contrast(1.16) brightness(.94)'}))cells++;
  }
  return cells;
}
function draw(){
  if(!canvas||!ctx||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);canvas.dataset.ready=ready?'true':'false';canvas.dataset.mainMapVisible='false';
  if(!item||!ready||!sourceImage?.naturalWidth){badge.style.opacity='0';publishVisibility(false,'SOURCE_NOT_READY');return;}
  drawFootprint(rect,exactPatchVisible?.42:.78);
  if(exactPatchVisible){
    badge.textContent='SOURCE SUPPORT · FOOTPRINT ONLY · EXACT CALIBRATED SAR IS PRIMARY';badge.style.left='14px';badge.style.top=`${Math.max(12,rect.height-54)}px`;badge.style.opacity='.7';publishVisibility(false,'EXACT_PATCH_PRIMARY');return;
  }
  if(view.scale>MAX_BROWSE_MAIN_MAP_SCALE){
    badge.textContent='SOURCE SUPPORT · REGIONAL BROWSE HIDDEN AT LOCAL SCALE · EXACT GCP PATCH REQUIRED';badge.style.left='14px';badge.style.top=`${Math.max(12,rect.height-54)}px`;badge.style.opacity='.72';publishVisibility(false,'LOCAL_SCALE_REQUIRES_EXACT_GCP');return;
  }
  if(!geoMesh){
    badge.textContent=`SOURCE SUPPORT · TRUE FOOTPRINT ONLY · ${registration||'PIXEL REGISTRATION UNRESOLVED'}`;badge.style.left='14px';badge.style.top=`${Math.max(12,rect.height-54)}px`;badge.style.opacity='.8';publishVisibility(false,'FOOTPRINT_ONLY');return;
  }
  const conformity=previewConforms(geoMesh,sourceImage);if(!conformity.ok){
    badge.textContent=`SOURCE SUPPORT · PREVIEW NOT WARPED · RASTER ASPECT NOT PROVEN (${Math.round(conformity.score*100)}%)`;badge.style.left='14px';badge.style.top=`${Math.max(12,rect.height-54)}px`;badge.style.opacity='.8';publishVisibility(false,'PREVIEW_RASTER_CONFORMITY_UNRESOLVED');return;
  }
  const cells=drawRegisteredBrowse(rect);canvas.dataset.mainMapVisible=cells?'true':'false';
  badge.textContent=cells?`SOURCE SUPPORT · GCP BLADE-REGISTERED FULL-SCENE BROWSE · ${item.id||''}`:'SOURCE SUPPORT · GCP MESH DRAW UNRESOLVED';badge.style.left='14px';badge.style.top=`${Math.max(12,rect.height-54)}px`;badge.style.opacity=cells?'.88':'.72';
  publishVisibility(cells>0,cells?'GCP_BLADE_REGISTERED_SOURCE_BROWSE':'GCP_MESH_DRAW_UNRESOLVED');
}
async function loadCurrent(){
  const id=(sceneEl?.textContent||'').trim(),src=browse?.src||'',my=++generation;ready=false;geoMesh=null;registration=null;
  if(!id||id==='—'||!src){item=null;sourceImage.removeAttribute('src');badge.style.opacity='0';draw();return;}
  const controller=new AbortController();globalThis.OMEGA_SAR_BROWSE_ABORT?.abort?.();globalThis.OMEGA_SAR_BROWSE_ABORT=controller;
  badge.textContent='SOURCE SUPPORT · RESOLVING FULL-SCENE PRODUCT GCP MESH';badge.style.opacity='1';
  try{
    const response=await fetch(`/api/stac/item?id=${encodeURIComponent(id)}`,{signal:controller.signal,headers:{accept:'application/geo+json,application/json'}});if(!response.ok)throw new Error(`scene ${response.status}`);
    const detail=await response.json();if(my!==generation)return;item=detail;
    const meshResult=await resolveProductMesh(detail,controller.signal).catch(error=>({mesh:null,registration:`FOOTPRINT_ONLY_${error.message}`}));if(my!==generation)return;geoMesh=meshResult.mesh;registration=meshResult.registration;
    await new Promise((resolve,reject)=>{sourceImage.onload=resolve;sourceImage.onerror=()=>reject(new Error('browse image load failed'));sourceImage.src=src});if(my!==generation)return;ready=true;draw();
    const frame={id,src,bbox:itemBbox(detail),geometry:detail.geometry,startTime:document.querySelector('#currentTime')?.textContent||null,evidenceClass:'SOURCE_BROWSE_VISUAL',registration,geoMeshState:geoMesh?.state||null,mainMapVisible:view.scale<=MAX_BROWSE_MAIN_MAP_SCALE&&!!geoMesh,measurementPromotion:false,semantics:'Source browse support is mapped only when the full-scene preview conforms to the source raster aspect and a Sentinel-1 SAFE product GCP mesh is available. Otherwise only the authoritative scene footprint is drawn. Browse pixels are never promoted to calibrated measurement evidence.'};
    globalThis.OMEGA_SAR_SOURCE_FRAME=frame;window.dispatchEvent(new CustomEvent('omega-source-sar-frame',{detail:frame}));
  }catch(error){if(my!==generation||error?.name==='AbortError')return;item=null;geoMesh=null;registration='SOURCE_UNAVAILABLE';ready=false;draw();badge.textContent=`SOURCE SUPPORT UNAVAILABLE · ${error.message}`;badge.style.opacity='1';}
}

if(wrap&&map){
  const style=document.createElement('style');style.textContent=`
  .sar-source-browse-layer{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}.sar-source-browse-layer canvas{position:absolute;inset:0;width:100%;height:100%;display:block}.sar-source-browse-layer img{display:none!important}.sar-source-browse-badge{position:absolute;z-index:3;padding:6px 9px;border-radius:8px;background:rgba(5,7,9,.78);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);color:#e6e8e9;font:600 9px Inter,Segoe UI,sans-serif;letter-spacing:.04em;max-width:650px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:opacity .15s linear}.sar-earth-overlay{z-index:4!important}.place-navigator,.omega-field-hud,.omega-action-hud,.omega-cell-inspector,.omega-map-nav,.omega-blade-lens{z-index:8!important}
  `;document.head.append(style);
  layer=document.createElement('div');layer.className='sar-source-browse-layer';canvas=document.createElement('canvas');canvas.className='sar-source-browse-canvas';canvas.dataset.ready='false';canvas.dataset.mainMapVisible='false';ctx=canvas.getContext('2d');sourceImage=document.createElement('img');sourceImage.alt='Current Sentinel-1 source SAR browse';sourceImage.decoding='async';badge=document.createElement('div');badge.className='sar-source-browse-badge';badge.style.opacity='0';layer.append(canvas,sourceImage,badge);wrap.append(layer);
  new ResizeObserver(resize).observe(map);resize();
  map.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(Number.isFinite(d.centerLon)&&Number.isFinite(d.centerLat)&&Number.isFinite(d.scale)){view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale};draw();}});
  window.addEventListener('omega-calibrated-sar-patch',()=>{exactPatchVisible=true;draw();});
  window.addEventListener('omega-calibrated-sar-patch-clear',()=>{exactPatchVisible=false;draw();});
  if(sceneEl)new MutationObserver(loadCurrent).observe(sceneEl,{childList:true,subtree:true,characterData:true});
  if(browse)new MutationObserver(loadCurrent).observe(browse,{attributes:true,attributeFilter:['src']});
  document.querySelector('#assetSelect')?.addEventListener('change',loadCurrent);
  queueMicrotask(loadCurrent);
}
