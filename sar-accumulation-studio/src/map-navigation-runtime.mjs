import { WorldRenderer } from './render.mjs';

const $=s=>document.querySelector(s);
const map=$('#map');
const wrap=map?.closest('.map-wrap');
const nav={view:{centerLon:0,centerLat:0,scale:1},lastSelectionKey:null,pendingDevice:false,focusToken:0,focusing:false,bootstrapPass:false};
globalThis.OMEGA_SAR_NAVIGATION=nav;

// Capture the one renderer instance already created by app.mjs. This does not create
// a second camera. Every search, location focus, click, pan and zoom must operate on
// this exact WorldRenderer instance.
if(!WorldRenderer.prototype.__omegaAuthorityCapture){
  WorldRenderer.prototype.__omegaAuthorityCapture=true;
  const fit=WorldRenderer.prototype.fitLocation;
  WorldRenderer.prototype.fitLocation=function(...args){globalThis.OMEGA_SAR_RENDERER=this;return fit.apply(this,args);};
  const commit=WorldRenderer.prototype._commitView;
  if(typeof commit==='function')WorldRenderer.prototype._commitView=function(...args){globalThis.OMEGA_SAR_RENDERER=this;return commit.apply(this,args);};
  const setPoint=WorldRenderer.prototype.setPoint;
  WorldRenderer.prototype.setPoint=function(...args){globalThis.OMEGA_SAR_RENDERER=this;return setPoint.apply(this,args);};
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function parsePoint(){const m=($('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;}
function key(p){return p?`${p.lon.toFixed(5)},${p.lat.toFixed(5)}`:null;}
function validPoint(p){return p&&Number.isFinite(Number(p.lon))&&Number.isFinite(Number(p.lat))&&Number(p.lon)>=-180&&Number(p.lon)<=180&&Number(p.lat)>=-90&&Number(p.lat)<=90;}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function bindInputs(point){const lat=$('#jumpLat'),lon=$('#jumpLon'),aoi=$('#aoi');if(lat)lat.value=Number(point.lat).toFixed(6);if(lon)lon.value=Number(point.lon).toFixed(6);if(aoi)aoi.value=`POINT(${Number(point.lon).toFixed(6)} ${Number(point.lat).toFixed(6)})`;}
function centerErrorPixels(point){
  const r=map?.getBoundingClientRect(),v=renderer()?.view||nav.view,s=Number(v?.scale)||1;if(!r||!point)return null;
  let dlon=Number(v.centerLon)-Number(point.lon);while(dlon>180)dlon-=360;while(dlon<-180)dlon+=360;
  const dx=dlon*(r.width/360)*s,dy=(Number(point.lat)-Number(v.centerLat))*(r.height/180)*s;
  return {dx,dy,distance:Math.hypot(dx,dy)};
}
function publishFromRenderer(){const r=renderer();if(!r)return;nav.view={...r.view,bbox:r.viewBounds?.()};}

async function bootstrapRenderer(point){
  if(renderer())return renderer();
  const button=$('#jumpLocation');if(!button)return null;
  bindInputs(point);nav.bootstrapPass=true;button.click();nav.bootstrapPass=false;
  for(let i=0;i<20&&!renderer();i++)await sleep(10);
  return renderer();
}

async function focusLocation(point,{scale=950,bind=true}={}){
  if(!validPoint(point))return false;
  point={lon:Number(point.lon),lat:Number(point.lat)};bindInputs(point);
  const token=++nav.focusToken;nav.focusing=true;
  const r=renderer()||await bootstrapRenderer(point);
  if(!r||token!==nav.focusToken){nav.focusing=false;return false;}
  // One atomic camera operation: the visual frame and click inverse use the same
  // center/scale immediately. No synthetic large-world camera remains underneath.
  r.fitLocation(point.lon,point.lat,Math.max(1,Math.min(8192,Number(scale)||950)));
  if(bind)r.setPoint(point.lon,point.lat,{emit:true,redraw:true});
  publishFromRenderer();
  nav.lastSelectionKey=key(point);nav.focusing=false;
  return true;
}
function cancelFocus(){nav.focusToken++;nav.focusing=false;}
async function focusScale(target=950,point=parsePoint()){
  const r=renderer();if(!r){if(point)return focusLocation(point,{scale:target,bind:false});return false;}
  target=Math.max(1,Math.min(8192,Number(target)||950));const token=++nav.focusToken;nav.focusing=true;
  const p=validPoint(point)?{lon:Number(point.lon),lat:Number(point.lat)}:null;
  if(p)r.fitLocation(p.lon,p.lat,target);else r.zoomBy(target/(Number(r.view.scale)||1));
  publishFromRenderer();if(token===nav.focusToken)nav.focusing=false;return r.view.scale;
}
async function focusCurrentTarget(scale=950){const p=parsePoint();return p?focusLocation(p,{scale,bind:false}):false;}

async function useDevice(){
  const button=$('#deviceLocation');if(!navigator.geolocation){const status=$('#status');if(status){status.textContent='Device location is not supported by this browser.';status.dataset.kind='error';}return;}
  nav.pendingDevice=true;cancelFocus();if(button){button.dataset.busy='true';button.textContent='LOCATING DEVICE…';}
  const status=$('#status');if(status){status.textContent='Requesting precise browser/device location…';status.dataset.kind='';}
  navigator.geolocation.getCurrentPosition(async pos=>{
    const point={lon:Number(pos.coords.longitude),lat:Number(pos.coords.latitude)};await focusLocation(point,{scale:950,bind:true});
    const accuracy=Number(pos.coords.accuracy),error=centerErrorPixels(point);if(status){status.textContent=`Device location bound at ${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}${Number.isFinite(accuracy)?` · ±${Math.round(accuracy)} m browser accuracy`:''}${error?` · camera residual ${error.distance.toFixed(2)} px`:''}. Loading SAR evidence for this point.`;status.dataset.kind='ok';}
    nav.pendingDevice=false;if(button){button.dataset.busy='false';button.textContent='USE DEVICE LOCATION';}
  },error=>{nav.pendingDevice=false;if(button){button.dataset.busy='false';button.textContent='USE DEVICE LOCATION';}if(status){status.textContent=`Device location unavailable: ${error.message}. You can still search or enter exact coordinates.`;status.dataset.kind='error';}},{enableHighAccuracy:true,timeout:15000,maximumAge:15000});
}

function zoom(factor){cancelFocus();const r=renderer();if(r){r.zoomBy(factor);publishFromRenderer();return;}const rect=map?.getBoundingClientRect();if(rect)map.dispatchEvent(new WheelEvent('wheel',{deltaY:factor>1?-120:120,clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2,bubbles:true,cancelable:true}));}
function inject(){
  if(!wrap||$('#omegaMapNav'))return;
  const style=document.createElement('style');style.textContent=`
  .omega-map-nav{position:absolute;right:14px;top:92px;display:flex;flex-direction:column;gap:6px;z-index:12}.omega-map-nav button{width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(5,8,10,.84);backdrop-filter:blur(14px);color:#f3f5f6;font:700 16px Inter,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.25)}.omega-map-nav button:hover{background:rgba(28,35,39,.92)}.omega-map-nav button.small{font-size:11px;line-height:1}.omega-map-nav-readout{position:absolute;right:58px;top:0;min-width:132px;padding:7px 9px;border-radius:9px;background:rgba(4,7,9,.78);border:1px solid rgba(255,255,255,.12);color:#d9dee0;font:600 9px ui-monospace,monospace;text-align:right;pointer-events:none}.omega-map-nav-readout b{display:block;color:#fff;font-size:10px}.omega-map-nav-hint{position:absolute;right:14px;bottom:72px;padding:7px 9px;border-radius:9px;background:rgba(4,7,9,.72);border:1px solid rgba(255,255,255,.10);color:#b8c0c4;font:500 9px Inter,Segoe UI,sans-serif;pointer-events:none}.omega-map-nav-hint b{color:#edf0f2}@media(max-width:780px){.omega-map-nav{right:8px;top:76px}.omega-map-nav-readout,.omega-map-nav-hint{display:none}}
  `;document.head.append(style);
  const ui=document.createElement('div');ui.id='omegaMapNav';ui.className='omega-map-nav';ui.innerHTML=`<div class="omega-map-nav-readout"><span>SAR VIEW</span><b id="omegaNavScale">1×</b><span id="omegaNavCenter">0.0000, 0.0000</span></div><button id="omegaZoomIn" title="Zoom in">+</button><button id="omegaZoomOut" title="Zoom out">−</button><button id="omegaTargetFocus" class="small" title="Recenter selected target">TARGET</button><button id="omegaDeviceFocus" class="small" title="Use browser/device location">LOCATE</button><button id="omegaWorldFocus" class="small" title="Whole Earth">WORLD</button>`;wrap.append(ui);
  const hint=document.createElement('div');hint.className='omega-map-nav-hint';hint.innerHTML='<b>SAR EARTH</b> drag = pan · wheel = zoom · click = bind SAR target';wrap.append(hint);
  $('#omegaZoomIn').onclick=()=>zoom(1.42);$('#omegaZoomOut').onclick=()=>zoom(1/1.42);$('#omegaTargetFocus').onclick=()=>focusCurrentTarget(950);$('#omegaDeviceFocus').onclick=useDevice;$('#omegaWorldFocus').onclick=()=>{cancelFocus();const r=renderer();if(r){r.fitLocation(0,0,1);publishFromRenderer();}else $('#worldView')?.click();};
}

map?.addEventListener('omega-map-view',event=>{
  const d=event.detail||{};if(!Number.isFinite(d.centerLon)||!Number.isFinite(d.centerLat)||!Number.isFinite(d.scale))return;nav.view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale,bbox:d.bbox};
  const scale=$('#omegaNavScale'),center=$('#omegaNavCenter');if(scale)scale.textContent=`${d.scale<10?d.scale.toFixed(2):Math.round(d.scale)}×`;if(center)center.textContent=`${d.centerLat.toFixed(4)}, ${d.centerLon.toFixed(4)}`;
});
map?.addEventListener('omega-map-select',event=>{const p=event.detail;if(validPoint(p))nav.lastSelectionKey=key(p);});
map?.addEventListener('pointerdown',event=>{if(event.isTrusted)cancelFocus();},true);
map?.addEventListener('mousedown',event=>{if(event.isTrusted)cancelFocus();},true);
map?.addEventListener('wheel',event=>{if(event.isTrusted)cancelFocus();},true);

function wireProgrammaticPointSync(){
  const point=$('#point');if(point)new MutationObserver(()=>{const p=parsePoint(),k=key(p);if(!p||k===nav.lastSelectionKey)return;nav.lastSelectionKey=k;map.dispatchEvent(new CustomEvent('omega-map-select',{detail:p,bubbles:false}));}).observe(point,{childList:true,subtree:true,characterData:true});
  const jump=$('#jumpLocation');if(jump)jump.addEventListener('click',event=>{
    if(nav.bootstrapPass)return;
    const p={lon:Number($('#jumpLon')?.value),lat:Number($('#jumpLat')?.value)};if(!validPoint(p))return;
    if(renderer()){
      event.preventDefault();event.stopImmediatePropagation();focusLocation(p,{scale:950,bind:true});
    }else setTimeout(()=>focusLocation(p,{scale:950,bind:true}),0);
  },true);
  const originalDevice=$('#deviceLocation');if(originalDevice)originalDevice.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();useDevice();},true);
}

nav.focusLocation=focusLocation;nav.focusScale=focusScale;nav.focusCurrentTarget=focusCurrentTarget;nav.centerErrorPixels=centerErrorPixels;nav.useDevice=useDevice;nav.cancelFocus=cancelFocus;nav.zoomIn=()=>zoom(1.42);nav.zoomOut=()=>zoom(1/1.42);nav.renderer=renderer;
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{inject();wireProgrammaticPointSync();},{once:true});else queueMicrotask(()=>{inject();wireProgrammaticPointSync();});}
