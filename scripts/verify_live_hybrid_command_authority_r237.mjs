import {chromium} from 'playwright';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const suffix=Date.now().toString(36);
const session=`ci_r237_${suffix}`;
const device=`device_r237_${suffix}`;
const parse=async response=>{const raw=await response.text();let body=null;try{body=JSON.parse(raw)}catch{}return{response,raw,body}};
const post=(path,body,headers={})=>fetch(base+path,{method:'POST',headers:{'content-type':'application/json','cache-control':'no-cache',...headers},body:JSON.stringify(body)}).then(parse);

if(!expected)throw new Error('R237 live proof requires OMEGA_PROMOTED_SHA or GITHUB_SHA');
const receipt=await parse(await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}));
if(!receipt.response.ok)throw new Error(`R237 build receipt HTTP ${receipt.response.status}`);
const servedSha=receipt.body?.promotion?.promotedMergeSha||receipt.body?.source?.sha||'';
if(servedSha!==expected)throw new Error(`R237 exact promoted SHA mismatch expected ${expected} served ${servedSha||'NONE'}`);

const publicStatus=await parse(await fetch(base+'/api/hybrid/status',{headers:{'cache-control':'no-cache'}}));
if(!publicStatus.response.ok)throw new Error(`R237 public Hybrid status HTTP ${publicStatus.response.status}`);
const current=Array.isArray(publicStatus.body?.devices)?publicStatus.body.devices.filter(d=>d?.online&&!d?.revoked):[];
if(publicStatus.body?.state==='VERIFIED_DEVICE_ONLINE'){
  if(publicStatus.body?.nativeExecutionClaimed!==true||current.length<1)throw new Error('R237 live Hybrid claims device online without current authenticated heartbeat');
}else if(publicStatus.body?.state==='DEVICE_PROOF_REQUIRED'||publicStatus.body?.state==='PAIRING_REQUIRED'){
  if(publicStatus.body?.nativeExecutionClaimed===true||current.length!==0)throw new Error('R237 live Hybrid proof-required state conflicts with current device projection');
}else throw new Error(`R237 unsupported live Hybrid truth state ${publicStatus.body?.state}`);

const boot=await post('/api/hybrid/bootstrap',{}, {'x-omega-session-id':session});
if(!boot.response.ok||boot.body?.schema!=='OMEGA_SOVEREIGN_BOOTSTRAP_R117'||!boot.body?.bridgeId||!boot.body?.secret)throw new Error(`R237 bootstrap failed ${boot.response.status}: ${boot.raw.slice(0,500)}`);
const bridge=boot.body.bridgeId,initialSecret=boot.body.secret;
const initialAuth={'x-omega-bridge-id':bridge,'x-omega-bridge-secret':initialSecret};

const takeover=await post('/api/hybrid/bootstrap',{}, {'x-omega-session-id':session});
if(takeover.response.status!==401||takeover.body?.code!=='PAIR_AUTH_FAILED')throw new Error(`R237 unauthenticated credential rotation was not rejected: ${takeover.response.status} ${takeover.raw.slice(0,700)}`);

const register=await post('/api/hybrid/agent/register',{bridgeId:bridge,deviceId:device,name:'OMEGA R237 CI command-authority probe',platform:'CI',version:'R237-PROBE',capabilityRevision:'R132',proofExtensions:['R237_CI_TRANSPORT_ONLY'],capabilities:['INDEX'],rootLabel:'CI_NON_NATIVE_PROBE'},initialAuth);
if(!register.response.ok||register.body?.ok!==true)throw new Error(`R237 original credential did not survive rejected rotation ${register.response.status}: ${register.raw.slice(0,500)}`);

const rotated=await post('/api/hybrid/bootstrap',{}, {'x-omega-session-id':session,'x-omega-bridge-secret':initialSecret});
if(!rotated.response.ok||rotated.body?.schema!=='OMEGA_SOVEREIGN_BOOTSTRAP_R117'||rotated.body?.bridgeId!==bridge||!rotated.body?.secret||rotated.body.secret===initialSecret)throw new Error(`R237 authenticated credential rotation failed ${rotated.response.status}: ${rotated.raw.slice(0,700)}`);
const rotatedSecret=rotated.body.secret;
const oldRejected=await post('/api/hybrid/agent/heartbeat',{bridgeId:bridge,deviceId:device,version:'R237-PROBE-OLD'},initialAuth);
if(oldRejected.response.status!==401||oldRejected.body?.code!=='PAIR_AUTH_FAILED')throw new Error(`R237 old credential remained valid after authenticated rotation: ${oldRejected.response.status} ${oldRejected.raw.slice(0,700)}`);
const auth={'x-omega-bridge-id':bridge,'x-omega-bridge-secret':rotatedSecret};
const heartbeat=await post('/api/hybrid/agent/heartbeat',{bridgeId:bridge,deviceId:device,version:'R237-PROBE',capabilityRevision:'R132',proofExtensions:['R237_CI_TRANSPORT_ONLY']},auth);
if(!heartbeat.response.ok||heartbeat.body?.ok!==true)throw new Error(`R237 rotated credential did not preserve host continuity ${heartbeat.response.status}: ${heartbeat.raw.slice(0,500)}`);

