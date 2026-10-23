// R685: bounded retry ONLY for transient read-only staged GET transport failure.
// A Cloudflare version override remains attached to every request; schema,
// HTTP errors, wrong version, evidence and source hashes are never retried away.
const TRANSIENT=new Set(['ECONNRESET','ETIMEDOUT','EPIPE','ECONNREFUSED','UND_ERR_CONNECT_TIMEOUT','UND_ERR_SOCKET']);
export function isTransientStagedTransportR685(err){
 let e=err;
 for(let i=0;i<5&&e;i++,e=e.cause){
  if(TRANSIENT.has(String(e.code||'')))return true;
 }
 return false;
}
export async function stagedReadWithRetryR685(url,options,{fetcher=fetch,sleep=ms=>new Promise(r=>setTimeout(r,ms)),attempts=4,delayMs=400}={}){
 if(!Number.isInteger(attempts)||attempts<1||attempts>6)throw Error('R685 retry budget must be bounded');
 let last;
 for(let i=1;i<=attempts;i++){
  try{return await fetcher(url,options)}
  catch(error){
   if(!isTransientStagedTransportR685(error)||i===attempts)throw error;
   last=error;
   await sleep(delayMs*i);
  }
 }
 throw last||Error('R685 unreachable transport exhaustion');
}
