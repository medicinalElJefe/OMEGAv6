const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const cache = new Map();
let lastRequestAt = 0;
let requestSerial = 0;

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const finite = value => Number.isFinite(Number(value));
const fmt = value => finite(value) ? Number(value).toFixed(6) : '—';

function inject(){
  if($('earthLocationConsole')) return;
  const mapWrap=document.querySelector('.map-wrap');
  const canvas=$('map');
  if(!mapWrap||!canvas) return;

  const style=document.createElement('style');
  style.textContent=`
  .earth-location-console{display:grid;grid-template-columns:minmax(260px,1.35fr) minmax(220px,.9fr) minmax(260px,1fr);gap:8px;margin:8px 0 10px;padding:10px;border:1px solid #284450;background:#071219;border-radius:9px;min-width:0}
  .earth-location-console>div{min-width:0}.earth-location-console .k{display:block;color:#7194a1;font-size:9px;text-transform:uppercase;letter-spacing:.09em}.earth-location-console .v{display:block;color:#e0f3f8;font-size:12px;font-weight:650;margin-top:3px;overflow-wrap:anywhere}.earth-location-console .microline{color:#7897a2;font:9px ui-monospace,monospace;line-height:1.45;margin-top:4px;overflow-wrap:anywhere}
  .earth-map-controls{display:grid;grid-template-columns:repeat(5,minmax(42px,1fr));gap:5px;align-content:start}.earth-map-controls button{min-height:40px;padding:6px;font-size:11px}.earth-map-controls .wide2{grid-column:span 2}.earth-map-controls .wide3{grid-column:span 3}
  .earth-location-attribution a{color:#9bd7e6}.earth-surface-health{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}.earth-surface-health span{border:1px solid #27434d;border-radius:999px;padding:2px 6px;font:8px ui-monospace,monospace;color:#a6c5cf}.earth-surface-health span[data-state=ready]{color:#b8ebc8;border-color:#315d43}.earth-surface-health span[data-state=waiting]{color:#d8c58c;border-color:#665b32}
  @media(max-width:980px){.earth-location-console{grid-template-columns:1fr 1fr}.earth-location-console .earth-map-controls-wrap{grid-column:1/-1}}
  @media(max-width:650px){.earth-location-console{grid-template-columns:1fr}.earth-location-console .earth-map-controls-wrap{grid-column:auto}.earth-map-controls{grid-template-columns:repeat(5,minmax(44px,1fr))}.earth-location-console .v{font-size:13px}}
  `;
  document.head.append(style);

  const panel=document.createElement('section');
  panel.className='earth-location-console';panel.id='earthLocationConsole';
  panel.innerHTML=`
    <div>
      <span class="k">Selected Earth location</span>
      <span class="v" id="earthPlaceName">Click anywhere on Earth</span>
      <div class="microline" id="earthPlaceRegion">Exact WGS84 coordinate selection is always available; named-place lookup follows only explicit selections.</div>
      <div class="microline earth-location-attribution">Place names: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> via Nominatim. Reverse geocoding returns the nearest suitable indexed OSM feature, which may differ from the exact clicked parcel or street.</div>
    </div>
    <div>
      <span class="k">Coordinates / viewport</span>
      <span class="v" id="earthSelectedCoords">—</span>
      <div class="microline">Pointer <b id="earthHoverCoords">move over map</b></div>
      <div class="microline">Center <b id="earthViewCenter">0.000000, 0.000000</b> · zoom <b id="earthViewScale">1.00×</b></div>
      <div class="microline">Geography <b id="earthBoundaryState">loading published boundaries…</b></div>
      <div class="earth-surface-health" id="earthSurfaceHealth"></div>
    </div>
    <div class="earth-map-controls-wrap">
      <span class="k">Earth navigation</span>
      <div class="earth-map-controls" aria-label="Earth map navigation controls">
        <button type="button" data-map-command="pan-west" aria-label="Pan west">←</button>
        <button type="button" data-map-command="pan-north" aria-label="Pan north">↑</button>
        <button type="button" data-map-command="pan-south" aria-label="Pan south">↓</button>
        <button type="button" data-map-command="pan-east" aria-label="Pan east">→</button>
        <button type="button" data-map-command="world">World</button>
        <button type="button" class="wide2" data-map-command="zoom-out">− Zoom</button>
        <button type="button" class="wide2" data-map-command="zoom-in">+ Zoom</button>
        <button type="button" data-map-command="center-selected" title="Center the currently selected coordinate">◎</button>
      </div>
      <div class="microline">Drag to pan · wheel/trackpad to zoom at the pointer · click/tap to lock a coordinate. Navigation buttons provide the same movement without dragging.</div>
    </div>`;
  mapWrap.insertAdjacentElement('afterend',panel);

  panel.querySelectorAll('[data-map-command]').forEach(button=>button.addEventListener('click',()=>{
    canvas.dispatchEvent(new CustomEvent('omega-map-command',{detail:{type:button.dataset.mapCommand}}));
  }));

  canvas.addEventListener('omega-map-hover',event=>{
    const {lon,lat}=event.detail||{};
    $('earthHoverCoords').textContent=finite(lon)&&finite(lat)?`${fmt(lat)}, ${fmt(lon)}`:'move over map';
  });
  canvas.addEventListener('omega-map-view',event=>{
    const d=event.detail||{};
    if(finite(d.centerLon)&&finite(d.centerLat))$('earthViewCenter').textContent=`${fmt(d.centerLat)}, ${fmt(d.centerLon)}`;
    if(finite(d.scale))$('earthViewScale').textContent=`${Number(d.scale).toFixed(2)}×`;
  });
  canvas.addEventListener('omega-map-boundaries',event=>{
    const d=event.detail||{};
    $('earthBoundaryState').textContent=d.state==='ready'?`${d.source||'published'} · ${d.count||0} features`:d.state==='unavailable'?'boundary layer unavailable; WGS84 navigation still active':String(d.state||'unknown');
  });
  canvas.addEventListener('omega-map-select',event=>{
    const point=normalizePoint(event.detail);
    if(point) syncSelectedPoint(point,{syncInputs:true});
  });

  const jumpButton=$('jumpLocation');
  jumpButton?.addEventListener('click',()=>{
    const point=normalizePoint({lat:Number($('jumpLat')?.value),lon:Number($('jumpLon')?.value)});
    if(point) syncSelectedPoint(point,{syncInputs:false});
  });

  const pointNode=$('point');
  if(pointNode){
    const observer=new MutationObserver(()=>syncSelectedFromPoint(pointNode.textContent));
    observer.observe(pointNode,{childList:true,characterData:true,subtree:true});
    syncSelectedFromPoint(pointNode.textContent);
  }
  updateSurfaceHealth();
  const healthObserver=new MutationObserver(updateSurfaceHealth);
  healthObserver.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>healthObserver.disconnect(),15000);
}

