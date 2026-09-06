import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  R126_RUNTIME,R126_LAWS,validateInteractionPacket,causalOrder,transformInteractionFrame,
  motionDelta,reconcileReturnedWork,allocateRelativeCompute,synchronizationAssessment
} from '../src/causalInteractionRelativityR126.mjs';

const manifest=JSON.parse(fs.readFileSync('public/omega-r126-causal-fabric.json','utf8'));
const r124=JSON.parse(fs.readFileSync('public/omega-r124-selfbuild-state.json','utf8'));
const r125=fs.readFileSync('src/accuracyResidualEngineR125.ts','utf8');
const r123=fs.readFileSync('src/livingOmegaRuntimeR123.ts','utf8');
const causalEvidenceEngine=fs.readFileSync('src/causal/causalInteractionRelativityR126.ts','utf8');
const workflow=fs.readFileSync('.github/workflows/r126-causal-interaction-relativity.yml','utf8');

assert.equal(R126_RUNTIME,'OMEGA_R126_CAUSAL_INTERACTION_RELATIVITY_FABRIC');
for(const law of ['NO_RESULT_WITHOUT_FRAME','NO_FRAME_WITHOUT_TIME','NO_TIME_WITHOUT_LINEAGE','NO_LINEAGE_WITHOUT_EVIDENCE','NO_MUTATION_WITHOUT_PROOF','SAME_CLOCK_TIME_DOES_NOT_IMPLY_SAME_CAUSAL_STATE','LATER_TIMESTAMP_DOES_NOT_IMPLY_DESCENDANT_COMPUTATION','ONE_CANONICAL_PHASE_MANY_RELATIVE_PROJECTIONS','RETURNED_WORK_RECONCILES_AGAINST_CURRENT_STATE','R125_ACCURACY_GATE_PRECEDES_CANONICAL_MUTATION']) assert.ok(R126_LAWS.includes(law),`missing law ${law}`);

const base={
  receiptHash:'receipt-root-001',
  frame:{serviceIdentity:'OMEGAV6',serviceRole:'canonical-root',runtimeRevision:'R126',gitSha:'TEST',canonicalSchemaVersion:'omega.r126.causal-interaction.v1',hostIdentity:'cloudflare',observerFrame:'operator',currentStateAddress:'12/0/0/0',nativeExecutionStatus:'CLOUD_ONLY'},
  time:{utcTime:'2026-09-06T18:30:00.000Z',sourceObservationTime:'2026-09-06T18:29:59.000Z',monotonicMs:1200,missionTick:10,stateGeneration:8,agentTurn:0,modelGeneration:1,causalDepth:0,parentReceiptHash:''},
  invariants:{missionId:'mission-r126-001',packetId:'packet-001',parentPacketId:'',canonicalStateHash:'state-a',inputHash:'input-a',proofState:'VERIFIED_INPUT',truthBoundary:'SOURCE_BOUND',evidenceRefs:['evidence:1'],scarHistory:['scar:prior-rebase']},
  transformables:{localRepresentation:'canonical',searchRoute:'root',modelEmbedding:'none',computeBudget:12,intermediateHypothesis:'',observerProjection:'FIELD'}
};
assert.deepEqual(validateInteractionPacket(base),{valid:true,errors:[]});
assert.equal(validateInteractionPacket({...base,invariants:{...base.invariants,evidenceRefs:[]}}).valid,false);
assert.equal(validateInteractionPacket({...base,frame:{...base.frame,hostIdentity:''}}).valid,false);

const tx=transformInteractionFrame(base,{serviceIdentity:'GENESIS',serviceRole:'proposal-variation',hostIdentity:'genesis-cloud',observerFrame:'branch-proposal',currentStateAddress:'12/0/0/0'},{utcTime:'2026-09-06T18:30:01.000Z',sourceObservationTime:'2026-09-06T18:29:59.000Z',monotonicMs:2200,missionTick:11,stateGeneration:8,agentTurn:1,modelGeneration:1});
assert.equal(tx.status,'TRANSFORMED');
assert.equal(tx.packet.frame.serviceIdentity,'GENESIS');
assert.equal(tx.packet.invariants.missionId,base.invariants.missionId);
assert.deepEqual(tx.packet.invariants.evidenceRefs,base.invariants.evidenceRefs);
assert.equal(tx.packet.invariants.canonicalStateHash,base.invariants.canonicalStateHash);
assert.equal(tx.packet.invariants.parentPacketId,base.invariants.packetId);
assert.notEqual(tx.packet.invariants.packetId,base.invariants.packetId);
assert.equal(tx.packet.time.causalDepth,1);
assert.equal(tx.packet.time.parentReceiptHash,base.receiptHash);
assert.equal(validateInteractionPacket(tx.packet).valid,true);
assert.equal(causalOrder(base,tx.packet),'A_PARENT_OF_B');

