import fs from 'node:fs';
import crypto from 'node:crypto';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const out=process.env.OMEGA_R145_OUT||'/tmp/omega-r145-live-execution-evidence.json';
const observedAt=new Date().toISOString();
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const probes=[];

async function request(path,options={},attempts=3){
 let last='';
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const response=await fetch(base+path,{...options,headers:{'cache-control':'no-cache',...(options.headers||{})}});
   const text=await response.text();
   return{ok:response.ok,status:response.status,text,headers:response.headers,attempt};
  }catch(error){last=error instanceof Error?error.message:String(error)}
  if(attempt<attempts)await sleep(1500);
 }
 throw new Error(last||'request failed');
}
function parseJson(text){try{return JSON.parse(text)}catch{return null}}
function record(id,capabilityId,path,ok,detail,residualKind='DEPLOYMENT_UNPROVEN',severity='HIGH',extra={}){
 probes.push({id,capabilityId,path,ok,detail,residualKind,severity,observedAt,...extra});
}

try{
 const r=await request('/api/runtime-attestation'),data=parseJson(r.text);
 const sourceSha=data?.bindings?.sourceSha||data?.source?.sha||null;
 const packageSha=data?.bindings?.packageReceiptSha256||data?.packageReceipt?.receiptSha256||null;
 const runtimeVersionId=data?.bindings?.cloudflareVersionId||data?.runtimeVersion?.id||null;
 const valid=Boolean(r.ok&&data?.schema==='OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144'&&data?.revision==='R144'&&sourceSha&&packageSha&&runtimeVersionId&&data?.runtimeAuthority?.canonicalMutation===false&&data?.runtimeAuthority?.admissionAuthority==='R125');
 record('runtime-attestation-r144','canonical-runtime','/api/runtime-attestation',valid,valid?`R144 source ${sourceSha} · package ${packageSha} · Cloudflare ${runtimeVersionId}`:`R144 attestation incomplete: ${r.text.slice(0,320)}`,'DEPLOYMENT_UNPROVEN','HIGH',{httpStatus:r.status,sourceSha256:sourceSha,packageReceiptSha256:packageSha,cloudflareVersionId:runtimeVersionId,lifecycle:data?.lifecycle||null});
}catch(error){record('runtime-attestation-r144','canonical-runtime','/api/runtime-attestation',false,String(error),'DEPLOYMENT_UNPROVEN','HIGH')}

try{
 const r=await request('/api/health'),data=parseJson(r.text);
 const valid=Boolean(r.ok&&data);
 record('canonical-health','canonical-runtime','/api/health',valid,valid?`HTTP ${r.status}`:`HTTP ${r.status}: ${r.text.slice(0,180)}`,'DEPLOYMENT_UNPROVEN','HIGH',{httpStatus:r.status});
}catch(error){record('canonical-health','canonical-runtime','/api/health',false,String(error),'DEPLOYMENT_UNPROVEN','HIGH')}

try{
 const r=await request('/api/hybrid/status'),data=parseJson(r.text);
 const valid=Boolean(r.ok&&data?.state==='DEVICE_PROOF_REQUIRED'&&data?.nativeExecutionClaimed===false);
 record('hybrid-sessionless-truth-gate','hybrid-execution','/api/hybrid/status',valid,valid?'Sessionless Hybrid status correctly requires current device proof.':`Hybrid truth-gate mismatch: ${r.text.slice(0,280)}`,'TRUTH_BOUNDARY_RISK','CRITICAL',{httpStatus:r.status,state:data?.state||null,nativeExecutionClaimed:data?.nativeExecutionClaimed??null});
}catch(error){record('hybrid-sessionless-truth-gate','hybrid-execution','/api/hybrid/status',false,String(error),'TRUTH_BOUNDARY_RISK','CRITICAL')}

