import {chromium} from 'playwright';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const expectedVersion=String(process.env.OMEGA_EXPECTED_WORKER_VERSION_ID||process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const explicitPromotedSha=String(process.env.OMEGA_PROMOTED_SHA||'').trim();
const expectedSha=explicitPromotedSha||(!expectedVersion?String(process.env.GITHUB_SHA||'').trim():'');
const workerName=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
const versionOverrideHeaders=expectedVersion?{'Cloudflare-Workers-Version-Overrides':`${workerName}="${expectedVersion}"`}:{};
const suffix=Date.now().toString(36);
const session=`ci_r237_${suffix}`;
const device=`device_r237_${suffix}`;
const parse=async response=>{const raw=await response.text();let body=null;try{body=JSON.parse(raw)}catch{}return{response,raw,body}};
const mergeHeaders=(headers={})=>({...versionOverrideHeaders,...headers});
const get=path=>fetch(base+path,{headers:mergeHeaders({'cache-control':'no-cache'})}).then(parse);
const post=(path,body,headers={})=>fetch(base+path,{method:'POST',headers:mergeHeaders({'content-type':'application/json','cache-control':'no-cache',...headers}),body:JSON.stringify(body)}).then(parse);

if(!expectedSha&&!expectedVersion)throw new Error('R237 live proof requires an exact OMEGA_PROMOTED_SHA/GITHUB_SHA or OMEGA_EXPECTED_WORKER_VERSION_ID');

const [publicStatus,coreHealth,convergence,proofWrapper]=await Promise.all([
 get('/api/hybrid/status'),
 get('/api/core-health'),
 get('/api/system/convergence'),
 fetch(base+'/omega-hybrid-agent-r141.py',{headers:mergeHeaders({'cache-control':'no-cache'})}).then(async response=>({response,raw:await response.text()}))
]);
if(!publicStatus.response.ok)throw new Error(`R237 public Hybrid status HTTP ${publicStatus.response.status}`);
if(!coreHealth.response.ok||coreHealth.body?.schema!=='OMEGA_CANONICAL_CORE_HEALTH_R163'||coreHealth.body?.revision!=='R163'||coreHealth.body?.state!=='LIVE'||coreHealth.body?.ok!==true)throw new Error(`R237/R241 first-hand R163 core-health proof failed: ${coreHealth.response.status} ${coreHealth.raw.slice(0,500)}`);
if(coreHealth.body?.canonicalRequest!==true||coreHealth.body?.executionPlanes?.canonicalAdmission?.authority!=='R125'||coreHealth.body?.preserves?.canonicalAdmission!=='R125')throw new Error('R237/R241 live core-health lost R125-only CanonState admission authority');
if(coreHealth.response.headers.get('x-omega-core-health')!=='R163-FIRST-HAND')throw new Error('R237/R241 live core-health lost first-hand R163 response identity');
const servedVersion=String(coreHealth.body?.runtimeVersion?.id||'').trim();
if(!servedVersion)throw new Error('R237/R241 live core-health did not return a Cloudflare Worker Version ID');
if(expectedVersion&&servedVersion!==expectedVersion)throw new Error(`R237 exact Worker Version mismatch expected ${expectedVersion} served ${servedVersion}`);
if(!convergence.response.ok||convergence.body?.schema!=='OMEGA_SYSTEM_CONVERGENCE_R116'||convergence.body?.runtimeRevision!=='R116')throw new Error(`R237/R241 system convergence proof failed: ${convergence.response.status} ${convergence.raw.slice(0,700)}`);
for(const [field,value] of [['proofClosureRevision','R141'],['durableExecutionRevision','R146'],['executorFabricRevision','R147']])if(convergence.body?.[field]!==value)throw new Error(`R237/R241 live convergence authority drift ${field}: ${convergence.body?.[field]||'NONE'}`);
if(convergence.body?.connectorPolicy?.proofClosureRevision!=='R141')throw new Error('R237/R241 connector policy lost R141 exact-return proof authority');
if(!proofWrapper.response.ok||!proofWrapper.raw.includes("BRIDGE_CALCULUS_EXTENSION='R240'")||!proofWrapper.raw.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"))throw new Error(`R237/R241 served R141 wrapper lost R240 bridge/R141 fingerprint identity: HTTP ${proofWrapper.response.status}`);

let servedSha='';
let receiptState='NOT_REQUIRED_FOR_VERSION_PIN';
const receipt=await get(`/omega-build-receipt.json?r237=${Date.now()}`);
if(receipt.response.ok&&receipt.body?.schema==='OMEGA_GOVERNED_BUILD_RECEIPT_V1'){
 servedSha=String(receipt.body?.promotion?.promotedMergeSha||receipt.body?.source?.sha||'').trim();
 receiptState='GOVERNED_RECEIPT_RETURNED';
 if(!/^[0-9a-f]{40}$/i.test(servedSha))throw new Error(`R237 governed build receipt returned invalid served SHA ${servedSha||'NONE'}`);
 if(expectedSha&&servedSha!==expectedSha)throw new Error(`R237 exact promoted SHA mismatch expected ${expectedSha} served ${servedSha}`);
}else if(expectedSha){
 const preview=receipt.raw.slice(0,180).replace(/\s+/g,' ');
 throw new Error(`R237 exact promoted SHA proof requires governed JSON build receipt; received HTTP ${receipt.response.status} ${preview||'EMPTY'}`);
}else{
 const contentType=String(receipt.response.headers.get('content-type')||'').toLowerCase();
 const htmlFallback=contentType.includes('text/html')||/^\s*<!doctype\s+html/i.test(receipt.raw)||/^\s*<html/i.test(receipt.raw);
 if(!htmlFallback&&receipt.response.ok)throw new Error(`R237 non-JSON build receipt response is neither governed receipt nor recognized SPA fallback: ${receipt.raw.slice(0,180)}`);
 receiptState=htmlFallback?'SPA_FALLBACK_NOT_RELEASE_EVIDENCE':`RECEIPT_HTTP_${receipt.response.status}`;
}

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
const context=await browser.newContext({viewport:{width:1440,height:1100},extraHTTPHeaders:versionOverrideHeaders});
const page=await context.newPage();
const pageErrors=[];page.on('pageerror',error=>pageErrors.push(String(error)));
await page.goto(base+'/',{waitUntil:'domcontentloaded'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).waitFor({state:'visible'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();
await hybridEntry.waitFor({state:'visible'});
await hybridEntry.click();
const deck=page.locator('[data-r237-command-authority="AUTHENTICATED_BOUNDED_NATIVE_CONTROL"]');
await deck.waitFor({state:'visible'});
await page.waitForFunction(()=>Number(document.querySelector('[data-r237-command-authority="AUTHENTICATED_BOUNDED_NATIVE_CONTROL"]')?.getAttribute('data-r237-snapshot-epoch')||0)>=1,{timeout:15000});
if(await deck.getAttribute('data-r237-command-authority')!=='AUTHENTICATED_BOUNDED_NATIVE_CONTROL')throw new Error('R237 live browser lost bounded command-authority identity');
const intelligence=page.locator('[data-r238-host-intelligence]');
await intelligence.waitFor({state:'visible'});
const intelligenceState=String(await intelligence.getAttribute('data-r238-host-intelligence')||'');
if(!['RETURNED_HOST_PROOF','AWAITING_RETURNED_PROFILE'].includes(intelligenceState))throw new Error(`R237 live browser lost R238 host-intelligence truth identity: ${intelligenceState}`);

const deckSelected=String(await deck.getAttribute('data-r237-selected-device')||'');
const intelligenceSelected=String(await intelligence.getAttribute('data-r238-selected-device')||'');
if(!deckSelected||!intelligenceSelected||deckSelected!==intelligenceSelected)throw new Error(`R237/R238 selected-device identity mismatch: command ${deckSelected||'NONE'}, intelligence ${intelligenceSelected||'NONE'}`);
if(current.length===0&&deckSelected!=='NONE')throw new Error(`R237/R238 selected a device while public Hybrid truth has no current device: ${deckSelected}`);
if(current.length>0&&deckSelected!=='NONE'&&!current.some(d=>d?.id===deckSelected))throw new Error(`R237/R238 selected device ${deckSelected} is not a current authenticated public device`);

const deckText=await deck.innerText();
for(const token of ['PROVE_HOST','VERIFY_PROJECT','PACKAGE_VERIFIED','TRAIN_LOCAL_INDEX','intentionally contain no APPLY_PATCH or WRITE_TEXT','R239 RESOURCE ENVELOPE'])if(!deckText.includes(token))throw new Error(`R237/R238/R239 live operator marker missing ${token}`);
const correlation=String(await deck.getAttribute('data-r237-correlation')||'');
if(!['LOCKED','HELD'].includes(correlation))throw new Error(`R237 live browser returned unsupported correlation truth state ${correlation||'NONE'}`);
if(correlation==='LOCKED'){
  if(!deckText.includes('HOST / JOB / MISSION / EPOCH LOCKED'))throw new Error('R237 correlation attribute is LOCKED but rendered correlation state does not agree');
}else{
  if(!deckText.includes('EXECUTION CONTEXT HELD'))throw new Error('R237 correlation attribute is HELD but rendered correlation state does not agree');
  if(deckText.includes('HOST / JOB / MISSION / EPOCH LOCKED'))throw new Error('R237 held correlation state must not render a false LOCKED claim');
}
const epoch=Number(await deck.getAttribute('data-r237-snapshot-epoch')||0);
if(!Number.isFinite(epoch)||epoch<1)throw new Error(`R237 live browser did not expose a completed shared snapshot epoch: ${epoch}`);
const intelligenceEpoch=Number(await intelligence.getAttribute('data-r238-snapshot-epoch')||0);
if(!Number.isFinite(intelligenceEpoch)||intelligenceEpoch!==epoch)throw new Error(`R237/R238 live shared-snapshot epoch mismatch: command ${epoch}, intelligence ${intelligenceEpoch}`);
const tier=String(await deck.getAttribute('data-r239-resource-tier')||'');
if(!['UNPROVED','HOLD','CONSTRAINED','READY','HIGH_CAPACITY'].includes(tier))throw new Error(`R239 live browser exposed unsupported selected-host resource-envelope tier ${tier||'NONE'}`);

await deck.getByRole('button',{name:'Refresh shared snapshot'}).click();
await page.waitForTimeout(750);
const refreshedDeckSelected=String(await deck.getAttribute('data-r237-selected-device')||'');
const refreshedIntelligenceSelected=String(await intelligence.getAttribute('data-r238-selected-device')||'');
const refreshedEpoch=Number(await deck.getAttribute('data-r237-snapshot-epoch')||0);
const refreshedIntelligenceEpoch=Number(await intelligence.getAttribute('data-r238-snapshot-epoch')||0);
if(refreshedDeckSelected!==refreshedIntelligenceSelected)throw new Error(`R237/R238 selected-device diverged after explicit refresh: command ${refreshedDeckSelected||'NONE'}, intelligence ${refreshedIntelligenceSelected||'NONE'}`);
if(!Number.isFinite(refreshedEpoch)||refreshedEpoch<epoch||refreshedIntelligenceEpoch!==refreshedEpoch)throw new Error(`R237/R238 shared snapshot diverged after explicit refresh: before ${epoch}, command ${refreshedEpoch}, intelligence ${refreshedIntelligenceEpoch}`);
if(pageErrors.length)throw new Error(`R237 live browser page errors: ${pageErrors.join(' | ')}`);
await context.close();
await browser.close();

const coreHealthAfter=await get('/api/core-health');
if(!coreHealthAfter.response.ok||coreHealthAfter.body?.schema!=='OMEGA_CANONICAL_CORE_HEALTH_R163'||coreHealthAfter.body?.revision!=='R163'||coreHealthAfter.body?.state!=='LIVE'||coreHealthAfter.body?.ok!==true)throw new Error(`R237/R241 closing R163 core-health proof failed: ${coreHealthAfter.response.status} ${coreHealthAfter.raw.slice(0,500)}`);
const closingVersion=String(coreHealthAfter.body?.runtimeVersion?.id||'').trim();
if(!closingVersion||closingVersion!==servedVersion)throw new Error(`R237 exact served-runtime identity changed during proof: opened ${servedVersion||'NONE'} closed ${closingVersion||'NONE'}`);
if(coreHealthAfter.response.headers.get('x-omega-core-health')!=='R163-FIRST-HAND')throw new Error('R237/R241 closing core-health lost first-hand R163 response identity');

const shaLabel=servedSha||expectedSha||'NOT_REQUIRED_FOR_VERSION_PIN';
console.log(`R237/R238/R239/R240/R241 LIVE COMMAND AUTHORITY PASS · exact Worker version ${servedVersion} · SHA ${shaLabel} · receipt ${receiptState} · R163 first-hand core health + R125 admission · R116 convergence binds R141/R146/R147 · served R141 wrapper carries R240 bridge calculus · Hybrid ${publicStatus.body.state} · current public devices ${current.length} · authenticated rotation/backpressure lifecycle · selected device ${refreshedDeckSelected} · semantic correlation ${correlation} · shared epoch ${refreshedEpoch} · R239 tier ${tier} · no rendered prose promoted into authority proof`);
