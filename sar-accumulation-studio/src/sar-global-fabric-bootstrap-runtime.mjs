const root=globalThis;
const state={state:'INITIALIZING',release:'R258.4',boots:0,settledRefreshes:0,lastAt:null,lastReason:null,error:null,boundary:'Global source-fabric bootstrap invokes the existing source-only fabric refresh directly. It cannot create records, coverage, calibrated pixels or measurements.'};
root.OMEGA_SAR_GLOBAL_FABRIC_BOOTSTRAP=state;

let bootTimer=null,settleTimer=null,watchdog=null;
function fabric(){return root.OMEGA_SAR_GLOBAL_FABRIC||null;}
async function invoke(reason){
  const g=fabric();if(!g?.refresh)return false;
  state.state='REFRESHING';state.lastReason=reason;state.lastAt=new Date().toISOString();
  try{state.boots++;await g.refresh();state.state='READY';state.error=null;return true;}
  catch(error){if(error?.name==='AbortError')return false;state.state='ERROR';state.error=String(error?.message||error);return false;}
}
function bootstrap(){clearTimeout(bootTimer);bootTimer=setTimeout(()=>invoke('DOM_BOOTSTRAP'),120);}
function settled(){clearTimeout(settleTimer);settleTimer=setTimeout(()=>{state.settledRefreshes++;invoke('CAMERA_SETTLED');},90);}
function armWatchdog(){
  clearInterval(watchdog);watchdog=setInterval(()=>{
    const g=fabric();if(!g?.refresh)return;
    if(g.state==='INITIALIZING'||(!g.fabric&&!g.inFlight))invoke('INITIALIZATION_WATCHDOG');
  },2500);
}
function install(){bootstrap();armWatchdog();window.addEventListener('omega-camera-motion-settled',settled);}
if(typeof document!=='undefined'){
  // Module scripts normally execute before DOMContentLoaded. A microtask bootstrap as well as
  // the event path prevents high-frequency map-view debounce from starving the first query.
  queueMicrotask(bootstrap);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
}
state.refresh=invoke;
state.snapshot=()=>({...state,fabricState:fabric()?.state||null,recordCount:fabric()?.records?.length||0,scarCount:fabric()?.scarLedger?.length||0});
