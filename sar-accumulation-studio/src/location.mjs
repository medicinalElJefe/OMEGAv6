const $=s=>document.querySelector(s);
const map=$('#map');
const wrap=map?.closest('.map-wrap');
const R_EARTH_KM=6371.0088;
const cache=new Map();
let nextLookupAt=0;
let centerTimer=null;
let centerGeneration=0;
let selectedGeneration=0;

function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)));}
function coord(value,pos,neg){const n=Number(value);return Number.isFinite(n)?`${Math.abs(n).toFixed(5)}° ${n>=0?pos:neg}`:'—';}
function compactPlace(place){if(!place)return null;const parts=[];for(const value of [place.name,place.locality,place.region,place.country])if(value&&!parts.some(x=>String(x).toLowerCase()===String(value).toLowerCase()))parts.push(value);return parts.slice(0,4).join(', ')||place.displayName||null;}
function primaryPlace(place,fallback='Selected SAR target'){return place?.name||place?.locality||place?.region||place?.country||fallback;}
function secondaryPlace(place){if(!place)return 'Published place name unavailable — exact WGS84 target retained.';const pieces=[];for(const value of [place.locality,place.region,place.country])if(value&&!pieces.includes(value)&&value!==primaryPlace(place))pieces.push(value);return pieces.join(' · ')||place.displayName||'Published Earth location';}
function zoomFromScale(scale){const s=Math.max(1,Number(scale)||1);if(s>=700)return 16;if(s>=180)return 15;if(s>=18)return 14;if(s>=10)return 13;if(s>=5)return 11;if(s>=2)return 8;return 4;}
function horizontalSpanKm(detail){const scale=Math.max(1,Number(detail?.scale)||1),lat=clamp(detail?.centerLat,-89.9,89.9),lonSpan=Math.min(360,360/scale);return 2*Math.PI*R_EARTH_KM*Math.cos(lat*Math.PI/180)*(lonSpan/360);}
function niceScaleKm(spanKm){const target=Math.max(.01,spanKm*.16),magnitude=10**Math.floor(Math.log10(target)),norm=target/magnitude,step=norm>=5?5:norm>=2?2:1;return step*magnitude;}
function formatDistance(km){if(km>=1000)return `${Math.round(km/100)*100} km`;if(km>=10)return `${Math.round(km)} km`;if(km>=1)return `${km.toFixed(1)} km`;return `${Math.max(1,Math.round(km*1000))} m`;}
async function throttle(){const now=Date.now();if(now<nextLookupAt)await new Promise(r=>setTimeout(r,nextLookupAt-now));nextLookupAt=Date.now()+1050;}
async function fetchJson(url,key){if(cache.has(key))return cache.get(key);await throttle();const response=await fetch(url,{headers:{accept:'application/json'}});if(!response.ok)throw new Error(`Place lookup ${response.status}`);const value=await response.json();cache.set(key,value);if(cache.size>160)cache.delete(cache.keys().next().value);return value;}
async function reverse(lat,lon,zoom=10){const key=`r:${Number(lat).toFixed(4)}:${Number(lon).toFixed(4)}:${zoom}`;return fetchJson(`/api/place/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=${encodeURIComponent(zoom)}`,key);}
async function search(query){const q=String(query||'').trim();if(q.length<2)return [];return fetchJson(`/api/place/search?q=${encodeURIComponent(q)}`,`s:${q.toLowerCase()}`);}
async function waitNavigation(timeout=3000){const start=performance.now();while(performance.now()-start<timeout){const nav=globalThis.OMEGA_SAR_NAVIGATION;if(nav?.selectTarget)return nav;await new Promise(r=>setTimeout(r,25));}return globalThis.OMEGA_SAR_NAVIGATION||null;}

