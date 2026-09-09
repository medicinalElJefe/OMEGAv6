const map=document.querySelector('#map');
const wrap=map?.closest('.map-wrap');
const browse=document.querySelector('#browseImage');
const sceneEl=document.querySelector('#currentScene');
let view={centerLon:0,centerLat:0,scale:1};
let item=null,generation=0;

function wrapLon(v){let x=Number(v);while(x>180)x-=360;while(x<-180)x+=360;return x;}
function project(lon,lat,width,height){const dlon=wrapLon(Number(lon)-view.centerLon);return [width/2+dlon*(width/360)*view.scale,height/2-(Number(lat)-view.centerLat)*(height/180)*view.scale];}
function itemBbox(source){
  if(Array.isArray(source?.bbox)&&source.bbox.length===4&&source.bbox.every(Number.isFinite))return source.bbox;
  const pts=[];
  const walk=v=>{if(Array.isArray(v)&&v.length>=2&&Number.isFinite(v[0])&&Number.isFinite(v[1]))pts.push(v);else if(Array.isArray(v))v.forEach(walk);};walk(source?.geometry?.coordinates);
  if(!pts.length)return null;return [Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];
}
function outerRing(geometry){
  if(geometry?.type==='Polygon')return geometry.coordinates?.[0]||[];
  if(geometry?.type==='MultiPolygon')return geometry.coordinates?.[0]?.[0]||[];
  return [];
}
function clipPolygon(geometry,bbox){
  const ring=outerRing(geometry);if(!ring.length)return '';
  const [minLon,minLat,maxLon,maxLat]=bbox,dx=maxLon-minLon,dy=maxLat-minLat;if(dx<=0||dy<=0)return '';
  const points=ring.filter(p=>Number.isFinite(p?.[0])&&Number.isFinite(p?.[1])).map(([lon,lat])=>`${Math.max(0,Math.min(100,100*(lon-minLon)/dx)).toFixed(2)}% ${Math.max(0,Math.min(100,100*(maxLat-lat)/dy)).toFixed(2)}%`);
  return points.length>=3?`polygon(${points.join(',')})`:'';
}

function position(){
  if(!wrap||!item||!overlayImg.src)return;
  const rect=map.getBoundingClientRect(),box=itemBbox(item);if(!box)return;
  const [minLon,minLat,maxLon,maxLat]=box,[x0,y0]=project(minLon,maxLat,rect.width,rect.height),[x1,y1]=project(maxLon,minLat,rect.width,rect.height);
  const width=x1-x0,height=y1-y0;if(!Number.isFinite(width)||!Number.isFinite(height)||Math.abs(width)<1||Math.abs(height)<1){overlayImg.style.opacity='0';return;}
  overlayImg.style.left=`${x0}px`;overlayImg.style.top=`${y0}px`;overlayImg.style.width=`${width}px`;overlayImg.style.height=`${height}px`;overlayImg.style.clipPath=clipPolygon(item.geometry,box);overlayImg.style.opacity='0.86';
  badge.style.left=`${Math.max(10,Math.min(rect.width-250,x0+10))}px`;badge.style.top=`${Math.max(10,Math.min(rect.height-34,y0+10))}px`;badge.style.opacity='1';
}

async function loadCurrent(){
  const id=(sceneEl?.textContent||'').trim(),src=browse?.src||'';const my=++generation;
  if(!id||id==='—'||!src){item=null;overlayImg.removeAttribute('src');overlayImg.style.opacity='0';badge.style.opacity='0';return;}
  badge.textContent='SOURCE SAR · LOADING SCENE';badge.style.opacity='1';
  try{
    const response=await fetch(`/api/stac/item?id=${encodeURIComponent(id)}`,{headers:{accept:'application/geo+json,application/json'}});if(!response.ok)throw new Error(`scene ${response.status}`);
    const detail=await response.json();if(my!==generation)return;item=detail;overlayImg.src=src;
    badge.textContent=`SOURCE SAR · ${id}`;position();
    window.dispatchEvent(new CustomEvent('omega-source-sar-frame',{detail:{id,src,bbox:itemBbox(detail),geometry:detail.geometry,startTime:document.querySelector('#currentTime')?.textContent||null,evidenceClass:'SOURCE_BROWSE_VISUAL'}}));
  }catch(error){if(my!==generation)return;item=null;overlayImg.style.opacity='0';badge.textContent=`SOURCE SAR UNAVAILABLE · ${error.message}`;badge.style.opacity='1';}
}

let layer,overlayImg,badge;
if(wrap&&map){
  const style=document.createElement('style');style.textContent=`
  .sar-source-browse-layer{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}.sar-source-browse-layer img{position:absolute;display:block;object-fit:fill;filter:grayscale(1) contrast(1.28) brightness(.92);transition:opacity .18s linear;box-shadow:0 0 0 1px rgba(255,255,255,.12)}.sar-source-browse-badge{position:absolute;z-index:3;padding:6px 9px;border-radius:8px;background:rgba(5,7,9,.76);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.13);color:#e6e8e9;font:600 9px Inter,Segoe UI,sans-serif;letter-spacing:.04em;max-width:330px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:opacity .15s linear}
  .sar-earth-overlay{z-index:4!important}.place-navigator,.omega-field-hud,.omega-action-hud,.omega-cell-inspector{z-index:8!important}
  `;document.head.append(style);
  layer=document.createElement('div');layer.className='sar-source-browse-layer';overlayImg=document.createElement('img');overlayImg.alt='Current Sentinel-1 source SAR browse';overlayImg.decoding='async';overlayImg.style.opacity='0';badge=document.createElement('div');badge.className='sar-source-browse-badge';badge.style.opacity='0';layer.append(overlayImg,badge);wrap.append(layer);
  overlayImg.addEventListener('load',position);
  new ResizeObserver(position).observe(map);
  map.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(Number.isFinite(d.centerLon)&&Number.isFinite(d.centerLat)&&Number.isFinite(d.scale)){view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale};position();}});
  if(sceneEl)new MutationObserver(loadCurrent).observe(sceneEl,{childList:true,subtree:true,characterData:true});
  if(browse)new MutationObserver(loadCurrent).observe(browse,{attributes:true,attributeFilter:['src']});
  queueMicrotask(loadCurrent);
}
