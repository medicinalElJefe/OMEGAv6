const root=globalThis;
const nativeFetch=typeof root.fetch==='function'?root.fetch.bind(root):null;

export function isGlobalFabricSearchBody(body){
  if(!body||typeof body!=='object')return false;
  const collections=Array.isArray(body.collections)?body.collections:[];
  const sort=Array.isArray(body.sortby)?body.sortby[0]:null;
  return collections.includes('sentinel-1-grd')&&Array.isArray(body.bbox)&&body.bbox.length===4&&sort?.field==='properties.datetime'&&String(sort?.direction||'').toLowerCase()==='desc'&&!body.intersects;
}

function parseBody(init){
  if(typeof init?.body!=='string')return null;
  try{return JSON.parse(init.body);}catch{return null;}
}
function transientStatus(status){return status===408||status===425||status===429||status>=500;}
function sectorKey(body){return Array.isArray(body?.bbox)?body.bbox.map(v=>Number(v).toFixed(2)).join(','):'unknown';}
function sleep(ms,signal){return new Promise((resolve,reject)=>{if(signal?.aborted)return reject(signal.reason||new DOMException('Aborted','AbortError'));const id=setTimeout(resolve,ms);signal?.addEventListener?.('abort',()=>{clearTimeout(id);reject(signal.reason||new DOMException('Aborted','AbortError'));},{once:true});});}

const state={
  state:'READY',release:'R258.2',canonMode:'FULL_OVERALL_CANON',coherenceMode:'UNIFIED_COHERENCE',mode188:'SOURCE_EVIDENCE_ADMISSION_ONLY',
  attempted:0,resolved:0,retried:0,scarCount:0,scarLedger:[],lastAt:null,
  semantics:'A transient failure in one global Sentinel-1 metadata sector is carried as an explicit scar instead of blocking unrelated source-backed sectors. Empty fallback responses contain zero features and therefore cannot create measurement, coverage or inferred pixels.'
};
root.OMEGA_SAR_FABRIC_COHERENCE_TRANSPORT=state;

function recordScar(body,reason,status=null,attempts=0){
  const scar={sector:sectorKey(body),bbox:[...(body?.bbox||[])],reason:String(reason||'unresolved'),status:Number.isFinite(Number(status))?Number(status):null,attempts,at:new Date().toISOString(),measurementPromotion:false};
  state.scarLedger.push(scar);if(state.scarLedger.length>72)state.scarLedger.splice(0,state.scarLedger.length-72);state.scarCount=state.scarLedger.length;state.lastAt=scar.at;return scar;
}
function unresolvedResponse(body,scar){
  return new Response(JSON.stringify({type:'FeatureCollection',features:[],links:[],context:{returned:0},omega:{state:'SOURCE_SECTOR_UNRESOLVED',scar,canonMode:state.canonMode,coherenceMode:state.coherenceMode,measurementPromotion:false}}),{status:200,headers:{'content-type':'application/geo+json; charset=utf-8','cache-control':'no-store','x-omega-fabric-sector':'UNRESOLVED_SCAR','x-omega-measurement-promotion':'false'}});
}
async function attemptFetch(input,init,timeoutMs){
  const parent=init?.signal,controller=new AbortController();
  const relay=()=>controller.abort(parent?.reason||new DOMException('Superseded','AbortError'));
  if(parent?.aborted)relay();else parent?.addEventListener?.('abort',relay,{once:true});
  const timer=setTimeout(()=>controller.abort(new DOMException('Global SAR sector timed out','TimeoutError')),timeoutMs);
  try{return await nativeFetch(input,{...init,signal:controller.signal});}
  finally{clearTimeout(timer);parent?.removeEventListener?.('abort',relay);}
}

async function coherentFetch(input,init={}){
  const body=parseBody(init);
  if(!nativeFetch||!isGlobalFabricSearchBody(body))return nativeFetch(input,init);
  state.attempted++;state.state='QUERYING';state.lastAt=new Date().toISOString();
  let lastError=null,lastStatus=null;
  for(let attempt=1;attempt<=2;attempt++){
    if(init.signal?.aborted)throw init.signal.reason||new DOMException('Superseded','AbortError');
    try{
      const response=await attemptFetch(input,init,attempt===1?6500:8500);
      lastStatus=response.status;
      if(response.ok){state.resolved++;state.state=state.scarCount?'READY_WITH_SCARS':'READY';state.lastAt=new Date().toISOString();return response;}
      if(!transientStatus(response.status))return response;
      lastError=new Error(`Transient global SAR STAC ${response.status}`);
    }catch(error){
      if(init.signal?.aborted)throw init.signal.reason||error;
      lastError=error;
    }
    if(attempt<2){state.retried++;await sleep(220,init.signal);}
  }
  const scar=recordScar(body,lastError?.message||`Transient STAC ${lastStatus}`,lastStatus,2);state.state='READY_WITH_SCARS';
  return unresolvedResponse(body,scar);
}

if(typeof document!=='undefined'&&nativeFetch&&!root.__OMEGA_GLOBAL_FABRIC_COHERENCE_FETCH_INSTALLED){
  root.__OMEGA_GLOBAL_FABRIC_COHERENCE_FETCH_INSTALLED=true;
  root.fetch=coherentFetch;
}

state.snapshot=()=>({state:state.state,attempted:state.attempted,resolved:state.resolved,retried:state.retried,scarCount:state.scarCount,scarLedger:state.scarLedger.slice(-18),canonMode:state.canonMode,coherenceMode:state.coherenceMode,mode188:state.mode188,semantics:state.semantics,lastAt:state.lastAt});