function installDockStyle(){
  if($('#omegaLocationDockStyle'))return;
  const style=document.createElement('style');style.id='omegaLocationDockStyle';style.textContent=`
  .place-dock{position:relative;z-index:18;margin:0 0 10px;padding:11px;border:1px solid rgba(255,255,255,.11);border-radius:14px;background:linear-gradient(180deg,rgba(15,20,22,.98),rgba(10,14,16,.98));box-shadow:0 14px 36px rgba(0,0,0,.22);overflow:visible}
  .place-dock-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;padding:0 2px}.place-dock-kicker{font:800 8px Inter,Segoe UI,sans-serif;letter-spacing:.14em;color:#dce7ea}.place-dock-state{font:700 7px Inter,Segoe UI,sans-serif;letter-spacing:.10em;color:#76858a}
  .place-dock .place-search{position:relative;top:auto;left:auto;transform:none;width:100%;display:flex;filter:none;z-index:20}.place-dock .place-search input{height:44px;font-size:12px;background:#0c1113;border-color:rgba(255,255,255,.15)}.place-dock .place-search button{height:44px;min-width:72px}.place-dock .place-search-results{top:50px;z-index:30;max-height:min(360px,52vh);overflow:auto}
  .place-dock-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.55fr);gap:8px;margin-top:8px}
  .place-dock .location-hero,.place-dock .view-location{position:relative;left:auto;right:auto;top:auto;width:auto;max-width:none;min-width:0;margin:0;border:1px solid rgba(255,255,255,.09);background:#0b0f11;backdrop-filter:none;box-shadow:none;border-radius:11px;text-align:left}
  .place-dock .location-hero{padding:10px 12px}.place-dock .location-hero strong{font-size:15px;line-height:1.2}.place-dock .location-hero>span:not(.location-kicker){font-size:10px}.place-dock .location-hero small{font-size:9px;margin-top:5px}
  .place-dock .view-location{display:flex;flex-direction:column;justify-content:center;padding:10px 12px}.place-dock .view-location span{font-size:7px}.place-dock .view-location b{font-size:11px}.place-dock .view-location small{font-size:9px}
  .place-navigator{z-index:7}.place-navigator .north-compass{top:18px}.place-navigator .earth-attribution{bottom:43px}.place-navigator .scale-readout{bottom:20px}
  @media(max-width:920px){.place-dock-grid{grid-template-columns:minmax(0,1.15fr) minmax(190px,.85fr)}.place-dock{padding:9px}}
  @media(max-width:700px){.place-dock{margin-bottom:7px;border-radius:12px;padding:8px}.place-dock-head{margin-bottom:6px}.place-dock-state{display:none}.place-dock-grid{grid-template-columns:1fr;gap:6px;margin-top:6px}.place-dock .place-search input{height:42px}.place-dock .place-search button{height:42px;min-width:58px;padding-left:12px;padding-right:12px}.place-dock .location-hero{padding:8px 10px}.place-dock .location-hero strong{font-size:14px}.place-dock .view-location{padding:7px 10px;display:grid;grid-template-columns:auto 1fr;column-gap:9px;align-items:center}.place-dock .view-location span{grid-row:1/3}.place-dock .view-location b,.place-dock .view-location small{margin:0}.place-navigator .north-compass{top:12px;right:12px}}
  `;document.head.append(style);
}

function install(){
  if(!wrap||$('#placeDock'))return;
  installDockStyle();
  const dock=document.createElement('section');dock.id='placeDock';dock.className='place-dock';dock.setAttribute('aria-label','Location and SAR target controls');dock.innerHTML=`
    <div class="place-dock-head"><span class="place-dock-kicker">LOCATION / SAR TARGET</span><span class="place-dock-state">SEARCH · SELECT · CAMERA</span></div>
    <form class="place-search" id="placeSearchForm">
      <input id="placeSearchInput" autocomplete="off" spellcheck="false" placeholder="Search SAR target: city, region or landmark" aria-label="Search SAR target">
      <button type="submit">Go</button><div id="placeSearchResults" class="place-search-results" hidden></div>
    </form>
    <div class="place-dock-grid">
      <div class="location-hero" id="locationHero"><span class="location-kicker">SELECTED SAR TARGET</span><strong id="selectedPlaceName">Choose a point on Earth</strong><span id="selectedPlaceRegion">Click the SAR surface or search for a place.</span><small id="selectedPlaceCoords">WGS84 · EPSG:4326</small></div>
      <div class="view-location" id="viewLocation"><span>CAMERA CENTER</span><b id="viewPlaceName">World view</b><small id="viewCoords">0.00000° N · 0.00000° E</small></div>
    </div>`;
  wrap.before(dock);
  const ui=document.createElement('div');ui.id='placeNavigator';ui.className='place-navigator';ui.innerHTML='<div class="north-compass" aria-label="North">N<span>↑</span></div><div class="scale-readout"><i id="scaleBar"></i><b id="scaleLabel">—</b></div><div class="earth-attribution">SAR: Sentinel-1 / NISAR evidence · context: NASA EOSDIS GIBS · names: © OpenStreetMap contributors</div>';wrap.append(ui);
  $('#placeSearchForm').addEventListener('submit',async event=>{
    event.preventDefault();const input=$('#placeSearchInput'),results=$('#placeSearchResults'),q=input.value.trim();if(q.length<2)return;
    results.hidden=false;results.innerHTML='<div class="place-result loading">Finding SAR target…</div>';
    try{
      const found=await search(q);results.innerHTML='';if(!found.length){results.innerHTML='<div class="place-result empty">No published place match found.</div>';return;}
      for(const place of found){const button=document.createElement('button');button.type='button';button.className='place-result';button.innerHTML=`<b>${primaryPlace(place,'Location')}</b><span>${secondaryPlace(place)}</span>`;button.onclick=async()=>{results.hidden=true;input.value=compactPlace(place)||q;await jump(place.lon,place.lat,place);};results.append(button);}
    }catch(error){results.innerHTML=`<div class="place-result empty">Location lookup unavailable. ${error.message}</div>`;}
  });
  document.addEventListener('pointerdown',event=>{const results=$('#placeSearchResults');if(results&&!dock.contains(event.target))results.hidden=true;});
}