try{
 const r=await request('/api/hybrid/agent-download');
 const local=fs.readFileSync('public/omega-hybrid-agent.py','utf8'),expected=sha(local),actual=sha(r.text),header=r.headers.get('x-omega-agent-sha256');
 const valid=Boolean(r.ok&&r.text.startsWith('#!/usr/bin/env python3')&&r.text.includes('OMEGA Hybrid Link agent')&&actual===expected&&header===expected);
 record('hybrid-agent-source-lineage','hybrid-agent','/api/hybrid/agent-download',valid,valid?`body/header/local sha256 ${actual}`:`Hybrid agent lineage mismatch expected=${expected} actual=${actual} header=${header}`,'SOURCE_LINEAGE_GAP','CRITICAL',{httpStatus:r.status,sourceSha256:actual,expectedSha256:expected,receiptSha256:header});
}catch(error){record('hybrid-agent-source-lineage','hybrid-agent','/api/hybrid/agent-download',false,String(error),'SOURCE_LINEAGE_GAP','CRITICAL')}

try{
 const r=await request('/api/federation/run/status',{headers:{'x-omega-session-id':'r145_execution_residual_probe'}}),data=parseJson(r.text);
 const optical=String(data?.nodes?.optical?.state||'');
 const valid=Boolean(r.ok&&data?.schema==='OMEGA_FEDERATION_RUN_STATUS_R97'&&data?.nodes?.omegaV6?.state==='LIVE'&&data?.nodes?.genesis?.state==='LIVE'&&['LIVE','ACCESS_GATED','DEGRADED','UNREACHABLE'].includes(optical));
 record('federation-authority-state','federation-run','/api/federation/run/status',valid,valid?`OMEGAv6 ${data.nodes.omegaV6.state} · Genesis ${data.nodes.genesis.state} · Optical ${optical} · Sovereign ${data.nodes?.sovereign?.state||'unknown'}`:`Federation state invalid: ${r.text.slice(0,340)}`,'DEPLOYMENT_UNPROVEN','HIGH',{httpStatus:r.status});
}catch(error){record('federation-authority-state','federation-run','/api/federation/run/status',false,String(error),'DEPLOYMENT_UNPROVEN','HIGH')}

try{
 const text='R145 authoritative route and execution residual closure probe';
 const r=await request('/api/route-preview',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text})}),data=parseJson(r.text);
 const valid=Boolean(r.ok&&String(data?.route||'').length);
 record('route-before-generation','route-preview','/api/route-preview',valid,valid?`route ${data.route}`:`Route preview unavailable: ${r.text.slice(0,240)}`,'CAPABILITY_UNWIRED','MEDIUM',{httpStatus:r.status,route:data?.route||null});
}catch(error){record('route-before-generation','route-preview','/api/route-preview',false,String(error),'CAPABILITY_UNWIRED','MEDIUM')}

const failed=probes.filter(probe=>!probe.ok);
const evidence={
 schema:'omega.execution.evidence.r145.v1',revision:'R145',authority:'OMEGAV6',canonicalUrl:base,observedAt,probes,
 summary:{total:probes.length,passed:probes.length-failed.length,failed:failed.length},
 authorityChain:{operation:'R143',execution:'R142',hybridProof:'R141',deployment:'R144',residualPolicy:'R125',selfBuild:'R124',canonicalAdmission:'R125'},
 canonicalMutation:false,admissionAuthority:'R125',
 truthBoundary:'These are bounded first-hand live observations made after deployment. A failed probe is residual evidence, not automatic proof of root cause. A passing probe proves only the tested contract at this observation time. R144 runtime attestation separates source/package/runtime facts from external GitHub QA and post-deploy verification; R145 does not infer those missing facts and never mutates CanonState.'
};
fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n','utf8');
console.log(JSON.stringify({schema:evidence.schema,total:probes.length,passed:evidence.summary.passed,failed:evidence.summary.failed,out,failedIds:failed.map(x=>x.id)},null,2));
