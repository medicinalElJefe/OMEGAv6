const map=document.querySelector('#map');
const wrap=map?.closest('.map-wrap');
const browse=document.querySelector('#browseImage');
const sceneEl=document.querySelector('#currentScene');
let view={centerLon:0,centerLat:0,scale:1};
let item=null,generation=0,ready=false;
let layer,canvas,ctx,sourceImage,badge;

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
function distinctCorners(geometry){
  const pts=outerRing(geometry);if(pts.length<4)return null;
  const pick=score=>pts.reduce((best,p)=>!best||score(p)<score(best)?p:best,null);
  const pickMax=score=>pts.reduce((best,p)=>!best||score(p)>score(best)?p:best,null);
  const nw=pick(([lon,lat])=>lon-lat),ne=pickMax(([lon,lat])=>lon+lat),se=pickMax(([lon,lat])=>lon-lat),sw=pick(([lon,lat])=>lon+lat);
  const corners=[nw,ne,se,sw];
  const keys=new Set(corners.map(p=>`${p[0].toFixed(8)},${p[1].toFixed(8)}`));
  if(keys.size<4){
    const center=[pts.reduce((a,p)=>a+p[0],0)/pts.length,pts.reduce((a,p)=>a+p[1],0)/pts.length];
    const ordered=[...pts].sort((a,b)=>Math.atan2(-(a[1]-center[1]),a[0]-center[0])-Math.atan2(-(b[1]-center[1]),b[0]-center[0]));
    if(ordered.length>=4)return [ordered[0],ordered[Math.floor(ordered.length/4)],ordered[Math.floor(ordered.length/2)],ordered[Math.floor(3*ordered.length/4)]];
  }
  return corners;
}
function triangleTransform(s0,s1,s2,d0,d1,d2){
  const [x0,y0]=s0,[x1,y1]=s1,[x2,y2]=s2,[u0,v0]=d0,[u1,v1]=d1,[u2,v2]=d2;
  const den=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);if(Math.abs(den)<1e-9)return null;
  return {
    a:(u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/den,
    c:(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/den,
    e:(u0*(x1*y2-x2*y1)+u1*(x2*y0-x0*y2)+u2*(x0*y1-x1*y0))/den,
    b:(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/den,
    d:(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/den,
    f:(v0*(x1*y2-x2*y1)+v1*(x2*y0-x0*y2)+v2*(x0*y1-x1*y0))/den
  };
}
function drawTriangle(image,s0,s1,s2,d0,d1,d2){
  const t=triangleTransform(s0,s1,s2,d0,d1,d2);if(!t)return false;
  ctx.save();ctx.beginPath();ctx.moveTo(...d0);ctx.lineTo(...d1);ctx.lineTo(...d2);ctx.closePath();ctx.clip();
  ctx.globalAlpha=.86;ctx.filter='grayscale(1) contrast(1.28) brightness(.92)';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.transform(t.a,t.b,t.c,t.d,t.e,t.f);ctx.drawImage(image,0,0);ctx.restore();return true;
}
function resize(){
  if(!canvas||!map)return;const rect=map.getBoundingClientRect(),dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();
}
function draw(){
  if(!canvas||!ctx||!map)return;const rect=map.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);canvas.dataset.ready='false';
  if(!item||!ready||!sourceImage?.naturalWidth)return;
  const corners=distinctCorners(item.geometry),ring=outerRing(item.geometry);if(!corners||ring.length<4)return;
  const dest=corners.map(p=>project(p[0],p[1],rect.width,rect.height));const [nw,ne,se,sw]=dest,w=sourceImage.naturalWidth,h=sourceImage.naturalHeight;
  ctx.save();ctx.beginPath();ring.forEach(([lon,lat],i)=>{const p=project(lon,lat,rect.width,rect.height);if(i)ctx.lineTo(...p);else ctx.moveTo(...p)});ctx.closePath();ctx.clip();
  drawTriangle(sourceImage,[0,0],[w,0],[w,h],nw,ne,se);drawTriangle(sourceImage,[0,0],[w,h],[0,h],nw,se,sw);ctx.restore();
  canvas.dataset.ready='true';
  const ys=dest.map(p=>p[1]),xs=dest.map(p=>p[0]),left=Math.max(10,Math.min(rect.width-290,Math.min(...xs)+10)),top=Math.max(10,Math.min(rect.height-36,Math.min(...ys)+10));badge.style.left=`${left}px`;badge.style.top=`${top}px`;badge.style.opacity='1';
}
async function loadCurrent(){
  const id=(sceneEl?.textContent||'').trim(),src=browse?.src||'';const my=++generation;ready=false;
  if(!id||id==='—'||!src){item=null;sourceImage.removeAttribute('src');badge.style.opacity='0';draw();return;}
  badge.textContent='SOURCE SAR · LOADING FOOTPRINT REGISTRATION';badge.style.opacity='1';
  try{
    const response=await fetch(`/api/stac/item?id=${encodeURIComponent(id)}`,{headers:{accept:'application/geo+json,application/json'}});if(!response.ok)throw new Error(`scene ${response.status}`);
    const detail=await response.json();if(my!==generation)return;item=detail;
    await new Promise((resolve,reject)=>{sourceImage.onload=resolve;sourceImage.onerror=()=>reject(new Error('browse image load failed'));sourceImage.src=src});if(my!==generation)return;ready=true;
    badge.textContent=`SOURCE SAR · FOOTPRINT REGISTERED · ${id}`;draw();
    const frame={id,src,bbox:itemBbox(detail),geometry:detail.geometry,startTime:document.querySelector('#currentTime')?.textContent||null,evidenceClass:'SOURCE_BROWSE_VISUAL',registration:'FOOTPRINT_QUAD_WARP',measurementPromotion:false,semantics:'Source browse visual warped to published Sentinel-1 scene footprint. Exact pixel geolocation requires the product GCP/calibrated layer.'};
    globalThis.OMEGA_SAR_SOURCE_FRAME=frame;window.dispatchEvent(new CustomEvent('omega-source-sar-frame',{detail:frame}));
  }catch(error){if(my!==generation)return;item=null;ready=false;draw();badge.textContent=`SOURCE SAR UNAVAILABLE · ${error.message}`;badge.style.opacity='1';}
}

if(wrap&&map){
  const style=document.createElement('style');style.textContent=`
  .sar-source-browse-layer{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}.sar-source-browse-layer canvas{position:absolute;inset:0;width:100%;height:100%;display:block}.sar-source-browse-layer img{display:none!important}.sar-source-browse-badge{position:absolute;z-index:3;padding:6px 9px;border-radius:8px;background:rgba(5,7,9,.78);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);color:#e6e8e9;font:600 9px Inter,Segoe UI,sans-serif;letter-spacing:.04em;max-width:360px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:opacity .15s linear}.sar-earth-overlay{z-index:4!important}.place-navigator,.omega-field-hud,.omega-action-hud,.omega-cell-inspector,.omega-map-nav{z-index:8!important}
  `;document.head.append(style);
  layer=document.createElement('div');layer.className='sar-source-browse-layer';canvas=document.createElement('canvas');canvas.className='sar-source-browse-canvas';canvas.dataset.ready='false';ctx=canvas.getContext('2d');sourceImage=document.createElement('img');sourceImage.alt='Current Sentinel-1 source SAR browse';sourceImage.decoding='async';badge=document.createElement('div');badge.className='sar-source-browse-badge';badge.style.opacity='0';layer.append(canvas,sourceImage,badge);wrap.append(layer);
  new ResizeObserver(resize).observe(map);resize();
  map.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(Number.isFinite(d.centerLon)&&Number.isFinite(d.centerLat)&&Number.isFinite(d.scale)){view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale};draw();}});
  if(sceneEl)new MutationObserver(loadCurrent).observe(sceneEl,{childList:true,subtree:true,characterData:true});
  if(browse)new MutationObserver(loadCurrent).observe(browse,{attributes:true,attributeFilter:['src']});
  queueMicrotask(loadCurrent);
}
