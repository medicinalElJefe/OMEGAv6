export const ARCHIVE_BUCKETS=['omegav6-private-archive','omegav6-private-archive-backup'];
const ARCHIVE_BINDINGS=new Set(['OMEGA_ARCHIVE','OMEGA_ARCHIVE_BACKUP']);
export async function provisionArchive({token,account,fetcher=fetch,retryDelayMs=350}){
 if(!token||!account)throw Error('Private archive provisioning requires existing production Cloudflare credentials; no credential fallback.');
 const url=`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets`;
 const retryableR2Outage=e=>Number(e?.status)>=500&&Number(e?.status)<600&&Number(e?.providerCode)===10001;
 async function call(path,init={}){
  const method=String(init.method||'GET').toUpperCase();
  for(let attempt=1;attempt<=3;attempt++){
   try{
    const r=await fetcher(path,{...init,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'}});
    const b=await r.json();
    if(!r.ok||!b.success){
     const e=new Error(`Private archive provisioning failed: HTTP ${r.status}; provider code ${b.errors?.[0]?.code||'unknown'}`);
     e.status=r.status;e.providerCode=b.errors?.[0]?.code;throw e;
    }
    return b.result;
   }catch(e){
    // GET only: retries are bounded and do not repeat a potentially completed bucket POST.
    if(method!=='GET'||!retryableR2Outage(e)||attempt===3)throw e;
    if(!Number.isFinite(retryDelayMs)||retryDelayMs<0||retryDelayMs>5000)throw Error('ARCHIVE_RETRY_DELAY_INVALID');
    await new Promise(resolve=>setTimeout(resolve,retryDelayMs*attempt));
   }
  }
  throw Error('UNREACHABLE_ARCHIVE_RETRY');
 }
 try{
  for(const name of ARCHIVE_BUCKETS){
   try{await call(url+'/'+name)}catch(e){if(e.status!==404)throw e;await call(url,{method:'POST',body:JSON.stringify({name})})}
   const [managed,custom]=await Promise.all([call(url+'/'+name+'/domains/managed'),call(url+'/'+name+'/domains/custom')]);
   if(managed.enabled!==false||!Array.isArray(custom.domains)||custom.domains.some(x=>x.enabled!==false))throw Error('Private archive refuses a bucket with public or unverified domain access.');
  }
  return {state:'READY',privateBuckets:2};
 }catch(e){
  // This specific provider state holds the optional archive, never core OMEGA.
  if(e.status===403&&Number(e.providerCode)===10042)return {state:'ACCOUNT_ACTIVATION_REQUIRED',providerCode:10042,privateBuckets:0};
  if(retryableR2Outage(e))return {state:'PROVIDER_UNAVAILABLE_HELD',providerCode:10001,providerHttpStatus:e.status,privateBuckets:0,proofTier:'GAP',privateDomainEvidence:'NOT_VERIFIED'};
  throw e;
 }
}
export function archiveRuntimeConfig(base,result){
 const config=JSON.parse(JSON.stringify(base));
 if(result.state!=='READY')config.r2_buckets=(config.r2_buckets||[]).filter(x=>!ARCHIVE_BINDINGS.has(x.binding));
 config.vars={...config.vars,OMEGA_ARCHIVE_STATE:result.state};return config;
}
