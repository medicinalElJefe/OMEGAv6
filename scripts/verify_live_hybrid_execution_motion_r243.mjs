import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const parse=async response=>{const raw=await response.text();let body=null;try{body=JSON.parse(raw)}catch{}return{response,raw,body}};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(!expected)throw new Error('R244 live proof requires OMEGA_PROMOTED_SHA or GITHUB_SHA');

const receipt=await parse(await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}));
if(!receipt.response.ok)throw new Error(`R244 build receipt HTTP ${receipt.response.status}`);
const servedSha=receipt.body?.promotion?.promotedMergeSha||receipt.body?.source?.sha||'';
if(servedSha!==expected)throw new Error(`R244 exact promoted SHA mismatch expected ${expected} served ${servedSha||'NONE'}`);

const manifest=await parse(await fetch(base+'/api/hybrid/connector-manifest',{headers:{'cache-control':'no-cache'}}));
if(!manifest.response.ok)throw new Error(`R244 connector manifest HTTP ${manifest.response.status}: ${manifest.raw.slice(0,300)}`);
if(manifest.body?.schema!=='OMEGA_HYBRID_CONNECTOR_MANIFEST_R127')throw new Error(`R244 connector manifest schema mismatch ${manifest.body?.schema||'NONE'}`);
if(manifest.body?.executionMotion?.revision!=='R243')throw new Error(`R244 inherited motion transport revision mismatch ${manifest.body?.executionMotion?.revision||'NONE'}`);
if(manifest.body?.executionMotion?.progressPath!=='/api/hybrid/agent/progress')throw new Error(`R244 progress path mismatch ${manifest.body?.executionMotion?.progressPath||'NONE'}`);
if(Number(manifest.body?.executionMotion?.runningLeaseMs)!==20000)throw new Error(`R244 running lease mismatch ${manifest.body?.executionMotion?.runningLeaseMs}`);
if(Number(manifest.body?.executionMotion?.legacyStaleMs)!==90000)throw new Error(`R244 legacy stale window mismatch ${manifest.body?.executionMotion?.legacyStaleMs}`);
if(manifest.body?.executionMotion?.staleReconciliationRevision!=='R244')throw new Error(`R244 connector manifest lost stale reconciliation identity ${manifest.body?.executionMotion?.staleReconciliationRevision||'NONE'}`);

const expectedAgent=readFileSync('public/omega-hybrid-agent-r207.py','utf8');
const expectedAgentSha=sha(expectedAgent);
const agentResponse=await fetch(base+'/api/hybrid/agent-download?r244=1',{headers:{'cache-control':'no-cache'}});
const liveAgent=await agentResponse.text();
if(!agentResponse.ok)throw new Error(`R244 canonical agent download HTTP ${agentResponse.status}: ${liveAgent.slice(0,300)}`);
const liveAgentSha=sha(liveAgent),declaredAgentSha=String(agentResponse.headers.get('x-omega-agent-sha256')||'');
if(liveAgent!==expectedAgent||liveAgentSha!==expectedAgentSha)throw new Error(`R244 canonical agent byte drift expected ${expectedAgentSha} served ${liveAgentSha}`);
if(declaredAgentSha!==expectedAgentSha)throw new Error(`R244 canonical agent declared SHA mismatch expected ${expectedAgentSha} declared ${declaredAgentSha||'NONE'}`);
if(agentResponse.headers.get('x-omega-execution-motion')!=='R243')throw new Error(`R244 canonical agent route lost inherited execution-motion identity ${agentResponse.headers.get('x-omega-execution-motion')||'NONE'}`);
if(agentResponse.headers.get('x-omega-agent-proof-closure')!=='R141')throw new Error(`R244 canonical agent route lost R141 proof closure ${agentResponse.headers.get('x-omega-agent-proof-closure')||'NONE'}`);
if(agentResponse.headers.get('x-omega-agent-base-revision')!=='R205')throw new Error(`R244 canonical agent route lost immutable R205 base identity ${agentResponse.headers.get('x-omega-agent-base-revision')||'NONE'}`);
for(const token of [
  "VERSION='R207'","EXECUTION_MOTION_EXTENSION='R243'","'/api/hybrid/agent/progress'",'PROGRESS_INTERVAL_SECONDS=3.0',
  'threading.Thread',"send_progress('CLAIMED')","send_progress('RETURNING')","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'",
  "EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'"
])if(!liveAgent.includes(token))throw new Error(`R244 canonical downloaded agent missing ${token}`);
for(const forbidden of ['shell=True','pip install','python -m pip','conda install'])if(liveAgent.includes(forbidden))throw new Error(`R244 canonical downloaded agent contains forbidden authority ${forbidden}`);

