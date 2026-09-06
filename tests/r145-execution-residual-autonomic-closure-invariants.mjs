import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R145 '+m);
const r145=read('src/executionResidualClosureR145.ts');
const hybrid=read('src/HybridProofClosureR141.tsx');
const css=read('src/hybridProofR141.css');
const accuracy=read('scripts/r125-accuracy-engine.mjs');
const live=read('scripts/r145-live-execution-evidence.mjs');
const r143=read('src/authoritativeOperationChainR143.ts');
const r144=read('src/workerR27.js');

for(const law of ['R143_OPERATION_CONTRACT_PRECEDES_REPAIR_ROUTING','R142_EXECUTION_STATE_PRECEDES_RESIDUAL_CLASSIFICATION','R144_DEPLOYMENT_ATTESTATION_PRECEDES_LIVE_DEPLOYMENT_REPAIR_CLAIMS','AVAILABLE_WITHOUT_INVOCATION_IS_NOT_A_DEFECT','INVOKED_WITHOUT_TIMEOUT_IS_NOT_A_DEFECT','RETURNED_WITHOUT_VERIFICATION_REMAINS_A_PROOF_RESIDUAL','FINGERPRINT_DIGEST_OR_SEMANTIC_MISMATCH_IS_A_TRUTH_BOUNDARY_RISK','ONLY_EXPLICIT_NEGATIVE_OR_STALE_EXECUTION_STATE_CREATES_A_REPAIR_RESIDUAL','R125_REMAINS_RESIDUAL_CONFIDENCE_AND_CANONSTATE_ADMISSION_AUTHORITY','R124_REMAINS_GOVERNED_SELF_BUILD_CANDIDATE_AUTHORITY','R141_REMAINS_EXACT_HYBRID_PAYLOAD_PROOF_AUTHORITY','REPAIR_ELIGIBILITY_NEVER_EQUALS_CANONSTATE_ADMISSION'])must(r145.includes(`'${law}'`),'law missing '+law);
for(const passive of ["r.state==='VERIFIED'","r.state==='AVAILABLE'","r.state==='AUTHORIZED'","r.state==='DISCOVERED'","r.state==='INVOKED'"])must(r145.includes(passive),'passive non-defect state missing '+passive);
for(const negative of ["r.state==='RETURNED'","r.state==='STALE'","r.state==='UNAVAILABLE'","r.state==='REJECTED'","r.state==='FAILED'"])must(r145.includes(negative),'negative residual state missing '+negative);
must(r145.includes("operationContractForRouteR143(r.route)")&&r145.includes("operationAuthority:'R143'")&&r145.includes("deploymentAuthority:'R144'"),'R143 route contract and R144 deployment authority must bind residual closure');
must(r145.includes("kind:'TRUTH_BOUNDARY_RISK',severity:'CRITICAL'")&&r145.includes('/fingerprint|digest|semantic|mismatch|truth.boundary|tamper/i'),'exact proof mismatch must become critical truth-boundary risk');
must(r145.includes("id:'RR145-HYBRID-PROOF-REPLAY'")&&r145.includes("generator:'R141_REPLAY_EXISTING_PAYLOAD'"),'bounded R141 replay recipe missing');
must(r145.includes("path:`/api/hybrid/jobs/${encodeURIComponent(jobId)}/replay`")&&r145.includes("canonicalMutation:false as const")&&r145.includes("admissionAuthority:'R125' as const"),'real repair action must remain existing R141 replay and non-canonical');
must(!r145.includes('canonicalMutation:true'),'R145 must never claim canonical mutation');

for(const token of ["data-execution-lifecycle='R142'","data-operation-contract='R143'","data-residual-closure='R145'",'compileExecutionResidualClosureR145','boundedRepairActionR145','R145 EXECUTION → RESIDUAL → BOUNDED REPAIR → PROOF/ADMISSION','repair eligibility ≠ CanonState admission','route R143 · execution R142 · proof R141 · deploy R144 · build R124 · admission R125'])must(hybrid.includes(token),'Hybrid proof surface missing '+token);
must(hybrid.includes("repairAction?.kind==='POST'")&&hybrid.includes('verifyReplay(closure.jobId)'),'eligible Hybrid proof repair must execute existing R141 replay endpoint');
must(css.includes('.r145-residual')&&css.includes('.r145-residual-grid'),'R145 residual UI containment missing');

must(accuracy.includes('OMEGA_R145_EXECUTION_EVIDENCE_PATH')&&accuracy.includes('omega.execution.evidence.r145.v1')&&accuracy.includes('executionEvidenceObserved')&&accuracy.includes('executionEvidenceSchema'),'R125 accuracy engine must ingest and record R145 live execution evidence');
must(accuracy.includes("if(probe?.ok===true)continue")&&accuracy.includes("kind:probe?.residualKind||'DEPLOYMENT_UNPROVEN'")&&accuracy.includes("reproducible:true"),'failed live probes must remain explicit evidence-backed residuals');
must(accuracy.includes("root cause not inferred")&&accuracy.includes("if(r.kind==='TRUTH_BOUNDARY_RISK'||r.severity==='CRITICAL')return'BLOCK'"),'R125 must preserve root-cause uncertainty and critical truth-risk block');
must(accuracy.match(/const recipes=\[\s*\{id:'RR-CAPABILITY-EXPORT-INDEX'/),'R145 must not silently widen R125 auto-mutation recipes');

for(const token of ['omega.execution.evidence.r145.v1','/api/runtime-attestation','OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144','/api/health','/api/hybrid/status','/api/hybrid/agent-download','/api/federation/run/status','/api/route-preview','SOURCE_LINEAGE_GAP','TRUTH_BOUNDARY_RISK','canonicalMutation:false'])must(live.includes(token),'live execution probe missing '+token);
must(live.includes('actual===expected&&header===expected'),'Hybrid source lineage must compare served body, local source and receipt header');
must(live.includes("data?.runtimeAuthority?.canonicalMutation===false")&&live.includes("data?.runtimeAuthority?.admissionAuthority==='R125'"),'R144 live attestation must preserve no-mutation admission boundary');
must(live.includes('A failed probe is residual evidence, not automatic proof of root cause'),'live evidence truth boundary missing');

must(r143.includes("receiptAuthority:'R142'")&&r143.includes("admissionAuthority:'R125'"),'R143 route operation contract authority must remain');
must(r144.includes('OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144')&&r144.includes("publicWorkerMutationAuthority:false")&&r144.includes("canonicalMutation:false"),'R144 runtime deployment attestation truth boundary must remain');

console.log('R145 EXECUTION RESIDUAL AUTONOMIC CLOSURE PASS · R143 route contract → R142 lifecycle → R141 exact Hybrid proof + R144 runtime attestation → R125 residual policy → bounded R141 replay or R124 candidate · CanonState remains proof-gated');
