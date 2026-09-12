const map=document.querySelector('#map');
const REGIONAL_SCALE=420;
const SETTLE_DELAYS=[0,90,240,520];
let manualEpoch=0;

const state={state:'INITIALIZING',commands:0,reassertions:0,lastAt:null,lastTarget:null,boundary:'This runtime stabilizes only the explicit SAR camera-focus command. It never selects a new target, creates/reclassifies evidence, changes source SAR pixels, calibration, geolocation, terrain admission, Canon state, or measurement truth.'};
globalThis.OMEGA_SAR_PRIMARY_FOCUS_STABILITY=state;

function validPoint(p){return !!p&&Number.isFinite(Number(p.lon))&&Number.isFinite(Number(p.lat));}
function key(p){return validPoint(p)?`${Number(p.lon).toFixed(6)},${Number(p.lat).toFixed(6)}`:null;}
function target(){return globalThis.OMEGA_SAR_NAVIGATION?.target||globalThis.OMEGA_SAR_PRIMARY_WORKSTATION?.target||null;}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||globalThis.OMEGA_SAR_NAVIGATION?.renderer?.()||null;}

function commit(point,epoch){
  if(epoch!==manualEpoch||key(target())!==key(point))return false;
  const r=renderer();if(!r)return false;
  const scale=Number(r.view?.scale)||0,lon=Number(r.view?.centerLon),lat=Number(r.view?.centerLat);
  if(Math.abs(scale-REGIONAL_SCALE)>.001||Math.abs(lon-Number(point.lon))>1e-7||Math.abs(lat-Number(point.lat))>1e-7){
    r.fitLocation(Number(point.lon),Number(point.lat),REGIONAL_SCALE);
    state.reassertions++;
  }
  globalThis.OMEGA_SAR_PRIMARY_WORKSTATION?.surfaceState?.();
  return true;
}

function focusSarStable(){
  const point=target();if(!validPoint(point))return false;
  state.commands++;state.lastAt=new Date().toISOString();state.lastTarget={lon:Number(point.lon),lat:Number(point.lat)};
  const epoch=manualEpoch;
  // Preserve the established workstation path (including its bounded regional reload),
  // but do not allow a stale transition flag to discard the user's explicit command.
  const primary=globalThis.OMEGA_SAR_PRIMARY_WORKSTATION;
  const accepted=primary?.applyRegionalFocus?.(point,{reload:true});
  if(accepted===false)commit(point,epoch);
  for(const delay of SETTLE_DELAYS)setTimeout(()=>commit(point,epoch),delay);
  return true;
}

function bind(){
  const button=document.querySelector('#omegaSarFocus');
  if(!button)return false;
  button.onclick=focusSarStable;
  const primary=globalThis.OMEGA_SAR_PRIMARY_WORKSTATION;
  if(primary)primary.focusSar=focusSarStable;
  state.state='READY';
  return true;
}

function manual(){manualEpoch++;}
map?.addEventListener('pointerdown',event=>{if(event.isTrusted)manual();},true);
map?.addEventListener('mousedown',event=>{if(event.isTrusted)manual();},true);
map?.addEventListener('wheel',event=>{if(event.isTrusted)manual();},true);

function install(){
  if(bind())return;
  const retry=setInterval(()=>{if(bind())clearInterval(retry);},80);
  setTimeout(()=>clearInterval(retry),5000);
}

state.focus=focusSarStable;
state.snapshot=()=>({...state,manualEpoch});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);
