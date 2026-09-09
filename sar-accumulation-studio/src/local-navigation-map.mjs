const map=document.querySelector('#map');
const wrap=map?.closest('.map-wrap');
const MIN_SCALE=140;
const MAX_TILES=48;
let view={centerLon:0,centerLat:0,scale:1};
let layer,badge;

function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)));}
function wrapLon(v){let x=Number(v);while(x>180)x-=360;while(x<-180)x+=360;return x;}
function lon2x(lon,z){return (wrapLon(lon)+180)/360*(2**z);}
function lat2y(lat,z){const r=clamp(lat,-85.05112878,85.05112878)*Math.PI/180;return (1-Math.asinh(Math.tan(r))/Math.PI)/2*(2**z);}
function x2lon(x,z){return x/(2**z)*360-180;}
function y2lat(y,z){const n=Math.PI-2*Math.PI*y/(2**z);return 180/Math.PI*Math.atan(Math.sinh(n));}
function project(lon,lat,w,h){const dlon=wrapLon(lon-view.centerLon);return [w/2+dlon*(w/360)*view.scale,h/2-(lat-view.centerLat)*(h/180)*view.scale];}
function bounds(){const spanLon=360/view.scale,spanLat=180/view.scale;return [view.centerLon-spanLon/2,view.centerLat-spanLat/2,view.centerLon+spanLon/2,view.centerLat+spanLat/2];}
function zoomForView(w){return clamp(Math.round(Math.log2(Math.max(1,w*view.scale/256))),2,17);}
function tileKey(z,x,y){return `${z}/${x}/${y}`;}

function draw(){
  if(!layer||!map)return;
  const rect=map.getBoundingClientRect();
  if(view.scale<MIN_SCALE||rect.width<80||rect.height<80){layer.style.display='none';return;}
  layer.style.display='block';
  const z=zoomForView(rect.width),n=2**z,[minLon,minLat,maxLon,maxLat]=bounds();
  const x0=Math.floor(lon2x(minLon,z))-1,x1=Math.floor(lon2x(maxLon,z))+1;
  const y0=Math.max(0,Math.floor(lat2y(maxLat,z))-1),y1=Math.min(n-1,Math.floor(lat2y(minLat,z))+1);
  const wanted=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(wanted.length>=MAX_TILES)break;wanted.push([x,y]);}
  const keep=new Set();
  for(const [xRaw,y] of wanted){
    const x=((xRaw%n)+n)%n,key=tileKey(z,x,y);keep.add(key);
    let img=layer.querySelector(`img[data-key="${key}"]`);
    if(!img){img=document.createElement('img');img.dataset.key=key;img.alt='';img.decoding='async';img.loading='eager';img.referrerPolicy='origin';img.src=`https://tile.openstreetmap.org/${z}/${x}/${y}.png`;layer.append(img);}
    const west=x2lon(xRaw,z),east=x2lon(xRaw+1,z),north=y2lat(y,z),south=y2lat(y+1,z);
    const [left,top]=project(west,north,rect.width,rect.height),[right,bottom]=project(east,south,rect.width,rect.height);
    img.style.left=`${left}px`;img.style.top=`${top}px`;img.style.width=`${Math.max(1,right-left+.5)}px`;img.style.height=`${Math.max(1,bottom-top+.5)}px`;
  }
  for(const img of [...layer.querySelectorAll('img[data-key]')])if(!keep.has(img.dataset.key))img.remove();
  badge.textContent=`LOCAL NAVIGATION · OSM z${z} · ${Math.round(view.scale)}×`;
  globalThis.OMEGA_SAR_LOCAL_MAP={active:true,zoom:z,scale:view.scale,tileCount:keep.size};
}

if(wrap&&map){
  const style=document.createElement('style');style.textContent=`.omega-local-nav-map{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;background:#d9d5ca}.omega-local-nav-map img{position:absolute;display:block;max-width:none;user-select:none}.omega-local-nav-badge{position:absolute;right:12px;bottom:52px;z-index:7;padding:5px 8px;border-radius:7px;background:rgba(5,7,9,.76);border:1px solid rgba(255,255,255,.14);color:#eef1f2;font:600 9px Inter,Segoe UI,sans-serif;letter-spacing:.03em;pointer-events:auto}.omega-local-nav-badge a{color:inherit;text-decoration:none}.omega-local-nav-badge a:hover{text-decoration:underline}`;document.head.append(style);
  layer=document.createElement('div');layer.className='omega-local-nav-map';layer.style.display='none';
  badge=document.createElement('div');badge.className='omega-local-nav-badge';badge.innerHTML='LOCAL NAVIGATION · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>';
  wrap.append(layer,badge);badge.style.display='none';
  map.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(![d.centerLon,d.centerLat,d.scale].every(Number.isFinite))return;view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale};badge.style.display=view.scale>=MIN_SCALE?'block':'none';draw();});
  new ResizeObserver(draw).observe(map);
  queueMicrotask(draw);
}