const expectedProofWrapper=readFileSync('public/omega-hybrid-agent-r141.py','utf8');
const proofWrapperResponse=await fetch(base+'/omega-hybrid-agent-r141.py',{headers:{'cache-control':'no-cache'}});
const liveProofWrapper=await proofWrapperResponse.text();
if(!proofWrapperResponse.ok)throw new Error(`R244 historical R141 proof wrapper HTTP ${proofWrapperResponse.status}`);
if(liveProofWrapper!==expectedProofWrapper)throw new Error(`R244 R141 proof-wrapper byte drift expected ${sha(expectedProofWrapper)} served ${sha(liveProofWrapper)}`);

const status=await parse(await fetch(base+'/api/hybrid/status',{headers:{'cache-control':'no-cache'}}));
if(!status.response.ok)throw new Error(`R244 Hybrid status HTTP ${status.response.status}`);
if(status.body?.executionMotionRevision!=='R243')throw new Error(`R244 public status lost inherited motion revision: ${status.body?.executionMotionRevision||'NONE'}`);
if(status.body?.staleReconciliationRevision!=='R244')throw new Error(`R244 public status lost stale reconciliation revision: ${status.body?.staleReconciliationRevision||'NONE'}`);
if(Number(status.body?.runningLeaseMs)!==20000)throw new Error(`R244 public status lease mismatch: ${status.body?.runningLeaseMs}`);
const current=Array.isArray(status.body?.devices)?status.body.devices.filter(d=>d?.online&&!d?.revoked):[];
if(status.body?.state==='VERIFIED_DEVICE_ONLINE'){
  if(status.body?.nativeExecutionClaimed!==true||current.length<1)throw new Error('R244 claims a current host without authenticated device truth');
}else if(status.body?.state==='DEVICE_PROOF_REQUIRED'||status.body?.state==='PAIRING_REQUIRED'){
  if(status.body?.nativeExecutionClaimed===true||current.length!==0)throw new Error('R244 proof-required state conflicts with current host projection');
}else throw new Error(`R244 unsupported Hybrid truth state ${status.body?.state}`);

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
await page.goto(base+'/',{waitUntil:'networkidle'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();
await hybridEntry.waitFor({state:'visible'});await hybridEntry.click();
const motion=page.locator('[data-r243-motion]');
await motion.waitFor({state:'visible'});
const motionState=String(await motion.getAttribute('data-r243-motion')||'');
const motionJob=String(await motion.getAttribute('data-r243-job')||'');
const motionEpoch=Number(await motion.getAttribute('data-r243-epoch')||0);
const transport=String(await motion.getAttribute('data-r243-transport')||'NONE');
const allowedStates=new Set(['IDLE','QUEUED','CLAIMED_STARTING','MOTION_PROVED','STALL_DETECTED','LEGACY_RUNNING_NO_LEASE']);
if(!allowedStates.has(motionState))throw new Error(`R244 live browser unsupported R243 motion state ${motionState||'NONE'}`);
if(!Number.isFinite(motionEpoch)||motionEpoch<1)throw new Error(`R244 live browser missing shared snapshot epoch: ${motionEpoch}`);
const text=await motion.innerText();
for(const token of ['R243 · HYBRID EXECUTION MOTION CONVERGENCE','CURRENT STEP','MOTION / LEASE','RETURNED STEP COUNT','R141 returned proof'])if(!text.includes(token))throw new Error(`R244 live browser missing ${token}`);
if(motionState==='MOTION_PROVED'){
  if(transport!=='R243')throw new Error(`R244 MOTION_PROVED used non-R243 transport ${transport}`);
  if(!motionJob||motionJob==='NONE')throw new Error('R244 MOTION_PROVED lacks exact selected-host job identity');
  if(!text.includes('last pulse')||!text.includes('lease'))throw new Error('R244 MOTION_PROVED lacks visible pulse/lease evidence');
}
if(motionState==='LEGACY_RUNNING_NO_LEASE'&&!text.includes('restart the canonical PC connector after R243 deploy'))throw new Error('R244 legacy-running state does not expose canonical connector recovery instruction');
if(motionState==='STALL_DETECTED'&&!text.includes('fails the stale claim closed'))throw new Error('R244 stalled state does not expose fail-closed semantics');
if(pageErrors.length)throw new Error(`R244 live browser page errors: ${pageErrors.join(' | ')}`);
await browser.close();

console.log(`R244 LIVE MOTION + STALE RECONCILIATION PASS · exact SHA ${expected} · canonical agent ${liveAgentSha} exact bytes + declared SHA · route proves R243/R141/R205 · 20s lease / 90s legacy window · R244 authenticated-read reconciliation metadata live · Hybrid ${status.body.state} · current devices ${current.length} · browser state ${motionState} · job ${motionJob||'NONE'} · transport ${transport} · shared epoch ${motionEpoch} · no command or mutation issued`);
