import fs from 'node:fs/promises';

const base=String(process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const version=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim()||null;
const runId=String(process.env.GITHUB_RUN_ID||'UNKNOWN');
if(!/^https:\/\//.test(base))throw new Error('R471 requires canonical HTTPS OMEGA_PUBLIC_URL');
if(!/^[a-f0-9]{40}$/i.test(expected))throw new Error('R471 requires exact 40-char promoted SHA');

const get=async path=>{
 const r=await fetch(base+path,{headers:{'cache-control':'no-cache','pragma':'no-cache'},cache:'no-store'});
 const raw=await r.text();
 if(!r.ok)throw new Error(`R471 ${path} HTTP ${r.status}: ${raw.slice(0,300)}`);
 let body;try{body=JSON.parse(raw)}catch{throw new Error(`R471 ${path} is not JSON`)};
 return {body,headers:Object.fromEntries(r.headers)};
};
const [receipt,status,attestation]=await Promise.all([
 get('/omega-build-receipt.json'),get('/api/status'),get('/api/runtime-attestation')
]);
const observed=String(receipt.body?.source?.sha||receipt.body?.sourceSha||'').trim();
if(observed!==expected)throw new Error(`R471 LIVE SHA MISMATCH expected ${expected} observed ${observed||'MISSING'}`);
const attested=String(attestation.body?.bindings?.sourceSha||attestation.body?.source?.sha||'').trim();
if(attested&&attested!==expected)throw new Error(`R471 ATTESTATION SHA MISMATCH expected ${expected} observed ${attested}`);
const closure={
 schema:'OMEGA_PRODUCTION_OBSERVABILITY_R471',
 state:'LIVE_EXACT_SHA_OBSERVED',
 canonicalUrl:base,
 expectedPromotedSha:expected,
 observedBuildReceiptSha:observed,
 attestedSourceSha:attested||null,
 workerVersionId:version,
 githubRunId:runId,
 observedAt:new Date().toISOString(),
 statusState:status.body?.state||null,
 receiptSha256:receipt.body?.receiptSha256||null,
 authority:'OBSERVATION_ONLY',
 canonicalMutation:false
};
await fs.mkdir('artifacts',{recursive:true});
await fs.writeFile('artifacts/omega-production-observability-r471.json',JSON.stringify(closure,null,2)+'\n');
console.log(`R471 PRODUCTION OBSERVABILITY PASS · live ${observed} == promoted ${expected} · ${base}`);