function bindPointToInputs(lon,lat){const latInput=$('#jumpLat'),lonInput=$('#jumpLon'),aoi=$('#aoi');if(latInput)latInput.value=Number(lat).toFixed(6);if(lonInput)lonInput.value=Number(lon).toFixed(6);if(aoi)aoi.value=`POINT(${Number(lon).toFixed(6)} ${Number(lat).toFixed(6)})`;}
async function showSelected(lon,lat,knownPlace=null){
  const generation=++selectedGeneration;bindPointToInputs(lon,lat);$('#selectedPlaceName').textContent=knownPlace?primaryPlace(knownPlace):'Resolving location…';$('#selectedPlaceRegion').textContent=knownPlace?secondaryPlace(knownPlace):'Matching the exact WGS84 SAR target to published place data.';$('#selectedPlaceCoords').textContent=`${coord(lat,'N','S')} · ${coord(lon,'E','W')} · WGS84`;
  if(knownPlace)return;try{const place=await reverse(lat,lon,14);if(generation!==selectedGeneration)return;$('#selectedPlaceName').textContent=primaryPlace(place,'Selected SAR target');$('#selectedPlaceRegion').textContent=secondaryPlace(place);}catch{if(generation!==selectedGeneration)return;$('#selectedPlaceName').textContent='Selected SAR target';$('#selectedPlaceRegion').textContent='Published place name unavailable — exact WGS84 target retained.';}
}
async function jump(lon,lat,place=null){
  lon=Number(lon);lat=Number(lat);if(!Number.isFinite(lon)||!Number.isFinite(lat))return false;bindPointToInputs(lon,lat);
  const nav=await waitNavigation();if(!nav?.selectTarget)throw new Error('Authoritative SAR camera is not ready');
  const ok=await nav.selectTarget({lon,lat},{scale:120,reason:place?'place search':'location jump'});if(!ok)return false;
  await showSelected(lon,lat,place);return true;
}
function updateScale(detail){const span=horizontalSpanKm(detail),nice=niceScaleKm(span),fraction=Math.max(.06,Math.min(.28,nice/span));$('#scaleBar').style.width=`${Math.round(fraction*100)}%`;$('#scaleLabel').textContent=formatDistance(nice);}
async function resolveCenter(detail,generation){const {centerLon,centerLat,scale}=detail;$('#viewCoords').textContent=`${coord(centerLat,'N','S')} · ${coord(centerLon,'E','W')}`;$('#viewPlaceName').textContent=scale<=1.05?'Whole Earth':'Locating camera…';if(scale<=1.05)return;try{const place=await reverse(centerLat,centerLon,zoomFromScale(scale));if(generation!==centerGeneration)return;$('#viewPlaceName').textContent=compactPlace(place)||'Open Earth / unmapped';}catch{if(generation!==centerGeneration)return;$('#viewPlaceName').textContent='Open Earth / unmapped';}}

install();
map?.addEventListener('omega-map-select',event=>{const {lon,lat}=event.detail||{};if(Number.isFinite(lon)&&Number.isFinite(lat))showSelected(lon,lat);});
map?.addEventListener('omega-map-view',event=>{const detail=event.detail||{};if(!Number.isFinite(detail.centerLon)||!Number.isFinite(detail.centerLat))return;updateScale(detail);$('#viewCoords').textContent=`${coord(detail.centerLat,'N','S')} · ${coord(detail.centerLon,'E','W')}`;clearTimeout(centerTimer);const generation=++centerGeneration;centerTimer=setTimeout(()=>resolveCenter(detail,generation),900);});
window.addEventListener('omega-location-jump',event=>{const {lon,lat,place}=event.detail||{};jump(Number(lon),Number(lat),place||null).catch(()=>{});});
globalThis.OMEGA_SAR_LOCATION={jump,search,reverse};
