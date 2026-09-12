import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const topology=read('src/livingTopologyR241.ts');
const cognition=read('src/cognitiveAuthorityR241.ts');
const overlay=read('src/ContinuousFieldOverlayR13.tsx');
const css=read('src/continuousFieldR13.css');
const continuous=read('src/continuousFieldR13.ts');
const commandVerifier=read('scripts/verify_live_hybrid_command_authority_r237.mjs');
const commandInvariant=read('tests/r237-hybrid-command-authority-invariants.mjs');
const workflow=read('.github/workflows/r241-archive-convergence.yml');
const governor=JSON.parse(read('public/omega-r170-self-build-governor.json'));
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 'LIVING_TOPOLOGY_NODE_COUNT_R241=1728',
 'field.count!==20736',
 "12×12×12 address groups",
 'governed_immersive_atlas_engine.html',
 'DeltaT_Turn_Operator_Runtime_Dashboard.html',
 'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS',
 "'STAY'|'TURN'|'ESCALATE'|'UNPROVED'",
 'field.routeNext[n.representativeAddress]',
 'gradientPressure','curlProxy','neighborVariance',
 "schema:'OMEGA_LIVING_TOPOLOGY_R241'",
 'not measured physical fluid quantities',
 'not measured physical fluid quantities, execution proof, permission, or CanonState admission'
])must(topology.includes(token),`R241 living topology missing ${token}`);
for(const forbidden of ['Math.random','Date.now','performance.now','setInterval','requestAnimationFrame','fetch(','api.post','localStorage'])must(!topology.includes(forbidden),`R241 living topology must remain deterministic packet-only projection; forbidden ${forbidden}`);

for(const token of [
 'OMEGA_COGNITIVE_AUTHORITY_FRAME_R241',
 'Observation != Interpretation',
 'Interpretation != Hypothesis',
 'Hypothesis != Truth',
 'Reasoning != CanonicalState',
 'Proposal != Permission',
 'Permission != Execution',
 'Execution != SuccessfulOutcome',
 'Returned result != CanonState admission',
 "id:'OBSERVATION'", "id:'INTERPRETATION'", "id:'HYPOTHESIS'", "id:'PROPOSAL'", "id:'AUTHORIZATION'", "id:'EXECUTION'", "id:'RETURN'", "id:'CANON'",
 "id:'AUTHORIZATION',label:'Authorization',status:'GATED'",
 "id:'EXECUTION',label:'Execution',status:'UNPROVED'",
 "id:'RETURN',label:'Exact return',status:'UNPROVED'",
 "id:'CANON',label:'Canon admission',status:'GATED'",
 'R147 dispatch','R146 durable history','R141 exact Hybrid return proof','R125 sole CanonState admission authority',
 'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS'
])must(cognition.includes(token),`R241 typed cognition boundary missing ${token}`);
for(const forbidden of ['api.post','fetch(','localStorage.setItem','window.location','R201','R203'])must(!cognition.includes(forbidden),`R241 cognition projection must not mutate external/canonical state; forbidden ${forbidden}`);

for(const token of [
 'compileDomainBands(field)','compileRouteFlow(field,260)','compileVectorCarryR113(field,260,24)',
 'compileLivingTopologyR241(field)','compileCognitiveAuthorityFrameR241(field,address)',
 'field.routeNext[address]',
 "data-topology-authority='R241_READ_ONLY_PROJECTION'",
 '1,728 / 20,736',
 'STAY ${topology.counts.STAY}', 'TURN ${topology.counts.TURN}', 'ESC ${topology.counts.ESCALATE}', 'UNPROVED ${topology.counts.UNPROVED}',
 'COGNITION / AUTHORITY',
 'INGRESS / EGRESS / BLOCKED / RESIDUE',
 'TURN / BASIN',
 'CΩ / Φ / q / Λ',
 'R125/R141/R146/R147 AUTHORITIES UNCHANGED',
 'LIVING_TOPOLOGY_BOUNDARY_R241','COGNITIVE_AUTHORITY_BOUNDARY_R241'
])must(overlay.includes(token),`R241 visible convergence missing ${token}`);
for(const forbidden of ['Math.random','setInterval','requestAnimationFrame','api.post','fetch(','localStorage.setItem'])must(!overlay.includes(forbidden),`R241 visual convergence must remain read-only and packet-derived; forbidden ${forbidden}`);
must(css.includes('pointer-events:none'),'R241 overlay must retain non-intercepting pointer authority');
must(continuous.includes('same 20,736-state packet')&&continuous.includes('not new measured physical variables'),'R241 must preserve the inherited R13 truth boundary');

