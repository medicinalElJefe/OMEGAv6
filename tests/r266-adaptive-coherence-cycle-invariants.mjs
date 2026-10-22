import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileWovenDimensionalRelativityR265} from '../src/system/wovenDimensionalRelativityR265.js';
import {compileOperationalConvergenceR249} from '../src/system/operationalConvergenceR249.js';
import {R266_SCHEMA,R266_REVISION,R266_CYCLE,R266_AUTHORITY,R266_HISTORY_LIMIT,R266_MAX_CALIBRATION_DELTA,compileAdaptiveCoherenceR266,compileResolutionBridgeR266,normalizeAdaptiveHistoryR266} from '../src/system/adaptiveCoherenceCycleR266.js';

const policy=JSON.parse(fs.readFileSync('public/omega-r266-adaptive-coherence-cycle.json','utf8'));
const docs=fs.readFileSync('docs/R266_ADAPTIVE_COHERENCE_CYCLE.md','utf8');
const world=fs.readFileSync('src/worldModelRuntime.ts','utf8');
const weave=fs.readFileSync('src/weaveStateR100.ts','utf8');
const selection=fs.readFileSync('scripts/lib/r245-governed-selfbuild-selection.mjs','utf8');
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const r240Test=fs.readFileSync('tests/r240-recursive-exact-self-promotion-invariants.mjs','utf8');

assert.equal(R266_SCHEMA,'OMEGA_ADAPTIVE_COHERENCE_CYCLE_R266');
assert.equal(R266_REVISION,'R266');
assert.equal(R266_HISTORY_LIMIT,64);
assert.equal(R266_MAX_CALIBRATION_DELTA,.08);
assert.deepEqual(R266_CYCLE,['OBSERVE','WATER_TRANSPORT','WOVEN_PATH','VIOLET_REEXPRESSION','PROVE','CARRY','RECONTEXTUALIZE','ADAPT_NEXT_CONTEXT']);
assert.equal(R266_AUTHORITY.sourceMutation,'R240_SINGLE_CANDIDATE_ONLY');
assert.equal(R266_AUTHORITY.dispatch,'R147');
assert.equal(R266_AUTHORITY.returnProof,'R141');
assert.equal(R266_AUTHORITY.history,'R146');
assert.equal(R266_AUTHORITY.canonAdmission,'R125');
assert.equal(R266_AUTHORITY.foundationWeightsChanged,false);
assert.equal(R266_AUTHORITY.addsPromotionAuthority,false);

const r265=compileWovenDimensionalRelativityR265({metrics:{continuity:.82,plasticity:.77,contradiction:.14,burden:.18,scar:.12,evidence:.88},invariantCarry:.84,residual:.16,correspondence:.81,orientation:1,water:{flow:.78,boundary:.22,pressure:.18,memory:.70,curvature:.16,hysteresis:.12},sourceFrame:'A',targetFrame:'B',sourceSkin:'COMPUTE',targetSkin:'LEARN',sourceResolution:20736,targetResolution:248832,provenance:['R266_TEST']});
const cold=compileAdaptiveCoherenceR266({current:r265,history:[]});
assert.equal(cold.adaptation.coldStartEquivalentToR265,true);
assert.equal(cold.adaptation.calibrationDelta,0);
assert.equal(cold.adaptation.adaptiveCoherence,r265.metrics.computationCoherence);
assert.equal(cold.adaptation.adaptiveFuturePreservation,r265.violet.futurePreservingSoftwareScore);
assert.equal(cold.proof.roundTripStatus,'NOT_MEASURED');
assert.equal(cold.proof.commutationStatus,'NOT_MEASURED');

const positive=Array.from({length:12},(_,i)=>({provenanceKind:i%3===0?'RETURNED_PROOF':i%3===1?'OBSERVED_TRANSITION':'EXPLICIT_OPERATOR_OUTCOME',accepted:true,coherence:.55+i*.02,scar:.08,residual:.05,roundTripResidual:.01,commutationResidual:.02}));
const pos=compileAdaptiveCoherenceR266({current:r265,history:positive});
assert.equal(pos.history.sampleCount,12);
assert.equal(pos.history.confidence,1);
assert.ok(pos.adaptation.calibrationDelta>0&&pos.adaptation.calibrationDelta<=R266_MAX_CALIBRATION_DELTA);
assert.ok(pos.adaptation.adaptiveCoherence>=cold.adaptation.adaptiveCoherence);
assert.equal(pos.proof.roundTripStatus,'PASS');
assert.equal(pos.proof.commutationStatus,'PASS');
assert.equal(pos.adaptation.foundationWeightsChanged,false);
assert.equal(pos.adaptation.unchosenCandidatesAreFailures,false);

const negative=compileAdaptiveCoherenceR266({current:r265,history:Array.from({length:12},()=>({provenanceKind:'EXPLICIT_OPERATOR_OUTCOME',accepted:false,coherence:.4,scar:.6,residual:.7}))});
assert.ok(negative.adaptation.calibrationDelta<0&&Math.abs(negative.adaptation.calibrationDelta)<=R266_MAX_CALIBRATION_DELTA);
assert.ok(negative.adaptation.adaptiveCoherence<=cold.adaptation.adaptiveCoherence);
assert.ok(negative.adaptation.carriedScar>=r265.metrics.scar);

