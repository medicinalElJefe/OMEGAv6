import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileMultiAxisRelativityR193,manifestR193,R193_AXES,R193_LAWS} from '../src/execution/multiAxisRelativityCompilerR193.js';
import {manifestR185,planTemporalPerformanceR185} from '../src/execution/temporalRelativityPerformanceR185.js';

class MemoryStorage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
const runtime={ctx:{storage:new MemoryStorage()}};
const directory={executors:{WORKERS_AI:{state:'AVAILABLE'},FEDERATION_CHAIN:{state:'AVAILABLE'},AUTONOMIC_SWARM:{state:'AVAILABLE'}}};
const baseContract={routeId:'route:multi-axis-lab',capabilityId:'capability:multi-axis-lab',route:'AI Lab',executionDomain:'AI'};
const stableR154={relativePriority:.5,capacity:{viewResolution:12,temporalHz:1,logicalLanes:1,solverFidelity:'NONE'},pressures:{motion:.02,residual:.03,truthGap:.04,coherenceGap:.03,temporalError:.02,observer:.10,combined:.04},relativity:{observer:'FRAME_STABLE'},lineage:{routeContract:'route:multi-axis-lab|capability:multi-axis-lab|AI|AVAILABLE'}};
const volatileR154={relativePriority:.9,capacity:{viewResolution:1728,temporalHz:12,logicalLanes:144,solverFidelity:'SPECTRAL_FULL_MODE'},pressures:{motion:.95,residual:.92,truthGap:.85,coherenceGap:.80,temporalError:.90,observer:.85,combined:.90},relativity:{observer:'FRAME_MOVING'},lineage:{routeContract:'route:multi-axis-lab|capability:multi-axis-lab|AI|AVAILABLE'}};
const stableRun={id:'run_r193_stable',contract:baseContract,metadata:{relativeCapacityR154:stableR154}};
const volatileRun={id:'run_r193_volatile',contract:baseContract,metadata:{relativeCapacityR154:volatileR154}};

const stable=compileMultiAxisRelativityR193({run:stableRun,hint:{...stableR154.pressures,priority:.5},currentPressure:.04,predictedPressure:.04});
const volatile=compileMultiAxisRelativityR193({run:volatileRun,hint:{...volatileR154.pressures,priority:.9},currentPressure:.90,predictedPressure:.90});
assert.equal(stable.schema,'OMEGA_MULTI_AXIS_RELATIVITY_COMPILER_R193');
assert.equal(stable.canonicalMutation,false);assert.equal(stable.canonicalAdmissionAuthority,'R125');
assert.ok(stable.axes.address.targetResolution<=144,'stable state should stay coarse');
assert.ok(stable.axes.time.targetHz<=2,'stable state should keep slow cadence');
assert.equal(stable.axes.compute.tier,'REFLEX');
assert.equal(stable.axes.frame.policy,'PRESERVE_DECLARED_FRAME');
assert.ok(stable.axes.modes.sourceModeBudget<=12&&stable.axes.modes.canonLensBudget<=6,'stable state should keep a bounded evaluator working set');

assert.ok(volatile.axes.address.targetResolution>=20736,'volatile state should refine address resolution');
assert.ok(volatile.axes.time.targetHz>=30,'volatile state should refine time simultaneously');
assert.ok(volatile.axes.compute.logicalLanes>=1728,'volatile state should expand logical compute simultaneously');
assert.ok(volatile.axes.fidelity.tierRank>stable.axes.fidelity.tierRank,'volatile state should escalate model fidelity');
assert.equal(volatile.axes.frame.policy,'MULTI_FRAME_CROSSCHECK','high motion/observer pressure should require a multi-frame cross-check');
assert.ok(volatile.axes.proof.depthRank>stable.axes.proof.depthRank,'uncertain high-pressure work should require deeper proof');
assert.ok(volatile.axes.modes.sourceModeBudget>stable.axes.modes.sourceModeBudget&&volatile.axes.modes.canonLensBudget>stable.axes.modes.canonLensBudget,'mode/lens coverage should scale independently');
assert.ok(volatile.simultaneous.activeAxisCount>=6,'high-pressure state should advance several independent axes in one plan');
assert.equal(volatile.simultaneous.canAdvanceConcurrently,true);

const motionOnly=compileMultiAxisRelativityR193({run:{...stableRun,id:'run_motion_only'},hint:{motion:.95,residual:.02,truthGap:.02,coherenceGap:.02,temporalError:.70,combined:.30,priority:.5},currentPressure:.45,predictedPressure:.50,input:{observerPressure:.8}});
assert.ok(motionOnly.axes.time.score>motionOnly.axes.fidelity.score+.25,'time refinement must be able to outrun fidelity refinement when motion dominates');
assert.ok(motionOnly.axes.frame.score>motionOnly.axes.proof.score,'reference-frame work must remain an independent axis rather than being tied to proof depth');

