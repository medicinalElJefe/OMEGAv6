import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R243 ${msg}`);
const policy=JSON.parse(read('public/omega-r243-woven-selfbuild-fabric.json'));
const fabric=read('scripts/lib/r243-woven-selfbuild-fabric.mjs');
const engine=read('scripts/r170-selfbuild-engine.mjs');
const worker101=read('src/workerR101.js');
const worker102=read('src/workerR102.js');
const agent=read('public/omega-hybrid-agent-r141.py');
const ui=read('src/HybridExecutionMotionR243.tsx');
const link=read('src/HybridLinkR32.tsx');
const nav=read('src/navigationLemmaCalculusR242.js');
const r242Motion=read('tests/r242-hybrid-execution-motion-invariants.mjs');
const r242Fence=read('tests/r242-hybrid-terminal-fence-invariants.mjs');
const r240=read('tests/r240-recursive-exact-self-promotion-invariants.mjs');

assert.equal(policy.revision,'R243');
assert.equal(policy.inherits.navigationLemma,'R242');
assert.equal(policy.authority.sourceMutationAndPromotion,'R240_SINGLE_CANDIDATE_ONLY');
assert.equal(policy.authority.canonStateAdmission,'R125');
assert.equal(policy.authority.canonAdmissionClaimed,false);
for(const token of ['R242_READ_ONLY_NAVIGATION_LEMMA','R240_SINGLE_CANDIDATE_SOURCE_PROMOTION','R239_SELECTED_HOST_RESOURCE_ADMISSION','R147_EXECUTOR_SELECTION_AND_DISPATCH','R141_EXACT_RETURN_VERIFICATION','R146_DURABLE_EXECUTION_HISTORY','R125_SOLE_CANONSTATE_ADMISSION'])must(fabric.includes(token),`invariant carry missing ${token}`);
for(const token of ['planWovenBuildFabricR243','BLOCKED_BY_R243_FABRIC','BLOCKED_BY_R243_R240_SELECTION_DIVERGENCE','wovenFabricR243',"planningFabricRevision:'R243'"])must(engine.includes(token),`self-build integration missing ${token}`);
must(r240.includes("await import('./r243-woven-selfbuild-fabric-invariants.mjs')"),'R240 exact-promotion proof must transitively execute R243 fabric proof');

// The already-built R242 agent lease protocol is retained as an internal transport primitive; R243 is the convergence/release layer above it.
for(const token of ["EXECUTION_MOTION_REVISION='R242'","'/api/hybrid/agent/progress':'/agent/progress'",'RUNNING_LEASE_MS=20000','recoverStalledJobsR242','R242_JOB_STALL_RECOVERED'])must(worker101.includes(token),`inherited execution-motion transport missing ${token}`);
for(const token of ['R242_TERMINAL_RESULT_FENCED','R242_RESULT_LEASE_EXPIRED','R242_STALL_OPERATOR_REVIEW_REQUIRED'])must(worker102.includes(token),`inherited terminal fence missing ${token}`);
for(const token of ["EXECUTION_MOTION_EXTENSION='R242'",'PROGRESS_INTERVAL_SECONDS=3.0',"'/api/hybrid/agent/progress'",'threading.Thread',"send_progress('RETURNING')",'resultFingerprintR141'])must(agent.includes(token),`agent lease transport missing ${token}`);
must(r242Motion.includes('immutable R205')&&r242Fence.includes('terminal duplicate must be fenced'),'R243 must retain executable R242 transport/fence proofs, not merely source markers');

for(const token of ["const PROTOCOLS=new Set(['R242','R243'])","data-r243-motion={state}","data-r243-transport={protocol}",'R243 · HYBRID EXECUTION MOTION CONVERGENCE','R242 read-only navigation'])must(ui.includes(token),`R243 operator convergence missing ${token}`);
must(link.includes("import HybridExecutionMotionR243 from './HybridExecutionMotionR243'"),'Hybrid Link must mount the R243 successor surface');
must(link.includes('<HybridExecutionMotionR243/>'),'Hybrid Link must render R243 motion convergence');
must(!link.includes('<HybridExecutionMotionR242/>'),'legacy R242 motion UI must not remain the active Hybrid surface');
must(link.includes('R243 WOVEN SELF-BUILD + EXECUTION-MOTION CONVERGENCE')&&link.includes('R242 NAVIGATION PRESERVED'),'Hybrid operator truth must distinguish R243 release convergence from R242 navigation authority');

must(nav.includes("R242_NAVIGATION_LEMMA_REVISION='R242'"),'R243 must not rename the already-promoted R242 navigation lemma');
must(nav.includes('NAVIGATION_TRANSFORM_HAS_NO_EXECUTION_OR_CANONSTATE_AUTHORITY'),'R242 navigation must remain read-only under R243');
for(const forbidden of ['canonicalAdmission:true','parallelSourceMutation:true'])must(!fabric.includes(forbidden),`R243 planning fabric may not gain forbidden authority ${forbidden}`);

console.log('OMEGA R243 WOVEN EXECUTION CONVERGENCE PASS · signed R242 navigation identity preserved · R242 authenticated lease/terminal-fence transport retained as lower-level protocol · R243 selected-host operator convergence mounted · R243 woven sparse planning bound to R240 one-candidate source promotion · R239/R147/R141/R146/R125 authorities unchanged');
