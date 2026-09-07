const base=String(process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expected=String(process.env.GITHUB_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!/^https:\/\//.test(base)) throw new Error(`R199 canonical runtime URL unavailable: ${base}`);
if(!/^[a-f0-9]{40}$/i.test(expected)) throw new Error(`R199 invalid expected promoted SHA: ${expected}`);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let last='';
for(let attempt=1;attempt<=40;attempt++){
  try{
    const [releaseRes,attestationRes,healthRes,manifestRes]=await Promise.all([
      fetch(base+'/api/release-evidence',{headers:{'cache-control':'no-cache'}}),
      fetch(base+'/api/runtime-attestation',{headers:{'cache-control':'no-cache'}}),
      fetch(base+'/api/core-health',{headers:{'cache-control':'no-cache'}}),
      fetch(base+'/api/execution/r147/manifest',{headers:{'cache-control':'no-cache'}})
    ]);
    const [releaseText,attestationText,healthText,manifestText]=await Promise.all([releaseRes.text(),attestationRes.text(),healthRes.text(),manifestRes.text()]);
    if(!releaseRes.ok||!attestationRes.ok||!healthRes.ok||!manifestRes.ok) throw new Error(`HTTP release=${releaseRes.status} attestation=${attestationRes.status} health=${healthRes.status} manifest=${manifestRes.status}`);
    const release=JSON.parse(releaseText),attestation=JSON.parse(attestationText),health=JSON.parse(healthText),manifest=JSON.parse(manifestText);
    if(release?.source?.sha!==expected||attestation?.source?.sha!==expected){
      last=`waiting for exact promoted source ${expected}; release=${release?.source?.sha||'NONE'} attestation=${attestation?.source?.sha||'NONE'}`;
      await sleep(3000);
      continue;
    }
    if(release.schema!=='OMEGA_RELEASE_EVIDENCE_V1') throw new Error(`release schema mismatch ${release.schema}`);
    if(attestation.schema!=='OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144'||attestation.revision!=='R144') throw new Error(`runtime attestation mismatch ${attestation.schema}/${attestation.revision}`);
    if(health.schema!=='OMEGA_CANONICAL_CORE_HEALTH_R163'||health.revision!=='R163'||health.ok!==true||health.state!=='LIVE'||health.canonicalRequest!==true) throw new Error('R163 first-hand canonical core health mismatch');
    if(healthRes.headers.get('x-omega-core-health')!=='R163-FIRST-HAND'||healthRes.headers.get('x-omega-canonical-origin')!==base) throw new Error('R163 first-hand canonical response headers missing');
    if(!String(release?.runtimeVersion?.id||'').trim()||release.runtimeVersion.id!==attestation?.runtimeVersion?.id) throw new Error('exact deployed Cloudflare Version ID binding mismatch');
    if(health?.runtimeVersion?.id&&health.runtimeVersion.id!==release.runtimeVersion.id) throw new Error('R163 Worker Version ID disagrees with exact release evidence');

    if(manifest.schema!=='OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147'||manifest.revision!=='R147'||manifest.ok!==true) throw new Error(`R147 manifest mismatch ${manifest.schema}/${manifest.revision}`);
    if(manifest.performance?.revision!=='R185') throw new Error('R185 temporal performance fabric missing from live R147 manifest');
    if(manifest.performance?.multiAxis?.revision!=='R193') throw new Error('R193 multi-axis refinement fabric missing from live R147 manifest');
    if(manifest.contentReuse?.revision!=='R194') throw new Error('R194 verified whole-result reuse missing from live R147 manifest');
    if(manifest.differentialPartitionExecution?.revision!=='R195') throw new Error('R195 differential partition carry missing from live R147 manifest');
    if(manifest.boundedPartitionParallelism?.revision!=='R196'||manifest.boundedPartitionParallelism?.hardConcurrencyMax!==12) throw new Error('R196 hard bounded scheduler or max-12 ceiling missing from live R147 manifest');
    const r197=manifest.adaptivePartitionBackpressure;
    if(r197?.revision!=='R197'||r197?.schema!=='OMEGA_ADAPTIVE_PARTITION_BACKPRESSURE_MANIFEST_R197') throw new Error('R197 adaptive partition backpressure missing from live R147 manifest');
    if(r197?.controller?.type!=='BOUNDED_AIMD') throw new Error(`R197 controller type mismatch ${r197?.controller?.type}`);
    if(!same(r197?.dynamicTurn?.states,['STAY','TURN'])) throw new Error(`R197 STAY/TURN states mismatch ${JSON.stringify(r197?.dynamicTurn?.states)}`);
    if(!same(r197?.dynamicTurn?.directions,['NONE','DOWN','UP','CLAMP'])) throw new Error(`R197 feedback directions mismatch ${JSON.stringify(r197?.dynamicTurn?.directions)}`);
    if(r197?.dynamicTurn?.selfEscalation!==false) throw new Error('R197 self-escalation boundary regressed');
    if(r197?.boundedScheduler?.revision!=='R196'||r197?.boundedScheduler?.hardConcurrencyMax!==12) throw new Error('R197 no longer delegates bounded scheduling to R196');
    if(r197?.authority?.multiAxis!=='R193'||r197?.authority?.wholeReuse!=='R194'||r197?.authority?.differentialCarry!=='R195'||r197?.authority?.boundedScheduler!=='R196'||r197?.authority?.feedbackPolicy!=='R197'||r197?.authority?.dispatch!=='R147'||r197?.authority?.history!=='R146'||r197?.authority?.verifiedReturnReconciliation!=='R182'||r197?.authority?.convergence!=='R159'||r197?.authority?.admission!=='R125') throw new Error(`R197 authority chain mismatch ${JSON.stringify(r197?.authority)}`);
    if(manifest.upstream?.multiAxis!=='R193'||manifest.upstream?.verifiedContentReuse!=='R194'||manifest.upstream?.differentialPartitionExecution!=='R195'||manifest.upstream?.boundedPartitionParallelism!=='R196'||manifest.upstream?.adaptivePartitionBackpressure!=='R197') throw new Error('R147 current execution-control upstream chain mismatch');
    if(manifest.canonicalMutation!==false||manifest.canonicalAdmissionAuthority!=='R125'||r197.canonicalMutation!==false||r197.canonicalAdmissionAuthority!=='R125') throw new Error('R125-only CanonState admission/read-only manifest boundary regressed');

    console.log(`OMEGA R199 LIVE EXECUTION CONTROL PASS · source ${expected} · worker ${release.runtimeVersion.id} · R185→R193→R194→R195→R196→R197 first-hand manifest · R196 max 12 · R197 BOUNDED_AIMD STAY/TURN + NONE/DOWN/UP/CLAMP · R125 admission preserved`);
    process.exit(0);
  }catch(error){
    last=error instanceof Error?error.message:String(error);
    await sleep(3000);
  }
}
throw new Error(`R199 live execution-control proof failed: ${last}`);
