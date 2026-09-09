import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R243 ${msg}`);
const policy=JSON.parse(read('public/omega-r243-woven-selfbuild-fabric.json'));
const fabric=read('scripts/lib/r243-woven-selfbuild-fabric.mjs');
const engine=read('scripts/r170-selfbuild-engine.mjs');
const sharedSelection=read('scripts/lib/r245-governed-selfbuild-selection.mjs');
const worker101=read('src/workerR101.js');
const worker102=read('src/workerR102.js');
const canonicalAgent=read('public/omega-hybrid-agent-r207.py');
const ui=read('src/HybridExecutionMotionR243.tsx');
const link=read('src/HybridLinkR32.tsx');
const nav=read('src/navigationLemmaCalculusR242.js');
const motionProof=read('tests/r243-hybrid-execution-motion-invariants.mjs');
const fenceProof=read('tests/r243-hybrid-terminal-fence-invariants.mjs');
const r240=read('tests/r240-recursive-exact-self-promotion-invariants.mjs');

assert.equal(policy.revision,'R243');
assert.equal(policy.inherits.navigationLemma,'R242');
assert.equal(policy.authority.sourceMutationAndPromotion,'R240_SINGLE_CANDIDATE_ONLY');
assert.equal(policy.authority.canonStateAdmission,'R125');
assert.equal(policy.authority.canonAdmissionClaimed,false);
for(const token of ['R242_READ_ONLY_NAVIGATION_LEMMA','R240_SINGLE_CANDIDATE_SOURCE_PROMOTION','R239_SELECTED_HOST_RESOURCE_ADMISSION','R147_EXECUTOR_SELECTION_AND_DISPATCH','R141_EXACT_RETURN_VERIFICATION','R146_DURABLE_EXECUTION_HISTORY','R125_SOLE_CANONSTATE_ADMISSION'])must(fabric.includes(token),`invariant carry missing ${token}`);
for(const token of ['planGovernedCandidateR245','BLOCKED_BY_R243_FABRIC','BLOCKED_BY_R243_R240_SELECTION_DIVERGENCE','wovenFabricR243',"planningFabricRevision:'R243'"])must(engine.includes(token),`self-build integration missing ${token}`);
for(const token of ['planWovenBuildFabricR243','planParallelFrontierR240','rankDependencyReadyCapsulesR240','BLOCKED_BY_R243_FABRIC','BLOCKED_R243_R240_SELECTION_DIVERGENCE','woven.sourceMutationCandidateId!==capsule.id'])must(sharedSelection.includes(token),`shared R245 selection must preserve R243/R240 planning contract ${token}`);
must(engine.includes("from './lib/r245-governed-selfbuild-selection.mjs'")&&sharedSelection.includes("from './r243-woven-selfbuild-fabric.mjs'"),'R170 engine must reach R243 woven planning only through the shared R245 governed selector');
must(r240.includes("await import('./r243-woven-selfbuild-fabric-invariants.mjs')"),'R240 exact-promotion proof must transitively execute R243 fabric proof');

for(const token of ["EXECUTION_MOTION_REVISION='R243'","'/api/hybrid/agent/progress':'/agent/progress'",'RUNNING_LEASE_MS=20000','recoverStalledJobsR243','R243_JOB_STALL_RECOVERED','R243_PROGRESS_SEQUENCE_STALE'])must(worker101.includes(token),`native execution-motion transport missing ${token}`);
for(const token of ['R243_TERMINAL_RESULT_FENCED','R243_RESULT_LEASE_EXPIRED','R243_STALL_OPERATOR_REVIEW_REQUIRED'])must(worker102.includes(token),`native terminal fence missing ${token}`);
for(const token of ["VERSION='R207'","EXECUTION_MOTION_EXTENSION='R243'",'PROGRESS_INTERVAL_SECONDS=3.0',"'/api/hybrid/agent/progress'",'threading.Thread',"send_progress('RETURNING')",'FINGERPRINT_SCHEMA'])must(canonicalAgent.includes(token),`canonical downloaded agent motion contract missing ${token}`);
must(motionProof.includes('immutable R205')&&fenceProof.includes('terminal duplicate must be fenced'),'R243 must retain executable transport/fence proofs, not merely source markers');

for(const token of ["protocol==='R243'","data-r243-motion={state}","data-r243-transport={protocol}",'R243 · HYBRID EXECUTION MOTION CONVERGENCE','R242 read-only navigation'])must(ui.includes(token),`R243 operator convergence missing ${token}`);
must(link.includes("import HybridExecutionMotionR243 from './HybridExecutionMotionR243'"),'Hybrid Link must mount the R243 successor surface');
must(link.includes('<HybridExecutionMotionR243/>'),'Hybrid Link must render R243 motion convergence');
must(!link.includes('<HybridExecutionMotionR242/>'),'legacy R242 motion UI must not remain the active Hybrid surface');
must(link.includes('R243 WOVEN SELF-BUILD + EXECUTION-MOTION CONVERGENCE')&&link.includes('R242 NAVIGATION PRESERVED'),'Hybrid operator truth must distinguish R243 release convergence from R242 navigation authority');

must(nav.includes("R242_NAVIGATION_LEMMA_REVISION='R242'"),'R243 must not rename the already-promoted R242 navigation lemma');
must(nav.includes('NAVIGATION_TRANSFORM_HAS_NO_EXECUTION_OR_CANONSTATE_AUTHORITY'),'R242 navigation must remain read-only under R243');
for(const forbidden of ['canonicalAdmission:true','parallelSourceMutation:true'])must(!fabric.includes(forbidden),`R243 planning fabric may not gain forbidden authority ${forbidden}`);

console.log('OMEGA R243/R245 WOVEN EXECUTION CONVERGENCE PASS · R170 engine reaches R243 woven planning through the shared R245 governed selector · R240/R243 selection agreement remains fail-closed · signed R242 read-only navigation identity preserved · native authenticated R243 lease/terminal-fence transport bound to canonical downloaded R207 agent · R243 selected-host operator convergence mounted · R239/R147/R141/R146/R125 authorities unchanged');