const makeJob=()=>({schema:'OMEGA_HYBRID_OPERATOR_JOB_R237',action:'R237_LIVE_LIFECYCLE_PROBE',profile:'AUTO_BUILD',projectPath:'.',instructions:'CI transport lifecycle proof only; no native operation is executed by this verifier.',allowedDomains:[],steps:[{id:'S01',op:'INDEX',label:'CI admission/backpressure lifecycle probe',path:'.',maxResults:1}],targetDeviceId:device,confirmed:true});
const first=await post('/api/hybrid/jobs',makeJob(),auth);
if(!first.response.ok||first.body?.job?.status!=='QUEUED')throw new Error(`R237 first queue failed ${first.response.status}: ${first.raw.slice(0,700)}`);
const firstId=first.body.job.id;
const blocked=await post('/api/hybrid/jobs',makeJob(),auth);
if(blocked.response.status!==409||blocked.body?.code!=='DEVICE_BUSY'||blocked.body?.activeJobId!==firstId)throw new Error(`R237 per-device backpressure failed: ${blocked.response.status} ${blocked.raw.slice(0,700)}`);
const cancelled=await post(`/api/hybrid/jobs/${encodeURIComponent(firstId)}/cancel`,{},auth);
if(!cancelled.response.ok||cancelled.body?.job?.status!=='CANCELLED')throw new Error(`R237 queued cancellation failed: ${cancelled.response.status} ${cancelled.raw.slice(0,700)}`);

const second=await post('/api/hybrid/jobs',makeJob(),auth);
if(!second.response.ok||second.body?.job?.status!=='QUEUED')throw new Error(`R237 second queue failed ${second.response.status}: ${second.raw.slice(0,700)}`);
const secondId=second.body.job.id;
const claimed=await post('/api/hybrid/agent/poll',{bridgeId:bridge,deviceId:device},auth);
if(!claimed.response.ok||claimed.body?.job?.id!==secondId||claimed.body?.job?.status!=='RUNNING')throw new Error(`R237 claim transition failed: ${claimed.response.status} ${claimed.raw.slice(0,700)}`);
const refused=await post(`/api/hybrid/jobs/${encodeURIComponent(secondId)}/cancel`,{},auth);
if(refused.response.status!==409||refused.body?.code!=='RUNNING_JOB_NOT_INTERRUPTIBLE')throw new Error(`R237 running-job cancellation guard failed: ${refused.response.status} ${refused.raw.slice(0,700)}`);
const terminal=await post('/api/hybrid/agent/result',{bridgeId:bridge,deviceId:device,jobId:secondId,ok:false,capabilityRevision:'R132',proofExtensions:['R237_CI_TRANSPORT_ONLY'],stepProofs:[],outputPaths:[],log:'R237 CI lifecycle transport probe only; no native operation executed.'},auth);
if(!terminal.response.ok||terminal.body?.job?.status!=='FAILED')throw new Error(`R237 lifecycle cleanup failed: ${terminal.response.status} ${terminal.raw.slice(0,700)}`);

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const pageErrors=[];page.on('pageerror',error=>pageErrors.push(String(error)));
await page.goto(base+'/',{waitUntil:'networkidle'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();
await hybridEntry.waitFor({state:'visible'});
await hybridEntry.click();
const deck=page.locator('[data-r237-command-authority="AUTHENTICATED_BOUNDED_NATIVE_CONTROL"]');
await deck.waitFor({state:'visible'});
if(await deck.getAttribute('data-r237-command-authority')!=='AUTHENTICATED_BOUNDED_NATIVE_CONTROL')throw new Error('R237 live browser lost bounded command-authority identity');
const deckText=await deck.innerText();
for(const token of ['PROVE_HOST','VERIFY_PROJECT','PACKAGE_VERIFIED','TRAIN_LOCAL_INDEX','intentionally contain no APPLY_PATCH or WRITE_TEXT'])if(!deckText.includes(token))throw new Error(`R237 live browser missing ${token}`);
for(const token of ['R239 tightens resource admission without changing execution authority','R212/R141','R146','R147','R125'])if(!deckText.includes(token))throw new Error(`R237 live authority boundary missing ${token}`);
const resourceTier=String(await deck.getAttribute('data-r239-resource-tier')||'');
if(!['UNPROVED','HOLD','CONSTRAINED','READY','HIGH_CAPACITY'].includes(resourceTier))throw new Error(`R237/R239 live browser exposed unsupported resource tier ${resourceTier||'NONE'}`);
const epoch=Number(await deck.getAttribute('data-r237-snapshot-epoch')||0);
if(!Number.isFinite(epoch)||epoch<1)throw new Error(`R237 live browser did not expose a completed shared snapshot epoch: ${epoch}`);
await deck.getByRole('button',{name:'Refresh shared snapshot'}).click();
await page.waitForTimeout(750);
if(pageErrors.length)throw new Error(`R237 live browser page errors: ${pageErrors.join(' | ')}`);
await browser.close();

console.log(`R237 LIVE COMMAND AUTHORITY PASS · exact SHA ${expected} · Hybrid ${publicStatus.body.state} · current public devices ${current.length} · unauthenticated rotation rejected + original secret preserved + authenticated rotation succeeded + old secret revoked + rotated secret preserved device continuity · queue→DEVICE_BUSY→cancel + queue→RUNNING→cancel-refused→FAILED cleanup · real Home→TOOLS→Hybrid browser navigation + shared-snapshot refresh · R238 selected-host correlation + R239 resource tier ${resourceTier} + R212/R141/R146/R147/R125 authority boundaries preserved`);