for(const token of ["data-r237-correlation","['LOCKED','HELD']","correlation==='LOCKED'",'HOST / JOB / MISSION / EPOCH LOCKED','EXECUTION CONTEXT HELD'])must(commandVerifier.includes(token),`R241 R240 repair missing semantic correlation token ${token}`);
must(!commandVerifier.includes("'intentionally contain no APPLY_PATCH or WRITE_TEXT','HOST / JOB / MISSION / EPOCH','R239 RESOURCE ENVELOPE'"),'R241 must not regress to unconditional LOCKED prose coupling');
for(const token of ["data-r237-correlation","HOST / JOB / MISSION / EPOCH LOCKED","EXECUTION CONTEXT HELD","activeJob.targetDeviceId!==device?.id","targetForMission(currentMission,missionJob)!==device.id","snapshotCurrent","requireCurrentSnapshot"])must(commandInvariant.includes(token),`R241 must pin the R237 semantic LOCKED/HELD fail-closed truth behavior in focused invariants: ${token}`);

for(const token of ["Prove R240.1 semantic verifier against exact served runtime","/omega-build-receipt.json","promotion?.promotedMergeSha||body?.source?.sha","OMEGA_PROMOTED_SHA=\"$SERVED_SHA\"","for attempt in 1 2 3","internally consistent exact served-runtime semantic proof"])must(workflow.includes(token),`R241.1 workflow race closure missing ${token}`);
for(const token of ['timeout-minutes: 30','timeout --signal=TERM --kill-after=15s 300s','R303 BROWSER PROOF FAILED','status 124 means the bounded 300-second suite timeout fired','cat /tmp/omega-r241-vite.log','run_browser tests/r286-all-surface-browser-e2e.mjs'])must(workflow.includes(token),`R303 bounded browser pipeline missing ${token}`);
const browserSuites=[...workflow.matchAll(/run_browser tests\/(.+?-browser-e2e\.mjs)/g)].map(m=>m[1]);
must(browserSuites.length===9&&new Set(browserSuites).size===9,'R303 must preserve all nine inherited real-browser suites while bounding each one');
must(workflow.includes("trap 'kill \"$VITE_PID\" 2>/dev/null || true' EXIT"),'R303 browser harness must clean up the preview server');
must(!workflow.includes('continue-on-error: true'),'R303 must fail closed rather than suppress browser proof failures');
must(!workflow.includes('git fetch origin main --no-tags'),'R241.1 live proof must not bind verification to a moving main ref');
must(!workflow.includes('BASE_SHA="$(git rev-parse origin/main)"'),'R241.1 live proof must not assume Git main and canonical deployment advance atomically');
must(!/^\s*push\s*:/m.test(workflow)&&!/^\s*schedule\s*:/m.test(workflow),'R241 workflow must remain PR/manual proof-only');
must(!/wrangler\s+deploy(?![^\n]*--dry-run)/.test(workflow),'R241 workflow must not acquire deployment authority');

must(governor.revision==='R170.5-R241','R241 must advance the governor proof revision without changing the R240 promotion engine');
must(governor.engineRevision==='R170.2+R240'&&governor.selfPromotion?.revision==='R240','R241 must not replace the established R240 exact self-promotion engine');
must(governor.currentCapabilityFloor==='R241','R241 must be the current governed capability/proof floor');
must(governor.postR180ProofContinuity?.at(-1)==='R241'&&governor.postR180ProofContinuity?.includes('R239')&&governor.postR180ProofContinuity?.includes('R240'),'R241 must extend rather than replace R239/R240 proof continuity');
must(governor.selfBuild?.latestExplicitSuccessorProof==='tests/r241-archive-convergence-invariants.mjs','R241 must become the explicit successor proof floor');
must(governor.preservedRuntime?.hybridResourceGovernor==='R239_SELECTED_HOST_PRESSURE_AWARE_ADMISSION_AND_BOUNDED_WORK_SIZING','R241 must preserve R239 Hybrid resource authority');
must(governor.preservedRuntime?.recursiveSelfBuildAndExactPromotion==='R240_R164_EVIDENCE_BOUND_SPARSE_FRONTIER_PLUS_EXACT_SOURCE_PROMOTION','R241 must preserve R240 self-promotion authority');
must(governor.preservedRuntime?.archiveConvergenceVisualIntelligence==='R241_READ_ONLY_1728_OVER_20736_TOPOLOGY_AND_TYPED_COGNITION_PROJECTION','R241 preserved-runtime identity missing');

for(const file of [topology,cognition,overlay])for(const forbidden of ['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203'])must(!file.includes(forbidden),`R241 must not restore retired Durable Object ${forbidden}`);

console.log('OMEGA R241.1/R303 ARCHIVE CONVERGENCE PASS · governed proof floor R241 with R239/R240 authorities preserved · all nine browser suites retained but bounded with exact failing-suite/Vite diagnostics · 1,728 deterministic 12×12×12 topology over exact 20,736 packet · source route/neighbor filaments · evidence-aware STAY/TURN/ESCALATE/UNPROVED · AGI/QTI typed cognition read-only through proposal · authorization/execution/return/Canon fail closed · inherited R182 INGRESS/EGRESS/BLOCKED/RESIDUE + TURN/BASIN + CΩ/Φ/q/Λ legend preserved · existing R13/R113/R119 visual layers preserved · live verifier binds to exact served runtime rather than moving main · R125/R141/R146/R147 and retired R201/R203 boundaries preserved');
