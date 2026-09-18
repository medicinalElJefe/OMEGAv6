import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const base=String(process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const versionId=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const workerName=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
if(!base||!expected||!versionId)throw new Error('staged release proof requires OMEGA_PUBLIC_URL, exact promoted/source SHA, and OMEGA_WORKER_VERSION_ID');

// Cloudflare Workers version overrides use the Cloudflare-Workers-Version-Overrides request header.
// Keep this helper identical to the child-process preload so every staged request is pinned
// to the exact uploaded candidate while normal production traffic remains on last-known-good.
const override=`${workerName}="${versionId}"`;
const headers=(extra={})=>({'cache-control':'no-cache','Cloudflare-Workers-Version-Overrides':override,...extra});
async function parse(response){const raw=await response.text();let body=null;try{body=JSON.parse(raw)}catch{}return{response,raw,body}}
async function get(path){const row=await parse(await fetch(base+path,{headers:headers()}));if(!row.response.ok)throw new Error(`${path} HTTP ${row.response.status}: ${row.raw.slice(0,500)}`);return row}
async function post(path,body){const row=await parse(await fetch(base+path,{method:'POST',headers:headers({'content-type':'application/json'}),body:JSON.stringify(body)}));if(!row.response.ok)throw new Error(`${path} HTTP ${row.response.status}: ${row.raw.slice(0,500)}`);return row}

const receipt=(await get(`/omega-build-receipt.json?staged=${Date.now()}`)).body;
if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1')throw new Error(`staged receipt schema mismatch ${receipt?.schema}`);
if(receipt?.source?.sha!==expected)throw new Error(`staged source SHA mismatch ${receipt?.source?.sha} != ${expected}`);
if(receipt?.promotion?.promotedMergeSha!==expected)throw new Error(`staged promoted SHA mismatch ${receipt?.promotion?.promotedMergeSha} != ${expected}`);
if(receipt?.promotion?.authority!=='GITHUB_MERGE_PARENTS')throw new Error(`staged receipt authority mismatch ${receipt?.promotion?.authority}`);

await get('/');
for(const path of ['/api/health','/api/core-health']){
  const row=await get(path),data=row.body;
  if(data?.schema!=='OMEGA_CANONICAL_CORE_HEALTH_R163'||data?.revision!=='R163'||data?.state!=='LIVE'||data?.ok!==true)throw new Error(`R163 staged health mismatch on ${path}`);
  if(data?.canonicalRequest!==true||data?.requiredBindings?.assets!==true||data?.requiredBindings?.durableRuntime!==true)throw new Error(`R163 staged required binding proof missing on ${path}`);
  if(data?.executionPlanes?.canonicalAdmission?.authority!=='R125')throw new Error(`R163 staged admission authority regressed on ${path}`);
  if(row.response.headers.get('x-omega-core-health')!=='R163-FIRST-HAND')throw new Error(`R163 staged first-hand header missing on ${path}`);
  if(row.response.headers.get('x-omega-canonical-origin')!==base)throw new Error(`R163 staged canonical origin mismatch on ${path}`);
}
await get('/api/status');
await get('/api/restoration');
const hybrid=(await get('/api/hybrid/status')).body;
const current=Array.isArray(hybrid?.devices)?hybrid.devices.filter(d=>d?.online&&!d?.revoked):[];
if(hybrid?.state==='VERIFIED_DEVICE_ONLINE'){
  if(hybrid?.nativeExecutionClaimed!==true||current.length<1)throw new Error('staged Hybrid claims PC online without authenticated heartbeat');
}else if(hybrid?.state==='DEVICE_PROOF_REQUIRED'){
  if(hybrid?.nativeExecutionClaimed!==false||current.length!==0)throw new Error('staged Hybrid device-proof state contradicts online proof');
}else throw new Error(`staged Hybrid unsupported truth state ${hybrid?.state}`);

const agent=await get('/api/hybrid/agent-download');
if(agent.raw.length<1000||!agent.raw.startsWith('#!/usr/bin/env python3')||!agent.raw.includes('OMEGA Hybrid Link agent'))throw new Error('staged Hybrid agent source contract failed');
const expectedAgentHash=createHash('sha256').update(readFileSync('public/omega-hybrid-agent.py')).digest('hex');
const servedAgentHash=createHash('sha256').update(agent.raw).digest('hex');
if(servedAgentHash!==expectedAgentHash||agent.response.headers.get('x-omega-agent-sha256')!==expectedAgentHash)throw new Error('staged Hybrid agent byte/hash proof failed');

const caps=(await get('/api/hybrid/capabilities')).body;
if(!String(caps?.state||'').includes('DEVICE_PROOF_REQUIRED'))throw new Error('staged Hybrid capability truth gate missing');
for(const op of ['TRAIN_LOCAL','BUILD','READ_VISIBLE_TEXT'])if(!caps?.operations?.includes(op))throw new Error(`staged Hybrid capability missing ${op}`);
if(caps?.trainLocal?.foundationWeightsChanged!==false)throw new Error('staged TRAIN_LOCAL truth boundary regressed');
const plan=(await post('/api/hybrid/plan',{prompt:'Inspect this project, hash the tree, repair the smallest proven defect, build, test, package, and return proof.',root:'.'})).body;
if(plan?.draft?.state!=='DRAFT_ONLY_NOT_QUEUED'||plan?.draft?.confirmed!==false||plan?.draft?.deviceId!==null)throw new Error('staged Hybrid draft mutated queue/confirmation/device state');
const validation=(await post('/api/hybrid/validate',{plan:plan.draft})).body;
if(validation?.valid!==true)throw new Error(`staged Hybrid validation failed ${JSON.stringify(validation)}`);

const earth=(await get('/api/earth/evidence?lat=32.2217&lon=-110.9265')).body;
if(earth?.schema!=='OMEGA_EARTH_EVIDENCE_V1'||earth?.target?.crs!=='WGS84 / EPSG:4326'||String(earth?.evidenceHash||'').length!==64)throw new Error('staged Earth evidence contract failed');
for(const source of ['usgs','eonet','swpc','openMeteo'])if(!earth?.sources?.[source])throw new Error(`staged Earth source envelope missing ${source}`);
const noaa=(await get('/api/earth/noaa/catalog')).body;
if(noaa?.schema!=='OMEGA_EARTH_NOAA_CATALOG_V1'||!Array.isArray(noaa?.coverages)||noaa.coverages.length!==9)throw new Error('staged NOAA catalog contract failed');
const ground=(await get('/api/earth/ground/evidence?lat=32.2217&lon=-110.9265&radius=750')).body;
if(ground?.schema!=='OMEGA_EARTH_GROUND_EVIDENCE_V1'||ground?.target?.crs!=='WGS84 / EPSG:4326'||String(ground?.evidenceHash||'').length!==64)throw new Error('staged Earth ground contract failed');
for(const level of ['EARTH','REGION','CITY','STREET','GROUND'])if(!ground?.levels?.[level])throw new Error(`staged Earth hierarchy missing ${level}`);

const text='Explain the current OMEGA continuity relationship in one concise sentence.';
const route=(await post('/api/route-preview',{text})).body;
if(!String(route?.route||'').startsWith('ROUTED_MODEL'))throw new Error(`staged route-before-generation failed ${JSON.stringify(route)}`);
const context={address:11498,stateId:11499,phase:8,decision:'TURN',modePolicy:'ALL',modeCount:179,nextAddress:11499,metrics:{continuity:.5,plasticity:.5,contradiction:.2,burden:.3,scar:.2,evidence:.5}};
const chat=(await post('/api/chat',{text,context})).body;
if(chat?.ok!==true||chat?.modelInvoked!==true||!String(chat?.provider||'').startsWith('WORKERS_AI:')||String(chat?.reply||'').trim().length<12)throw new Error(`staged Workers AI proof failed ${JSON.stringify(chat)}`);

const helper='--import=./scripts/cloudflare-version-override-fetch.mjs';
const childEnv={...process.env,NODE_OPTIONS:[process.env.NODE_OPTIONS,helper].filter(Boolean).join(' ')};
for(const script of [
  'scripts/verify_federation_live_r1681.mjs',
  'scripts/verify_live_operational_source_authority_r202.mjs',
  'scripts/verify_live_hybrid_command_authority_r237.mjs',
  'scripts/verify_live_hybrid_host_intelligence_r238.mjs'
])execFileSync(process.execPath,[script],{stdio:'inherit',env:childEnv});

console.log(`OMEGA STAGED RELEASE PASS · exact source ${expected} · Cloudflare version ${versionId} · normal production traffic preserved during proof`);
