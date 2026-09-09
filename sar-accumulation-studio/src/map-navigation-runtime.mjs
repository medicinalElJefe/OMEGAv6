import { WorldRenderer } from './render.mjs';

const $=s=>document.querySelector(s);
const map=$('#map');
const wrap=map?.closest('.map-wrap');
const nav={view:{centerLon:0,centerLat:0,scale:1},target:null,lastSelectionKey:null,pendingDevice:false,focusToken:0,focusing:false,bootstrapPass:false};
globalThis.OMEGA_SAR_NAVIGATION=nav;

if(!WorldRenderer.prototype.__omegaAuthorityCapture){
  WorldRenderer.prototype.__omegaAuthorityCapture=true;
  const fit=WorldRenderer.prototype.fitLocation;WorldRenderer.prototype.fitLocation=function(...args){globalThis.OMEGA_SAR_RENDERER=this;return fit.apply(this,args);};
  const commit=WorldRenderer.prototype._commitView;if(typeof commit==='function')WorldRenderer.prototype._commitView=function(...args){globalThis.OMEGA_SAR_RENDERER=this;return commit.apply(this,args);};
  const setPoint=WorldRenderer.prototype.setPoint;WorldRenderer.prototype.setPoint=function(...args){globalThis.OMEGA_SAR_RENDERER=this;return setPoint.apply(this,args);};
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function parsePoint(){const m=($('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;}
function key(p){return p?`${Number(p.lon).toFixed(6)},${Number(p.lat).toFixed(6)}`:null;}
function validPoint(p){return !!p&&Number.isFinite(Number(p.lon))&&Number.isFinite(Number(p.lat))&&Number(p.lon)>=-180&&Number(p.lon)<=180&&Number(p.lat)>=-90&&Number(p.lat)<=90;}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function bindInputs(point){const lat=$('#jumpLat'),lon=$('#jumpLon'),aoi=$('#aoi');if(lat)lat.value=Number(point.lat).toFixed(6);if(lon)lon.value=Number(point.lon).toFixed(6);if(aoi)aoi.value=`POINT(${Number(point.lon).toFixed(6)} ${Number(point.lat).toFixed(6)})`;}
function patchMatches(point=nav.target){const patch=renderer()?.sarOverlay?.patch;return patch?.evidence?.measured===true&&key(patch.target)===key(point);}
function publishFromRenderer(){const r=renderer();if(!r)return;nav.view={...r.view,bbox:r.viewBounds?.()};}
function centerErrorPixels(point){const rect=map?.getBoundingClientRect(),v=renderer()?.view||nav.view,s=Number(v?.scale)||1;if(!rect||!validPoint(point))return null;let dlon=Number(v.centerLon)-Number(point.lon);while(dlon>180)dlon-=360;while(dlon<-180)dlon+=360;const dx=dlon*(rect.width/360)*s,dy=(Number(point.lat)-Number(v.centerLat))*(rect.height/180)*s;return {dx,dy,distance:Math.hypot(dx,dy)};}
function stageScale(requested,point=nav.target){requested=Math.max(1,Math.min(8192,Number(requested)||120));return patchMatches(point)?requested:Math.min(180,requested);}
function cancelFocus(){nav.focusToken++;nav.focusing=false;}

async function bootstrapRenderer(point){
  if(renderer())return renderer();const button=$('#jumpLocation');if(!button)return null;bindInputs(point);nav.bootstrapPass=true;button.click();nav.bootstrapPass=false;
  for(let i=0;i<30&&!renderer();i++)await sleep(10);return renderer();
}
function clearMismatchedMeasurement(point){
  const r=renderer(),patch=r?.sarOverlay?.patch;if(!patch)return;
  if(key(patch.target)!==key(point)){r.clearSarOverlay?.();window.dispatchEvent(new CustomEvent('omega-calibrated-sar-patch-clear',{detail:{reason:'TARGET_CHANGED'}}));globalThis.OMEGA_SAR_LOCAL_FOCUS=null;}
}
async function selectTarget(point,{scale=120,reason='target selection'}={}){
  if(!validPoint(point))return false;point={lon:Number(point.lon),lat:Number(point.lat)};cancelFocus();bindInputs(point);clearMismatchedMeasurement(point);
  const token=++nav.focusToken;nav.focusing=true;const r=renderer()||await bootstrapRenderer(point);if(!r||token!==nav.focusToken){nav.focusing=false;return false;}
  nav.target=point;nav.lastSelectionKey=key(point);r.fitLocation(point.lon,point.lat,stageScale(scale,point));r.setPoint(point.lon,point.lat,{emit:true,redraw:true});publishFromRenderer();nav.focusing=false;
  map?.dispatchEvent(new CustomEvent('omega-target-authority',{detail:{...point,reason,camera:{...r.view}},bubbles:false}));return true;
}
async function focusLocation(point,{scale=120,bind=false}={}){
  if(bind)return selectTarget(point,{scale,reason:'focus+bind'});if(!validPoint(point))return false;point={lon:Number(point.lon),lat:Number(point.lat)};
  const token=++nav.focusToken;nav.focusing=true;const r=renderer()||await bootstrapRenderer(point);if(!r||token!==nav.focusToken){nav.focusing=false;return false;}
  r.fitLocation(point.lon,point.lat,stageScale(scale,point));publishFromRenderer();nav.focusing=false;return true;
}
async function focusScale(target=950,point=nav.target||parsePoint()){
  const r=renderer();if(!r)return point?focusLocation(point,{scale:target,bind:false}):false;const p=validPoint(point)?{lon:Number(point.lon),lat:Number(point.lat)}:null;target=stageScale(target,p);
  if(p)r.fitLocation(p.lon,p.lat,target);else r.zoomBy(target/(Number(r.view.scale)||1));publishFromRenderer();return r.view.scale;
}
async function focusCurrentTarget(scale=950){const p=nav.target||parsePoint();return p?focusLocation(p,{scale,bind:false}):false;}
function fitSar(){return globalThis.OMEGA_SAR_PATCH_FOCUS?.focusPatch?.()||false;}

async function useDevice(){
  const button=$('#deviceLocation');if(!navigator.geolocation){const status=$('#status');if(status){status.textContent='Device location is not supported by this browser.';status.dataset.kind='error';}return;}
  nav.pendingDevice=true;if(button){button.dataset.busy='true';button.textContent='LOCATING DEVICE…';}const status=$('#status');if(status){status.textContent='Requesting precise browser/device location…';status.dataset.kind='';}
  navigator.geolocation.getCurrentPosition(async pos=>{const point={lon:Number(pos.coords.longitude),lat:Number(pos.coords.latitude)};await selectTarget(point,{scale:120,reason:'device geolocation'});const accuracy=Number(pos.coords.accuracy),error=centerErrorPixels(point);if(status){status.textContent=`Device SAR target ${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}${Number.isFinite(accuracy)?` · ±${Math.round(accuracy)} m browser accuracy`:''}${error?` · camera residual ${error.distance.toFixed(2)} px`:''}. Loading SAR evidence.`;status.dataset.kind='ok';}nav.pendingDevice=false;if(button){button.dataset.busy='false';button.textContent='USE DEVICE LOCATION';}},error=>{nav.pendingDevice=false;if(button){button.dataset.busy='false';button.textContent='USE DEVICE LOCATION';}if(status){status.textContent=`Device location unavailable: ${error.message}`;status.dataset.kind='error';}},{enableHighAccuracy:true,timeout:15000,maximumAge:15000});
}
function zoom(factor){cancelFocus();const r=renderer();if(r){r.zoomBy(factor);publishFromRenderer();return true;}const rect=map?.getBoundingClientRect();if(rect){map.dispatchEvent(new WheelEvent('wheel',{deltaY:factor>1?-120:120,clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2,bubbles:true,cancelable:true}));return true;}return false;}
function world(){cancelFocus();const r=renderer();if(r){r.fitLocation(0,0,1);publishFromRenderer();return true;}$('#worldView')?.click();return true;}

function inject(){
  if(!wrap||$('#omegaMapNav'))return;const style=document.createElement('style');style.textContent=`.omega-map-nav{position:absolute;right:14px;top:92px;display:flex;flex-direction:column;gap:6px;z-index:12}.omega-map-nav button{width:40px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(5,8,10,.86);backdrop-filter:blur(14px);color:#f3f5f6;font:700 16px Inter,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.25)}.omega-map-nav button:hover{background:rgba(28,35,39,.94)}.omega-map-nav button.small{font-size:10px;line-height:1}.omega-map-nav button:disabled{opacity:.32;cursor:not-allowed}.omega-map-nav-readout{position:absolute;right:62px;top:0;min-width:148px;padding:8px 10px;border-radius:9px;background:rgba(4,7,9,.82);border:1px solid rgba(255,255,255,.12);color:#d9dee0;font:600 9px ui-monospace,monospace;text-align:right;pointer-events:none}.omega-map-nav-readout b{display:block;color:#fff;font-size:10px}.omega-map-nav-hint{position:absolute;right:14px;bottom:72px;padding:7px 9px;border-radius:9px;background:rgba(4,7,9,.76);border:1px solid rgba(255,255,255,.10);color:#b8c0c4;font:500 9px Inter,Segoe UI,sans-serif;pointer-events:none}.omega-map-nav-hint b{color:#edf0f2}@media(max-width:780px){.omega-map-nav{right:8px;top:76px}.omega-map-nav-readout,.omega-map-nav-hint{display:none}}`;document.head.append(style);
  const ui=document.createElement('div');ui.id='omegaMapNav';ui.className='omega-map-nav';ui.innerHTML=`<div class="omega-map-nav-readout"><span>AUTHORITATIVE SAR CAMERA</span><b id="omegaNavScale">1×</b><span id="omegaNavCenter">0.0000, 0.0000</span></div><button id="omegaZoomIn" title="Zoom in">+</button><button id="omegaZoomOut" title="Zoom out">−</button><button id="omegaTargetFocus" class="small" title="Recenter selected SAR target">TARGET</button><button id="omegaDeviceFocus" class="small" title="Use browser/device location">LOCATE</button><button id="omegaWorldFocus" class="small" title="Whole Earth">WORLD</button>`;wrap.append(ui);
  const hint=document.createElement('div');hint.className='omega-map-nav-hint';hint.innerHTML='<b>SAR CAMERA</b> drag = view only · wheel = zoom · click = new SAR target · FIT SAR = exact measured patch';wrap.append(hint);
  $('#omegaZoomIn').onclick=()=>zoom(1.42);$('#omegaZoomOut').onclick=()=>zoom(1/1.42);$('#omegaTargetFocus').onclick=()=>focusCurrentTarget(950);$('#omegaDeviceFocus').onclick=useDevice;$('#omegaWorldFocus').onclick=world;
}
map?.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(!Number.isFinite(d.centerLon)||!Number.isFinite(d.centerLat)||!Number.isFinite(d.scale))return;nav.view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale,bbox:d.bbox};const scale=$('#omegaNavScale'),center=$('#omegaNavCenter');if(scale)scale.textContent=`${d.scale<10?d.scale.toFixed(2):Math.round(d.scale)}×`;if(center)center.textContent=`${d.centerLat.toFixed(5)}, ${d.centerLon.toFixed(5)}`;});
map?.addEventListener('omega-map-select',event=>{const p=event.detail;if(validPoint(p)){nav.target={lon:Number(p.lon),lat:Number(p.lat)};nav.lastSelectionKey=key(p);bindInputs(nav.target);}});
map?.addEventListener('pointerdown',event=>{if(event.isTrusted)cancelFocus();},true);map?.addEventListener('mousedown',event=>{if(event.isTrusted)cancelFocus();},true);map?.addEventListener('wheel',event=>{if(event.isTrusted)cancelFocus();},true);
function wireLegacyControls(){
  const jump=$('#jumpLocation');if(jump)jump.addEventListener('click',event=>{if(nav.bootstrapPass)return;const p={lon:Number($('#jumpLon')?.value),lat:Number($('#jumpLat')?.value)};if(!validPoint(p))return;if(renderer()){event.preventDefault();event.stopImmediatePropagation();selectTarget(p,{scale:120,reason:'coordinate controls'});}else setTimeout(()=>selectTarget(p,{scale:120,reason:'coordinate controls'}),0);},true);
  const device=$('#deviceLocation');if(device)device.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();useDevice();},true);
}
nav.selectTarget=selectTarget;nav.focusLocation=focusLocation;nav.focusScale=focusScale;nav.focusCurrentTarget=focusCurrentTarget;nav.centerErrorPixels=centerErrorPixels;nav.useDevice=useDevice;nav.cancelFocus=cancelFocus;nav.zoomIn=()=>zoom(1.42);nav.zoomOut=()=>zoom(1/1.42);nav.world=world;nav.fitSar=fitSar;nav.renderer=renderer;nav.patchMatches=patchMatches;
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{inject();wireLegacyControls();},{once:true});else queueMicrotask(()=>{inject();wireLegacyControls();});}
