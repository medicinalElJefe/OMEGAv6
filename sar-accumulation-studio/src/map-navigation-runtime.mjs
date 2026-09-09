const $=s=>document.querySelector(s);
const map=$('#map');
const wrap=map?.closest('.map-wrap');
const nav={view:{centerLon:0,centerLat:0,scale:1},lastSelectionKey:null,pendingDevice:false};
globalThis.OMEGA_SAR_NAVIGATION=nav;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function parsePoint(){const m=($('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;}
function key(p){return p?`${p.lon.toFixed(5)},${p.lat.toFixed(5)}`:null;}
function centerOfMap(){const r=map?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null;}
function wheel(deltaY){const c=centerOfMap();if(!c)return;map.dispatchEvent(new WheelEvent('wheel',{deltaY,clientX:c.x,clientY:c.y,bubbles:true,cancelable:true}));}
async function focusScale(target=900){
  target=Math.max(1,Math.min(8192,Number(target)||900));
  for(let i=0;i<24;i++){
    const s=Number(nav.view.scale)||1;if(s>=target*.92&&s<=target*1.18)break;
    wheel(s<target?-120:120);await sleep(8);
  }
  return nav.view.scale;
}
function dispatchSelected(point){if(!point)return;map.dispatchEvent(new CustomEvent('omega-map-select',{detail:point,bubbles:false}));}
async function focusCurrentTarget(scale=900){
  const p=parsePoint();if(!p)return false;
  const lat=$('#jumpLat'),lon=$('#jumpLon');if(lat)lat.value=p.lat.toFixed(6);if(lon)lon.value=p.lon.toFixed(6);
  $('#jumpLocation')?.click();await sleep(90);await focusScale(scale);return true;
}
function useDevice(){
  const button=$('#deviceLocation');if(!navigator.geolocation){const status=$('#status');if(status){status.textContent='Device location is not supported by this browser.';status.dataset.kind='error';}return;}
  nav.pendingDevice=true;if(button){button.dataset.busy='true';button.textContent='LOCATING DEVICE…';}
  const status=$('#status');if(status){status.textContent='Requesting precise browser/device location…';status.dataset.kind='';}
  navigator.geolocation.getCurrentPosition(async pos=>{
    const point={lon:Number(pos.coords.longitude),lat:Number(pos.coords.latitude)};
    const lat=$('#jumpLat'),lon=$('#jumpLon'),aoi=$('#aoi');if(lat)lat.value=point.lat.toFixed(6);if(lon)lon.value=point.lon.toFixed(6);if(aoi)aoi.value=`POINT(${point.lon.toFixed(6)} ${point.lat.toFixed(6)})`;
    window.dispatchEvent(new CustomEvent('omega-location-jump',{detail:{...point,place:{name:'Device location',locality:null,region:null,country:null,displayName:'Browser geolocation'}}}));
    await sleep(120);await focusScale(1400);
    if(status){const accuracy=Number(pos.coords.accuracy);status.textContent=`Device location bound at ${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}${Number.isFinite(accuracy)?` · ±${Math.round(accuracy)} m browser accuracy`:''}. Loading SAR evidence for this point.`;status.dataset.kind='ok';}
    nav.pendingDevice=false;if(button){button.dataset.busy='false';button.textContent='USE DEVICE LOCATION';}
  },error=>{
    nav.pendingDevice=false;if(button){button.dataset.busy='false';button.textContent='USE DEVICE LOCATION';}
    if(status){status.textContent=`Device location unavailable: ${error.message}. You can still search or enter exact coordinates.`;status.dataset.kind='error';}
  },{enableHighAccuracy:true,timeout:15000,maximumAge:15000});
}
function inject(){
  if(!wrap||$('#omegaMapNav'))return;
  const style=document.createElement('style');style.textContent=`
  .omega-map-nav{position:absolute;right:14px;top:92px;display:flex;flex-direction:column;gap:6px;z-index:12}.omega-map-nav button{width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(5,8,10,.84);backdrop-filter:blur(14px);color:#f3f5f6;font:700 16px Inter,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.25)}.omega-map-nav button:hover{background:rgba(28,35,39,.92)}.omega-map-nav button.small{font-size:11px;line-height:1}.omega-map-nav-readout{position:absolute;right:58px;top:0;min-width:132px;padding:7px 9px;border-radius:9px;background:rgba(4,7,9,.78);border:1px solid rgba(255,255,255,.12);color:#d9dee0;font:600 9px ui-monospace,monospace;text-align:right;pointer-events:none}.omega-map-nav-readout b{display:block;color:#fff;font-size:10px}.omega-map-nav-hint{position:absolute;right:14px;bottom:72px;padding:7px 9px;border-radius:9px;background:rgba(4,7,9,.72);border:1px solid rgba(255,255,255,.10);color:#b8c0c4;font:500 9px Inter,Segoe UI,sans-serif;pointer-events:none}.omega-map-nav-hint b{color:#edf0f2}@media(max-width:780px){.omega-map-nav{right:8px;top:76px}.omega-map-nav-readout,.omega-map-nav-hint{display:none}}
  `;document.head.append(style);
  const ui=document.createElement('div');ui.id='omegaMapNav';ui.className='omega-map-nav';ui.innerHTML=`<div class="omega-map-nav-readout"><span>VIEW</span><b id="omegaNavScale">1×</b><span id="omegaNavCenter">0.0000, 0.0000</span></div><button id="omegaZoomIn" title="Zoom in">+</button><button id="omegaZoomOut" title="Zoom out">−</button><button id="omegaTargetFocus" class="small" title="Recenter selected target">TARGET</button><button id="omegaDeviceFocus" class="small" title="Use browser/device location">LOCATE</button><button id="omegaWorldFocus" class="small" title="Whole Earth">WORLD</button>`;wrap.append(ui);
  const hint=document.createElement('div');hint.className='omega-map-nav-hint';hint.innerHTML='<b>MAP</b> drag = pan · wheel = zoom at pointer · click = bind target · double-click = zoom';wrap.append(hint);
  $('#omegaZoomIn').onclick=()=>wheel(-120);$('#omegaZoomOut').onclick=()=>wheel(120);$('#omegaTargetFocus').onclick=()=>focusCurrentTarget(1000);$('#omegaDeviceFocus').onclick=useDevice;$('#omegaWorldFocus').onclick=()=>$('#worldView')?.click();
}

map?.addEventListener('omega-map-view',event=>{
  const d=event.detail||{};if(!Number.isFinite(d.centerLon)||!Number.isFinite(d.centerLat)||!Number.isFinite(d.scale))return;nav.view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale,bbox:d.bbox};
  const scale=$('#omegaNavScale'),center=$('#omegaNavCenter');if(scale)scale.textContent=`${d.scale<10?d.scale.toFixed(2):Math.round(d.scale)}×`;if(center)center.textContent=`${d.centerLat.toFixed(4)}, ${d.centerLon.toFixed(4)}`;
});
map?.addEventListener('omega-map-select',event=>{const p=event.detail;if(p&&Number.isFinite(p.lon)&&Number.isFinite(p.lat))nav.lastSelectionKey=key(p);});

function wireProgrammaticPointSync(){
  const point=$('#point');if(!point)return;new MutationObserver(()=>{const p=parsePoint(),k=key(p);if(!p||k===nav.lastSelectionKey)return;nav.lastSelectionKey=k;dispatchSelected(p);if(nav.pendingDevice)setTimeout(()=>focusScale(1400),80);}).observe(point,{childList:true,subtree:true,characterData:true});
  $('#jumpLocation')?.addEventListener('click',()=>setTimeout(()=>focusScale(900),70));
  const originalDevice=$('#deviceLocation');if(originalDevice)originalDevice.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();useDevice();},true);
}

nav.focusScale=focusScale;nav.focusCurrentTarget=focusCurrentTarget;nav.useDevice=useDevice;nav.zoomIn=()=>wheel(-120);nav.zoomOut=()=>wheel(120);
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{inject();wireProgrammaticPointSync();},{once:true});else queueMicrotask(()=>{inject();wireProgrammaticPointSync();});}
