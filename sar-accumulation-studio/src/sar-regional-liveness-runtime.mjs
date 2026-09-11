const CHECK_MS=700;
const KICK_COOLDOWN_MS=1600;
const MIN_SCALE=260;
const MAX_SCALE=900;

const state={
  state:'INITIALIZING',
  checks:0,
  kicks:0,
  lastKickAt:0,
  lastKickKey:null,
  lastReason:null,
  timer:null,
  boundary:'This watchdog can only start the existing calibrated regional Sentinel-1 COG reader when its normal debounce is starved. It does not alter source pixels, calibration, geolocation, evidence class, authority epochs, admission thresholds, or measurement truth.'
};
globalThis.OMEGA_SAR_REGIONAL_LIVENESS=state;

function eligible(){
  const regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;
  const renderer=globalThis.OMEGA_SAR_RENDERER;
  const scale=Number(renderer?.view?.scale)||0;
  const scene=(document.querySelector('#currentScene')?.textContent||'').trim();
  return !!regional?.reload&&!!regional?.requestKey&&scale>=MIN_SCALE&&scale<=MAX_SCALE&&!!scene&&scene!=='—';
}

function healthyForKey(regional,key){
  return regional?.state==='READY'&&regional?.patch?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&regional?.patch?.evidence?.measured===true&&regional?.lastRequestKey===key;
}

function kick(reason='watchdog'){
  state.checks++;
  if(!eligible())return false;
  const regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;
  const key=regional.requestKey?.();
  if(!key||regional.inFlight||healthyForKey(regional,key))return false;
  const now=Date.now();
  if(state.lastKickKey===key&&now-state.lastKickAt<KICK_COOLDOWN_MS)return false;
  state.lastKickKey=key;
  state.lastKickAt=now;
  state.lastReason=reason;
  state.kicks++;
  Promise.resolve(regional.reload()).catch(()=>{});
  return true;
}

function install(){
  state.state='READY';
  state.timer=setInterval(()=>kick('bounded periodic liveness check'),CHECK_MS);
  window.addEventListener('omega-camera-motion-settled',()=>setTimeout(()=>kick('camera settled'),90));
  window.addEventListener('omega-source-sar-frame',()=>setTimeout(()=>kick('source frame ready'),90));
  window.addEventListener('omega-sar-authority-change',event=>{
    if(['TARGET','CAMERA','SCENE'].includes(event.detail?.kind))setTimeout(()=>kick(`authority ${event.detail.kind.toLowerCase()}`),120);
  });
  setTimeout(()=>kick('initial regional liveness'),950);
}

state.kick=kick;
state.snapshot=()=>({state:state.state,checks:state.checks,kicks:state.kicks,lastKickAt:state.lastKickAt,lastKickKey:state.lastKickKey,lastReason:state.lastReason,boundary:state.boundary});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);
