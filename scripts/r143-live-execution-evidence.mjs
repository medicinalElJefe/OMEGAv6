import fs from 'node:fs';
import crypto from 'node:crypto';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const out=process.env.OMEGA_R143_OUT||'/tmp/omega-r143-live-execution-evidence.json';
const observedAt=new Date().toISOString();
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probes=[];

async function request(path,options={},attempts=3){let last='';for(let i=1;i<=attempts;i++){try{const r=await fetch(base+path,{...options,headers:{'cache-control':'no-cache',...(options.headers||{})}});const text=await r.text();return{ok:r.ok,status:r.status,text,headers:r.headers,attempt:i}}catch(e){last=e instanceof Error?e.message:String(e)}if(i<attempts)await sleep(1500)}throw new Error(last||'request failed')}
function record(id,capabilityId,path,ok,detail,residualKind='DEPLOYMENT_UNPROVEN',severity='HIGH',extra={}){probes.push({id,capabilityId,path,ok,detail,residualKind,severity,observedAt,...extra})}

try{const r=await request('/api/health');let data=null;try{data=JSON.parse(r.text)}catch{};record('canonical-health','canonical-runtime','/api/health',r.ok&&Boolean(data),r.ok?`HTTP ${r.status}`:`HTTP ${r.status}: ${r.text.slice(0,180)}`,'DEPLOYMENT_UNPROVEN','HIGH',{httpStatus:r.status})}catch(e){record('canonical-health','canonical-runtime','/api/health',false,String(e),'DEPLOYMENT_UNPROVEN','HIGH')}

try{const r=await request('/api/hybrid/status');let data=null;try{data=JSON.parse(r.text)}catch{};const gate=Boolean(r.ok&&data&&data.state==='DEVICE_PROOF_REQUIRED'&&data.nativeExecutionClaimed===false);record('hybrid-sessionless-truth-gate','hybrid-execution','/api/hybrid/status',gate,gate?'sessionless status correctly requires device proof':`truth gate mismatch: ${r.text.slice(0,240)}`,'TRUTH_BOUNDARY_RISK','CRITICAL',{httpStatus:r.status})}catch(e){record('hybrid-sessionless-truth-gate','hybrid-execution','/api/hybrid/status',false,String(e),'TRUTH_BOUNDARY_RISK','CRITICAL')}

try{const r=await request('/api/hybrid/agent-download');const local=fs.readFileSync('public/omega-hybrid-agent.py','utf8'),expected=sha(local),actual=sha(r.text),header=r.headers.get('x-omega-agent-sha256');const valid=r.ok&&r.text.startsWith('#!/usr/bin/env python3')&&r.text.includes('OMEGA Hybrid Link agent')&&actual===expected&&header===expected;record('hybrid-agent-lineage','hybrid-agent','/api/hybrid/agent-download',valid,valid?`sha256 ${actual}`:`agent lineage mismatch expected=${expected} actual=${actual} header=${header}`,'SOURCE_LINEAGE_GAP','CRITICAL',{httpStatus:r.status,sourceSha256:actual,expectedSha256:expected})}catch(e){record('hybrid-agent-lineage','hybrid-agent','/api/hybrid/agent-download',false,String(e),'SOURCE_LINEAGE_GAP','CRITICAL')}

try{const r=await request('/api/federation/run/status',{headers:{'x-omega-session-id':'r143_execution_residual_probe'}});let data=null;try{data=JSON.parse(r.text)}catch{};const valid=Boolean(r.ok&&data?.schema==='OMEGA_FEDERATION_RUN_STATUS_R97'&&data?.nodes?.omegaV6?.state==='LIVE');record('federation-status','federation-run','/api/federation/run/status',valid,valid?`OMEGAv6 ${data.nodes.omegaV6.state} · Genesis ${data.nodes?.genesis?.state||'unknown'} · Optical ${data.nodes?.optical?.state||'unknown'} · Sovereign ${data.nodes?.sovereign?.state||'unknown'}`:`federation status invalid: ${r.text.slice(0,260)}`,'DEPLOYMENT_UNPROVEN','HIGH',{httpStatus:r.status})}catch(e){record('federation-status','federation-run','/api/federation/run/status',false,String(e),'DEPLOYMENT_UNPROVEN','HIGH')}

try{const text='R143 execution lifecycle residual closure probe';const r=await request('/api/route-preview',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text})});let data=null;try{data=JSON.parse(r.text)}catch{};const valid=Boolean(r.ok&&String(data?.route||'').length);record('route-preview','route-before-generation','/api/route-preview',valid,valid?`route ${data.route}`:`route preview unavailable: ${r.text.slice(0,220)}`,'CAPABILITY_UNWIRED','MEDIUM',{httpStatus:r.status})}catch(e){record('route-preview','route-before-generation','/api/route-preview',false,String(e),'CAPABILITY_UNWIRED','MEDIUM')}

const failed=probes.filter(p=>!p.ok);
const evidence={schema:'omega.execution.evidence.r143.v1',revision:'R143',authority:'OMEGAV6',canonicalUrl:base,observedAt,probes,summary:{total:probes.length,passed:probes.length-failed.length,failed:failed.length},canonicalMutation:false,admissionAuthority:'R125',truthBoundary:'These are bounded live deployment observations. A failed probe is residual evidence, not automatic proof of root cause. A passing probe proves only the tested contract at the observation time; it does not establish universal system truth or mutate CanonState.'};
fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({schema:evidence.schema,total:probes.length,passed:evidence.summary.passed,failed:evidence.summary.failed,out,failedIds:failed.map(x=>x.id)},null,2));
