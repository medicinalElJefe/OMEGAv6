const TRANSIENT=new Set([429,500,502,503,504]);
const DELAYS=[0,180,520,1250];
const nativeFetch=globalThis.fetch?.bind(globalThis);
const state={state:'INITIALIZING',requests:0,retries:0,recovered:0,failed:0,last:null,boundary:'Retries only transient network/429/5xx failures for same-origin Sentinel source/raster/STAC item and source terrain tile transport. It never converts failed evidence into measurement, changes coordinates, substitutes terrain, or retries semantic 4xx evidence failures.'};
globalThis.OMEGA_SAR_BROWSER_TRANSPORT=state;

function watchedUrl(input){
  try{const raw=input instanceof Request?input.url:String(input),u=new URL(raw,location.href);return u.origin===location.origin&&/^\/api\/(?:raster|source|terrain|stac\/item)$/.test(u.pathname)?u:null;}catch{return null;}
}
function methodOf(input,init){return String(init?.method||(input instanceof Request?input.method:'GET')||'GET').toUpperCase();}
function aborted(signal){return signal?.aborted;}
function abortError(signal){return signal?.reason instanceof Error?signal.reason:new DOMException('The operation was aborted.','AbortError');}
function delay(ms,signal){
  if(!ms)return Promise.resolve();
  if(aborted(signal))return Promise.reject(abortError(signal));
  return new Promise((resolve,reject)=>{const t=setTimeout(done,ms);function done(){signal?.removeEventListener?.('abort',onAbort);resolve();}function onAbort(){clearTimeout(t);signal?.removeEventListener?.('abort',onAbort);reject(abortError(signal));}signal?.addEventListener?.('abort',onAbort,{once:true});});
}
function cloneInput(input){try{return input instanceof Request?input.clone():input}catch{return input;}}

async function resilientFetch(input,init){
  const url=watchedUrl(input),method=methodOf(input,init);if(!nativeFetch||!url||!['GET','HEAD'].includes(method))return nativeFetch(input,init);
  const signal=init?.signal||(input instanceof Request?input.signal:null);state.requests++;
  let lastError=null,lastStatus=null;
  for(let i=0;i<DELAYS.length;i++){
    if(aborted(signal))throw abortError(signal);await delay(DELAYS[i],signal);
    try{
      const response=await nativeFetch(cloneInput(input),init);lastStatus=response.status;
      if(!TRANSIENT.has(response.status)){if(i>0)state.recovered++;state.last={url:url.pathname,status:response.status,attempts:i+1,recovered:i>0,at:new Date().toISOString()};return response;}
      if(i===DELAYS.length-1){state.failed++;state.last={url:url.pathname,status:response.status,attempts:i+1,recovered:false,at:new Date().toISOString()};return response;}
      state.retries++;try{await response.body?.cancel?.();}catch{}
    }catch(error){
      if(error?.name==='AbortError'||aborted(signal))throw error;lastError=error;
      if(i===DELAYS.length-1){state.failed++;state.last={url:url.pathname,status:lastStatus,error:error?.message||String(error),attempts:i+1,recovered:false,at:new Date().toISOString()};throw error;}
      state.retries++;
    }
  }
  state.failed++;throw lastError||new Error(`OMEGA source transport failed${lastStatus?` HTTP ${lastStatus}`:''}`);
}

if(nativeFetch&&globalThis.fetch!==resilientFetch){globalThis.fetch=resilientFetch;state.state='READY';}
else if(!nativeFetch)state.state='UNAVAILABLE';
state.snapshot=()=>({state:state.state,requests:state.requests,retries:state.retries,recovered:state.recovered,failed:state.failed,last:state.last,boundary:state.boundary});
