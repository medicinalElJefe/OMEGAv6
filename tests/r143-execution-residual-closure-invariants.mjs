import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R143 '+m);
const r143=read('src/executionResidualClosureR143.ts');
const hybrid=read('src/HybridProofClosureR141.tsx');
const css=read('src/hybridProofR141.css');
const r125=read('scripts/r125-accuracy-engine.mjs');
const live=read('scripts/r143-live-execution-evidence.mjs');

for(const law of ['EXECUTION_STATE_PRECEDES_RESIDUAL_CLASSIFICATION','AVAILABLE_WITHOUT_INVOCATION_IS_NOT_A_DEFECT','INVOKED_WITHOUT_TIMEOUT_IS_NOT_A_DEFECT','RETURNED_WITHOUT_VERIFICATION_REMAINS_A_PROOF_RESIDUAL','FINGERPRINT_DIGEST_OR_SEMANTIC_MISMATCH_IS_A_TRUTH_BOUNDARY_RISK','R125_REMAINS_RESIDUAL_CONFIDENCE_AND_REPAIR_POLICY_AUTHORITY','R124_REMAINS_GOVERNED_SELF_BUILD_CANDIDATE_AUTHORITY','R141_REMAINS_EXACT_HYBRID_PAYLOAD_PROOF_AUTHORITY','REPAIR_ELIGIBILITY_NEVER_EQUALS_CANONSTATE_ADMISSION'])must(r143.includes(`'${law}'`),'law missing '+law);
for(const passive of ["r.state==='VERIFIED'","r.state==='AVAILABLE'","r.state==='AUTHORIZED'","r.state==='DISCOVERED'","r.state==='INVOKED'"])must(r143.includes(passive),'passive non-defect state missing '+passive);
for(const negative of ["r.state==='RETURNED'","r.state==='STALE'","r.state==='UNAVAILABLE'","r.state==='REJECTED'","r.state==='FAILED'"])must(r143.includes(negative),'negative residual state missing '+negative);
must(r143.includes("kind:'TRUTH_BOUNDARY_RISK',severity:'CRITICAL'")&&r143.includes('/fingerprint|digest|semantic|mismatch|truth.boundary|tamper/i'),'exact-payload mismatch must block as truth-boundary risk');
must(r143.includes("id:'RR143-HYBRID-PROOF-REPLAY'")&&r143.includes("generator:'R141_REPLAY_EXISTING_PAYLOAD'"),'bounded R141 replay recipe missing');
must(r143.includes("path:`/api/hybrid/jobs/${encodeURIComponent(jobId)}/replay`")&&r143.includes("canonicalMutation:false as const")&&r143.includes("admissionAuthority:'R125' as const"),'repair action must remain bounded and non-canonical');
must(!r143.includes('canonicalMutation:true'),'R143 must never claim canonical mutation');

for(const token of ["data-residual-closure='R143'",'compileExecutionResidualClosureR143','boundedRepairActionR143','R143 EXECUTION → RESIDUAL → REPAIR CLOSURE','repair eligibility ≠ CanonState admission','proof R141 · build R124 · admission R125'])must(hybrid.includes(token),'Hybrid proof surface missing '+token);
must(hybrid.includes("repairAction?.kind==='POST'")&&hybrid.includes('verifyReplay(closure.jobId)'),'eligible Hybrid proof repair must execute the existing R141 replay endpoint');
must(css.includes('.r143-residual')&&css.includes('.r143-residual-grid'),'R143 residual UI containment missing');

must(r125.includes("OMEGA_R143_EXECUTION_EVIDENCE_PATH")&&r125.includes("omega.execution.evidence.r143.v1")&&r125.includes("executionEvidenceObserved"),'R125 accuracy engine must ingest R143 live execution evidence');
must(r125.includes("if(probe?.ok===true)continue")&&r125.includes("kind:probe?.residualKind||'DEPLOYMENT_UNPROVEN'")&&r125.includes("reproducible:true"),'failed live probes must remain explicit residual evidence');
must(r125.includes("if(r.kind==='TRUTH_BOUNDARY_RISK'||r.severity==='CRITICAL')return'BLOCK'"),'R125 critical/truth-boundary block must remain');

for(const token of ['omega.execution.evidence.r143.v1','/api/health','/api/hybrid/status','/api/hybrid/agent-download','/api/federation/run/status','/api/route-preview','SOURCE_LINEAGE_GAP','TRUTH_BOUNDARY_RISK','canonicalMutation:false'])must(live.includes(token),'live execution probe missing '+token);
must(live.includes("actual===expected&&header===expected"),'Hybrid source lineage must compare body hash and receipt header');
must(live.includes('A failed probe is residual evidence, not automatic proof of root cause'),'live evidence truth boundary missing');

console.log('R143 EXECUTION RESIDUAL CLOSURE PASS · R142 lifecycle → evidence-backed R125 residual → bounded R141 replay or R124 candidate · critical truth risks block · CanonState remains R125 proof-gated');
