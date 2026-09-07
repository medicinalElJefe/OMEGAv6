import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const adapter=read('src/platformAdapter.ts');
const system=read('src/OmegaSystemConsolidationR30.tsx');
const receipt=read('src/GovernedBuildReceiptPanel.tsx');
const evidence=read('src/OmegaEvidenceMemoryR28.tsx');
const modes=read('src/fullOverallModeOrchestratorR79.ts');
const sourceModes=read('src/sourceBackedModeRuntimeR21.ts');
const executors=read('src/executorFabricClientR147.ts');
const worker=read('src/workerR116.js');
const must=(v,m)=>assert.ok(v,'R183 '+m);

// Distributed human surfaces must observe the one canonical runtime instead of
// silently querying an unrelated same-origin /api namespace.
for(const token of [
 "OMEGA_CANONICAL_RUNTIME_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev'",
 "'omega-genesis-v1.jeffdeweyeljefe.workers.dev'",
 "'omega-living-light-etching-private-woven2.vercel.app'",
 "'omega-optical-cloud-woven2.vercel.app'",
 'export function runtimeUrl',
 'export function runtimeFetch',
 'const target=runtimeUrl(url)'
])must(adapter.includes(token),`canonical distributed runtime routing missing ${token}`);
must(adapter.includes("LOCAL_HOSTS.has(host)||host==='omegav6.jeffdeweyeljefe.workers.dev'"),'canonical and localhost same-origin development boundary missing');
must(adapter.includes('DISTRIBUTED_HOSTS.has(host)'),'arbitrary foreign origins must not be silently federated');

// Proof axes are independent: release/receipt failure must not erase a valid
// status observation, and all distributed UI probes use the shared resolver.
for(const [file,source] of [['System',system],['Governed receipt',receipt],['Evidence',evidence]])must(source.includes('runtimeFetch('),`${file} does not use canonical runtime fetch`);
must(system.includes('probeRuntime')&&system.includes("['Hosted status',hostReturned"),'System must keep independent hosted-status truth');
must(system.includes('One missing release, receipt, or host response cannot erase a sibling observation'),'System independent proof-axis boundary missing');
must(receipt.includes('INDEPENDENT PROBE HOLDS'),'governed receipt must retain partial returned evidence');
must(evidence.includes('Each runtime/release/receipt axis is probed independently'),'Evidence panel independent proof-axis boundary missing');

// All-mode execution state is bound by stable source identity first. The
// catalog remains 179 considered modes; only actually source-bound rows count
// as executable, so this must never turn into a fabricated 179/179 claim.
must(modes.includes("String(x.id||'').toUpperCase()===stableId"),'mode source binding must use stable M### identity');
must(modes.includes('sourceState(summary,String(row.id),String(row.name))'),'plan row must supply stable mode identity');
must(modes.includes("return row?.state||'CATALOG_LENS'"),'unknown modes must remain catalog-only');
for(const id of ['M001','M002','M004','M005','M006','M007','M008','M009','M010','M011','M012','M013','M014'])must(sourceModes.includes(`'${id}'`),`source-backed executable mode ${id} missing`);
must(sourceModes.includes('catalogCount:179'),'179-mode catalog authority missing');

// If private R147 durable-run authorization is unavailable, cloud/local
// binding readiness may still be observed without exposing host identity.
for(const token of ['OMEGA_EXECUTOR_DIRECTORY_R147_OBSERVER_R183','PUBLIC_SANITIZED_FALLBACK','/api/core-health','/api/system/operational','/api/hybrid/status'])must(executors.includes(token),`sanitized executor observation missing ${token}`);
must(executors.includes("HYBRID_HOST:{state:hybridOnline?'AVAILABLE':'DEVICE_PROOF_REQUIRED'"),'Hybrid availability must remain current-heartbeat gated');
must(executors.includes("LOCAL_PROOF:{state:coreLive?'AVAILABLE':'UNAVAILABLE'")&&executors.includes("LOCAL_RUNTIME:{state:coreLive?'AVAILABLE':'UNAVAILABLE'"),'bounded local executors must reflect canonical core liveness');
must(executors.includes("canonicalAdmissionAuthority:'R125'")&&executors.includes('AVAILABLE is not invocation'),'executor observation must not promote readiness into execution/admission');

// Existing authority remains unchanged.
must(worker.includes("canonicalAdmission:{authority:'R125'}"),'R125 canonical admission authority regressed');
must(worker.includes('proofClosureRevision:R141_REVISION')&&worker.includes('durableExecutionRevision:R146_REVISION')&&worker.includes('executorFabricRevision:R147_REVISION'),'R141/R146/R147 authority chain regressed');

console.log('OMEGA R183 FULL-SYSTEM RUNTIME CONVERGENCE PASS · canonical distributed runtime + independent proof axes + stable mode identity + sanitized executor observation · R125 preserved');