function normalizePoint(point){
  const lat=Number(point?.lat),lon=Number(point?.lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180)return null;
  return {lat,lon};
}

function parsePointText(text){
  const values=String(text||'').match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];
  return values.length>=2?normalizePoint({lat:values[0],lon:values[1]}):null;
}

function syncSelectedFromPoint(text){
  const point=parsePointText(text);
  if(point) syncSelectedPoint(point,{syncInputs:false});
}

function syncSelectedPoint(point,{syncInputs=false}={}){
  $('earthSelectedCoords').textContent=`${fmt(point.lat)}, ${fmt(point.lon)} · WGS84 / EPSG:4326`;
  if(syncInputs){
    if($('jumpLat'))$('jumpLat').value=Number(point.lat).toFixed(6);
    if($('jumpLon'))$('jumpLon').value=Number(point.lon).toFixed(6);
  }
  resolveSelectedPlace(point);
}

function cacheKey({lat,lon}){return `${Number(lat).toFixed(5)},${Number(lon).toFixed(5)}`;}
function pickLocality(address={}){return address.city||address.town||address.village||address.hamlet||address.municipality||address.suburb||address.neighbourhood||address.county||null;}
function pickRegion(address={}){return [address.state||address.region||address.county,address.country].filter(Boolean).join(' · ');}

async function reverseGeocode(point){
  const key=cacheKey(point);
  if(cache.has(key)) return cache.get(key);
  const wait=Math.max(0,1000-(Date.now()-lastRequestAt));
  if(wait) await sleep(wait);
  lastRequestAt=Date.now();
  const params=new URLSearchParams({format:'jsonv2',lat:String(point.lat),lon:String(point.lon),zoom:'18',addressdetails:'1',namedetails:'1'});
  const response=await fetch(`${NOMINATIM_REVERSE}?${params.toString()}`,{headers:{Accept:'application/json','Accept-Language':'en'}});
  if(response.status===404){const empty={found:false};cache.set(key,empty);return empty;}
  if(!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
  const data=await response.json();
  const result={found:true,displayName:data.display_name||null,name:data.name||data.namedetails?.name||pickLocality(data.address)||null,address:data.address||{},category:data.category||null,type:data.type||null};
  cache.set(key,result);return result;
}

async function resolveSelectedPlace(point){
  const serial=++requestSerial;
  $('earthPlaceName').textContent='Resolving nearest named place…';
  $('earthPlaceRegion').textContent=`Selected ${fmt(point.lat)}, ${fmt(point.lon)} · exact coordinate retained independently of place-name lookup.`;
  try{
    const result=await reverseGeocode(point);
    if(serial!==requestSerial)return;
    if(!result.found){
      $('earthPlaceName').textContent='No named OpenStreetMap feature at this coordinate';
      $('earthPlaceRegion').textContent=`${fmt(point.lat)}, ${fmt(point.lon)} · coordinate remains valid; this may be open water, remote terrain, or an unmapped location.`;
      return;
    }
    const locality=pickLocality(result.address);
    const region=pickRegion(result.address);
    $('earthPlaceName').textContent=result.name||locality||result.displayName||'Named location resolved';
    $('earthPlaceRegion').textContent=[locality&&locality!==result.name?locality:null,region,result.category&&result.type?`${result.category}/${result.type}`:null].filter(Boolean).join(' · ')||result.displayName||`${fmt(point.lat)}, ${fmt(point.lon)}`;
  }catch(error){
    if(serial!==requestSerial)return;
    $('earthPlaceName').textContent='Place-name service unavailable';
    $('earthPlaceRegion').textContent=`${fmt(point.lat)}, ${fmt(point.lon)} · WGS84 coordinate selection remains active. ${error.message}`;
  }
}

function updateSurfaceHealth(){
  const root=$('earthSurfaceHealth');if(!root)return;
  const surfaces=[
    ['Earth map','#map'],['Sentinel raster','#raster'],['Browse','#browseImage'],['Probe','#probeChart'],['Atlas','#inferState'],['Ledger','#rows'],['Canon','#canonConsole'],['NISAR','#nisarNativeConsole']
  ];
  root.innerHTML='';
  for(const [label,selector] of surfaces){
    const present=Boolean(document.querySelector(selector));
    const span=document.createElement('span');span.textContent=`${label} ${present?'MOUNTED':'LOADING'}`;span.dataset.state=present?'ready':'waiting';root.append(span);
  }
}

inject();