assert.equal(motionDelta({canonicalStateHash:'a',stateGeneration:8,missionTick:10},{canonicalStateHash:'a',stateGeneration:8,missionTick:11,changedDependencies:[]}).rebaseRequired,false);
const moved=motionDelta({canonicalStateHash:'a',stateGeneration:8,missionTick:10},{canonicalStateHash:'b',stateGeneration:9,missionTick:14,changedDependencies:['proof-ledger']});
assert.equal(moved.rebaseRequired,true);assert.equal(moved.generationDelta,1);
const clean={proofVerified:true,evidenceRefs:['evidence:return'],truthBoundaryChanged:false};
assert.equal(reconcileReturnedWork({departure:{canonicalStateHash:'a',stateGeneration:8,missionTick:10},current:{canonicalStateHash:'a',stateGeneration:8,missionTick:11,changedDependencies:[]},result:clean,r125:{action:'ADMIT'}}).decision,'ADMIT');
assert.equal(reconcileReturnedWork({departure:{canonicalStateHash:'a',stateGeneration:8,missionTick:10},current:{canonicalStateHash:'b',stateGeneration:9,missionTick:14,changedDependencies:['proof-ledger']},result:clean,r125:{action:'ADMIT'}}).decision,'REBASE');
assert.equal(reconcileReturnedWork({departure:{canonicalStateHash:'a',stateGeneration:8,missionTick:10},current:{canonicalStateHash:'a',stateGeneration:8,missionTick:11,changedDependencies:[]},result:{...clean,truthBoundaryChanged:true,newEvidenceAuthorizesTruthBoundaryChange:false},r125:{action:'ADMIT'}}).decision,'BLOCK');
assert.equal(reconcileReturnedWork({departure:{canonicalStateHash:'a',stateGeneration:8,missionTick:10},current:{canonicalStateHash:'a',stateGeneration:8,missionTick:11,changedDependencies:[]},result:clean,r125:{action:'BLOCK'}}).decision,'BLOCK');

assert.equal(allocateRelativeCompute({cost:1}).lanes,1);
assert.equal(allocateRelativeCompute({novelty:1,uncertainty:1,contradiction:1,proofUrgency:1,motion:1,observerRelevance:1,expectedInformationGain:1,cost:0}).lanes,20736);
assert.deepEqual(allocateRelativeCompute({novelty:.45,uncertainty:.45,contradiction:.45,proofUrgency:.45,motion:.45,observerRelevance:.45,expectedInformationGain:.45,cost:.1}).topology,[1,12,144,1728,20736]);
const sync=synchronizationAssessment([base,tx.packet]);assert.equal(sync.invalidCount,0);assert.equal(sync.synchronized,true);assert.match(sync.note,/Wall-clock agreement alone never establishes causal synchronization/);

assert.equal(manifest.topology.physicalDimensionClaim,false);
assert.deepEqual(manifest.topology.levels,[1,12,144,1728,20736]);
assert.ok(manifest.causalTimeEnvelope.includes('sourceObservationTime'));assert.ok(manifest.causalTimeEnvelope.includes('parentReceiptHash'));
assert.ok(manifest.federationHeader.includes('nativeExecutionStatus'));assert.equal(manifest.accuracyGate.authority,'R125');assert.equal(manifest.accuracyGate.mutationWithoutVerifiedEvidence,false);assert.match(manifest.truthBoundary,/does not by itself prove/i);
assert.equal(r124.generation,8);assert.match(r125,/TRUTH_BOUNDARY_RISK_ALWAYS_BLOCKS_AUTONOMOUS_MUTATION/);assert.match(r123,/ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS/);
assert.match(causalEvidenceEngine,/CORRELATION_NEVER_PROMOTES_TO_CAUSATION_WITHOUT_INTERVENTION_OR_INDEPENDENT_CAUSAL_EVIDENCE/);
assert.match(causalEvidenceEngine,/CAUSAL_ADMISSION_REQUIRES_REPRODUCIBLE_EVIDENCE_AND_EXTERNAL_PROOF_GATE/);
for(const inherited of ['r125-accuracy-engine-invariants.mjs','r124-self-contained-build-invariants.mjs','r123-living-total-experience-invariants.mjs','r122-computed-reality-invariants.mjs','r121-spherical-earth-connector-invariants.mjs','r77-woven-continuity-invariants.mjs','dimensional-relativity-r24-invariants.mjs','r97-federation-run-invariants.mjs','sai-b059-invariants.mjs']) assert.match(workflow,new RegExp(inherited.replaceAll('.','\\.')));
assert.match(workflow,/r126-causal-interaction-relativity\.mjs/);assert.match(workflow,/r126-causal-interaction-invariants\.mjs/);
console.log('R126 causal time/frame/motion interaction invariants: PASS');
