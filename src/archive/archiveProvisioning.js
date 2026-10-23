export const ARCHIVE_BUCKETS=['omegav6-private-archive','omegav6-private-archive-backup'];
const ARCHIVE_BINDINGS=new Set(['OMEGA_ARCHIVE','OMEGA_ARCHIVE_BACKUP']);
export async function provisionArchive({token,account,fetcher=fetch}){
 if(!token||!account)throw Error('Private archive provisioning requires existing production Cloudflare credentials; no credential fallback.');
 const url=`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets`;
 async function call(path,init={}){
  const r=await fetcher(path,{...init,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'}});const b=await r.json();
  if(!r.ok||!b.success){const e=new Error(`Private archive provisioning failed: HTTP ${r.status}; provider code ${b.errors?.[0]?.code||'unknown'}`);e.status=r.status;e.providerCode=b.errors?.[0]?.code;throw e}return b.result;
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
  throw e;
 }
}
export function archiveRuntimeConfig(base,result){
 const config=JSON.parse(JSON.stringify(base));
 if(result.state!=='READY')config.r2_buckets=(config.r2_buckets||[]).filter(x=>!ARCHIVE_BINDINGS.has(x.binding));
 config.vars={...config.vars,OMEGA_ARCHIVE_STATE:result.state};return config;
}