const ignored=compileAdaptiveCoherenceR266({current:r265,history:[{provenanceKind:'INFERRED_GUESS',accepted:false},{provenanceKind:'UNCHOSEN',accepted:false}]});
assert.equal(ignored.history.sampleCount,0);
assert.equal(ignored.history.ignoredHistoryCount,2);
assert.equal(ignored.adaptation.coldStartEquivalentToR265,true);
assert.equal(normalizeAdaptiveHistoryR266([...positive,...positive,...positive,...positive,...positive,...positive]).length,R266_HISTORY_LIMIT);

const fineBridge=compileResolutionBridgeR266({address:12345,sourceResolution:20736,targetResolution:248832});
assert.equal(fineBridge.enumeratedFullAtlas,false);
assert.equal(fineBridge.physicalDimensionsClaimed,false);
assert.equal(fineBridge.roundTripAddress,12345);
assert.equal(fineBridge.roundTripResidual,0);
assert.equal(fineBridge.roundTripStatus,'PASS');
const coarseBridge=compileResolutionBridgeR266({address:12345,sourceResolution:20736,targetResolution:12});
assert.ok(coarseBridge.projectedAddress>=0&&coarseBridge.projectedAddress<12);
assert.ok(coarseBridge.roundTripResidual>=0);

const metrics={continuity:.86,plasticity:.8,contradiction:.12,burden:.16,evidence:.9,uncertainty:.1,scar:.1};
const operationalCold=compileOperationalConvergenceR249({metrics,adaptiveHistory:[]});
const operationalLearned=compileOperationalConvergenceR249({metrics,adaptiveHistory:positive});
assert.equal(operationalCold.r266Revision,'R266');
assert.equal(operationalCold.adaptiveCoherenceR266.adaptation.coldStartEquivalentToR265,true);
assert.equal(operationalCold.adaptiveCoherenceR266.authority.sourceMutation,'R240_SINGLE_CANDIDATE_ONLY');
assert.ok(operationalLearned.adaptiveCoherenceR266.history.sampleCount>0);
assert.ok(operationalLearned.capacity>=operationalCold.capacity);
assert.equal(operationalLearned.policy.parallelSourceMutation,false);

assert.equal(policy.adaptation.coldStartExactlyR265,true);
assert.equal(policy.adaptation.maximumAbsoluteCalibrationDelta,.08);
assert.equal(policy.adaptation.foundationWeightsChanged,false);
assert.equal(policy.history.unknownOrInferredOutcomesIgnored,true);
assert.equal(policy.resolutionBridge.bruteForceEnumerationRequired,false);
assert.equal(policy.resolutionBridge.physicalDimensionsClaimed,false);
assert.equal(policy.authority.sourceMutationAndPromotion,'R240_SINGLE_CANDIDATE_ONLY');
assert.equal(policy.authority.canonAdmission,'R125');
assert.equal(policy.authority.r266AddsPromotionAuthority,false);

for(const token of ['compileAdaptiveCoherenceR266','adaptiveHistoryForAddress','r266Coherence','R265_LEARN_R266_ADAPT','unchosen candidates are not failures','foundation weights are not claimed changed'])assert.ok(world.includes(token),`R266 world LEARN integration missing ${token}`);
for(const token of ['compileResolutionBridgeR266','adaptiveCoherenceR266','resolutionBridgeR266','RETURNED_PROOF','r266Coherence'])assert.ok(weave.includes(token),`R266 woven motion/render integration missing ${token}`);
for(const token of ['adaptiveHistoryR266','RETURNED_PROOF','r266AdaptiveCoherence','r266CalibrationDelta','R249+R265+R266'])assert.ok(selection.includes(token),`R266 self-build selection integration missing ${token}`);
for(const token of ['adaptiveCoherenceR266','adaptiveCoherenceHistoryR266','returnedAdaptiveRowR266','adaptiveCoherenceRevision:\'R266\'','foundationWeightsChanged remains false'])assert.ok(engine.includes(token),`R266 self-build receipt/history integration missing ${token}`);
for(const token of ['Cold start','64 entries','±0.08','Sparse dimensional-relativity bridge','R240 remains exact source mutation/promotion authority'])assert.ok(docs.includes(token),`R266 documentation missing ${token}`);
assert.ok(r240Test.includes("await import('./r266-adaptive-coherence-cycle-invariants.mjs')"),'mandatory R240 promotion proof chain must transitively execute R266 invariants');

console.log('OMEGA R266 ADAPTIVE COHERENCE PASS · R265 cold-start equivalence · explicit/observed/returned history only · bounded ±0.08 confidence-gated adaptation · carried scar/residual/water memory · sparse measured 12^k round-trip projection · world LEARN + R249 ORGANIZE + woven RENDER/MOTION + R170 SELF_BUILD integration · no foundation-weight claim · R240/R147/R141/R146/R125/ci authorities unchanged');