const floored=compileMultiAxisRelativityR193({run:{...stableRun,id:'run_floor',metadata:{relativeCapacityR154:{...stableR154,capacity:{viewResolution:20736,temporalHz:30,logicalLanes:1728,solverFidelity:'SPECTRAL_RCWA'}}}},hint:{...stableR154.pressures,priority:.5},currentPressure:.04,predictedPressure:.04});
assert.ok(floored.axes.address.targetResolution>=20736,'R193 may refine R154 but must not silently lower its address floor');
assert.ok(floored.axes.time.targetHz>=30,'R193 may refine R154 but must not silently lower its temporal floor');
assert.ok(floored.axes.compute.logicalLanes>=1728,'R193 may refine R154 but must not silently lower its compute floor');
assert.equal(floored.axes.fidelity.solverTarget,'SPECTRAL_RCWA','domain solver target from R154 must survive universal fidelity compilation');

const reusable=compileMultiAxisRelativityR193({run:stableRun,hint:{...stableR154.pressures,priority:.5},currentPressure:.04,predictedPressure:.04,input:{inputFingerprint:'a'.repeat(64),operatorFingerprint:'b'.repeat(64),frameFingerprint:'c'.repeat(64)}});
assert.equal(reusable.reuse.eligible,true);assert.equal(reusable.reuse.reused,false);assert.equal(reusable.reuse.requiresExactKeyMatch,true);assert.equal(reusable.reuse.requiresSha256Binding,true);
const changed=compileMultiAxisRelativityR193({run:volatileRun,hint:{...volatileR154.pressures,priority:.9},currentPressure:.9,predictedPressure:.9,input:{inputFingerprint:'a'.repeat(64),operatorFingerprint:'b'.repeat(64)}});
assert.equal(changed.reuse.eligible,false,'high-change state must not be treated as a reusable stable result merely because fingerprints exist');

const r185Plan=await planTemporalPerformanceR185(runtime,{run:stableRun,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI'});
assert.equal(r185Plan.multiAxis.revision,'R193','R147-consumed R185 plan must now carry the executable multi-axis compiler result');
assert.ok(r185Plan.work.workingSetResolution>=r185Plan.multiAxis.axes.address.targetResolution);
assert.ok(r185Plan.temporal.targetTemporalHz>=r185Plan.multiAxis.axes.time.targetHz);
assert.equal(r185Plan.multiAxis.authority.executorDispatch,'R147');assert.equal(r185Plan.multiAxis.authority.durableHistory,'R146');assert.equal(r185Plan.multiAxis.authority.hybridReturnProof,'R141');assert.equal(r185Plan.multiAxis.authority.canonicalAdmission,'R125');

for(const axis of ['ADDRESS_SCALE','TIME','MODEL_FIDELITY','REFERENCE_FRAME','COMPUTE','PROOF_DEPTH','MODE_COVERAGE'])assert.ok(R193_AXES.includes(axis),`missing R193 axis ${axis}`);
for(const law of ['MULTIPLE_REFINEMENT_AXES_MAY_ADVANCE_CONCURRENTLY_OVER_ONE_CANONICAL_PACKET_LINEAGE','HIGHER_RESOLUTION_OR_COMPUTE_NEVER_INCREASES_TRUTH_AUTHORITY','CONTENT_ADDRESSABLE_REUSE_REQUIRES_EXPLICIT_INPUT_AND_OPERATOR_FINGERPRINTS','R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R193_LAWS.includes(law),`missing R193 law ${law}`);
const manifest=manifestR193();assert.equal(manifest.revision,'R193');assert.equal(manifest.authority.capacity,'R154');assert.equal(manifest.authority.temporalPerformance,'R185');assert.equal(manifest.authority.dispatch,'R147');assert.equal(manifest.authority.admission,'R125');assert.equal(manifest.canonicalMutation,false);
const temporalManifest=manifestR185();assert.equal(temporalManifest.multiAxis.revision,'R193');assert.equal(temporalManifest.authority.multiAxisRefinement,'R193');

const r185Source=fs.readFileSync('src/execution/temporalRelativityPerformanceR185.js','utf8');
for(const token of ['multiAxisRelativityCompilerR193','compileMultiAxisRelativityR193','multiAxis','R193_MULTI_AXIS_REFINEMENT'])assert.ok(r185Source.includes(token),`R185 missing R193 integration token ${token}`);
assert.ok(!fs.readFileSync('src/execution/multiAxisRelativityCompilerR193.js','utf8').includes('canonicalMutation:true'),'R193 must never claim CanonState mutation');
console.log('R193 MULTI-AXIS RELATIVITY COMPILER PASS · scale + time + fidelity + frame + compute + proof + lawful mode coverage advance independently/concurrently without changing R147/R146/R141/R125 authority');
