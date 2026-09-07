import {reconcileSystemLifecycleR200,manifestR200} from '../public/omega-operational-lifecycle-r200-core.js';

const base=String(process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
if(!/^https:\/\//.test(base))throw new Error(`R200 canonical runtime URL unavailable: ${base}`);
if(!/^[a-f0-9]{40}$/i.test(expected))throw new Error(`R200 exact promoted SHA unavailable: ${expected}`);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(path){const response=await fetch(base+path,{headers:{'cache-control':'no-cache'}}),text=await response.text();if(!response.ok)throw new Error(`${path} HTTP ${response.status}: ${text.slice(0,300)}`);return{response,text,json:()=>JSON.parse(text)}}
let last='';
for(let attempt=1;attempt<=40;attempt++){
  try{
    const [receiptRes,coreRes,operationalRes,hybridRes,r147Res,r154Res,htmlRes,jsRes,coreJsRes,cssRes]=await Promise.all([
      get('/omega-build-receipt.json'),get('/api/core-health'),get('/api/system/operational'),get('/api/hybrid/status'),get('/api/execution/r147/manifest'),get('/api/relative-capacity-r154'),get('/omega-operational-lifecycle-r200.html'),get('/omega-operational-lifecycle-r200.js'),get('/omega-operational-lifecycle-r200-core.js'),get('/omega-operational-lifecycle-r200.css')
    ]);
    const receipt=receiptRes.json(),core=coreRes.json(),operational=operationalRes.json(),hybrid=hybridRes.json(),r147=r147Res.json(),r154=r154Res.json();
    const receiptSha=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
    if(receiptSha!==expected){last=`waiting for R200 exact promoted asset source ${expected}; receipt=${receiptSha||'NONE'}`;await sleep(3000);continue}
    if(core.schema!=='OMEGA_CANONICAL_CORE_HEALTH_R163'||core.state!=='LIVE'||core.ok!==true||core.canonicalRequest!==true)throw new Error('R200 live console lacks first-hand R163 canonical core proof');
    if(coreRes.response.headers.get('x-omega-core-health')!=='R163-FIRST-HAND'||coreRes.response.headers.get('x-omega-canonical-origin')!==base)throw new Error('R200 R163 canonical response headers missing');
    if(operational.schema!=='OMEGA_OPERATIONAL_HEALTH_MATRIX_R130')throw new Error(`R200 operational matrix mismatch ${operational.schema}`);
    if(r147.schema!=='OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147'||r147.adaptivePartitionBackpressure?.revision!=='R197'||r147.canonicalAdmissionAuthority!=='R125')throw new Error('R200 live R147/R197 execution fabric mismatch');
    if(r154.schema!=='OMEGA_RELATIVE_CAPACITY_FABRIC_R154'||r154?.authority?.admission!=='R125')throw new Error('R200 live R154 capacity authority mismatch');
    if(!['VERIFIED_DEVICE_ONLINE','DEVICE_PROOF_REQUIRED'].includes(hybrid.state))throw new Error(`R200 Hybrid truth state unsupported ${hybrid.state}`);
    for(const [name,text,tokens] of [
      ['html',htmlRes.text,['OMEGA_OPERATIONAL_LIFECYCLE_R200','Operational Lifecycle Console','confirmExecution','dispatchBtn']],
      ['browser-js',jsRes.text,['/api/execution/runs','/dispatch','/poll','/replay','currentHybridOnline','ui.confirm.checked']],
      ['core-js',coreJsRes.text,['OMEGA_OPERATIONAL_LIFECYCLE_R200','CAPACITY_PLANNED','EXECUTOR_AVAILABLE','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY']],
      ['css',cssRes.text,['.lifecycle','@media (max-width:720px)','@media (max-width:430px)']]
    ])for(const token of tokens)if(!text.includes(token))throw new Error(`R200 deployed ${name} missing ${token}`);
    const system=reconcileSystemLifecycleR200({core,operational,hybrid,directory:null,runs:[]});
    if(system.core.state!=='LIVE'||system.registeredRoutes.count<1||system.routeSpine.state!=='REACHABLE')throw new Error(`R200 public lifecycle projection not operational ${JSON.stringify(system)}`);
    if(system.executors.state!=='PRIVATE_PROOF_REQUIRED'||system.durableRuns.state!=='PRIVATE_PROOF_REQUIRED')throw new Error('R200 must hold private executor/run state rather than synthesize public availability or empty history');
    const m=manifestR200();if(m.revision!=='R200'||m.nativeHybridDispatchRequiresExplicitConfirmation!==true||m.canonicalAdmissionAuthority!=='R125')throw new Error('R200 local manifest authority mismatch');
    console.log(`OMEGA R200 LIVE OPERATIONAL LIFECYCLE PASS · source ${expected} · worker ${core.runtimeVersion?.id||'UNAVAILABLE'} · static console/core exact asset returned · R163 LIVE · R130 ${operational.summary?.state||'UNKNOWN'} · ${system.registeredRoutes.count} routes observed · R147→R197 live · R154 live · Hybrid ${hybrid.state} · private executor/run evidence correctly held without authenticated session · R125 admission preserved`);
    process.exit(0);
  }catch(error){last=error instanceof Error?error.message:String(error);await sleep(3000)}
}
throw new Error(`R200 live operational lifecycle verification failed: ${last}`);
