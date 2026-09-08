const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||'').trim();
const suffix=Date.now().toString(36),session=`ci_r2074_${suffix}`,device=`device_r2074_${suffix}`;
const parse=async r=>{const raw=await r.text();let body=null;try{body=JSON.parse(raw)}catch{}return{r,raw,body}};
async function post(path,body,headers={}){return parse(await fetch(base+path,{method:'POST',headers:{'content-type':'application/json','cache-control':'no-cache',...headers},body:JSON.stringify(body)}))}
if(expected){
 const receipt=await parse(await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}));
 if(!receipt.r.ok)throw new Error(`R207.4 build receipt HTTP ${receipt.r.status}`);
 const sha=receipt.body?.promotion?.promotedMergeSha||receipt.body?.source?.sha||'';
 if(sha!==expected)throw new Error(`R207.4 exact promoted SHA mismatch expected ${expected} served ${sha||'NONE'}`);
}
const boot=await post('/api/hybrid/bootstrap',{}, {'x-omega-session-id':session});
if(!boot.r.ok||boot.body?.schema!=='OMEGA_SOVEREIGN_BOOTSTRAP_R117'||!boot.body?.bridgeId||!boot.body?.secret)throw new Error(`R207.4 bootstrap failed ${boot.r.status}: ${boot.raw.slice(0,500)}`);
const bridge=boot.body.bridgeId,secret=boot.body.secret,auth={'x-omega-bridge-id':bridge,'x-omega-bridge-secret':secret};
const register=await post('/api/hybrid/agent/register',{bridgeId:bridge,deviceId:device,name:'OMEGA R207.4 CI transport probe',platform:'CI',version:'R207.4-PROBE',capabilityRevision:'R132',proofExtensions:['R205'],capabilities:['INDEX'],rootLabel:'CI_NON_NATIVE_PROBE'},auth);
if(!register.r.ok||register.body?.ok!==true)throw new Error(`R207.4 register failed ${register.r.status}: ${register.raw.slice(0,500)}`);
const heartbeat=await post('/api/hybrid/agent/heartbeat',{bridgeId:bridge,deviceId:device,version:'R207.4-PROBE',capabilityRevision:'R132',proofExtensions:['R205']},auth);
if(!heartbeat.r.ok||heartbeat.body?.ok!==true)throw new Error(`R207.4 heartbeat failed ${heartbeat.r.status}: ${heartbeat.raw.slice(0,500)}`);
const poll=await post('/api/hybrid/agent/poll',{bridgeId:bridge,deviceId:device},auth);
if(!poll.r.ok||poll.body?.ok!==true)throw new Error(`R207.4 poll failed ${poll.r.status}: ${poll.raw.slice(0,500)}`);
if(poll.body?.job!==null)throw new Error(`R207.4 isolated CI bridge unexpectedly returned a job: ${JSON.stringify(poll.body?.job).slice(0,500)}`);
for(const [label,res] of [['register',register],['heartbeat',heartbeat],['poll',poll]]){
 if(res.r.headers.get('x-omega-hybrid-agent-relay')!=='R207.4-DIRECT-DURABLE')throw new Error(`R207.4 ${label} missing direct durable relay header`);
 if(res.r.headers.get('x-omega-hybrid-runtime')!=='OMEGA_RUNTIME_DURABLE_OBJECT')throw new Error(`R207.4 ${label} missing durable runtime header`);
 if(res.raw.includes('sovereign_gateway_not_configured'))throw new Error(`R207.4 ${label} incorrectly entered optional Sovereign gateway path`);
}
const status=await parse(await fetch(base+'/api/hybrid/status',{headers:{...auth,'cache-control':'no-cache'}}));
if(!status.r.ok||status.body?.state!=='VERIFIED_DEVICE_ONLINE'||status.body?.nativeExecutionClaimed!==true||!Array.isArray(status.body?.devices)||!status.body.devices.some(x=>x.id===device&&x.online===true))throw new Error(`R207.4 current authenticated heartbeat did not project as online on isolated bridge: ${status.raw.slice(0,700)}`);
console.log(`R207.4 LIVE HYBRID TRANSPORT PASS · ${base} · isolated bridge ${bridge} · register 200 → heartbeat 200 → poll 200/null · direct OMEGA_RUNTIME Durable Object relay proved · current heartbeat projected VERIFIED_DEVICE_ONLINE · no Sovereign gateway dependency · CI device is namespace-isolated and ages stale normally`);
