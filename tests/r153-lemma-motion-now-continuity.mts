import assert from 'node:assert/strict';
import {initCorpusPack,corpusState} from '../src/corpusRuntime';
import {compileLemmaMotionNowR153,R153_LAWS} from '../src/lemmaMotionNowContinuityR153';

await initCorpusPack();
const frame={serviceIdentity:'omega-test',serviceRole:'proof',runtimeRevision:'R153',canonicalSchemaVersion:'20736-v1',hostIdentity:'ci-host',observerFrame:'FIELD',orientation:1 as const};
const baseTime={utcTime:'2026-09-07T00:00:00.000Z',sourceObservationTime:'2026-09-06T23:59:59.900Z',monotonicMs:1000,missionTick:10,stateGeneration:4,agentTurn:0,modelGeneration:1,causalDepth:0,anchorUtcTime:'2026-09-07T00:00:00.000Z',anchorMonotonicMs:1000};

const a=compileLemmaMotionNowR153({address:0,time:baseTime,frame,self:{buildId:'r153-ci',generation:1,changeSet:['lemma-motion-now'],proofRefs:['proof:r153-static']}});
assert.equal(a.valid,true);
assert.equal(a.canonical.address,0);
assert.equal(a.canonical.stateId,1);
assert.equal(a.canonical.mutation,false);
assert.equal(a.canonical.admissionAuthority,'R125');
assert.equal(a.now.dailyPhase12,0);
assert.equal(a.now.matterTimeSector7,1);
assert.equal(a.now.elapsedSinceAnchorSeconds,0);
assert.equal(a.now.clockDriftMs,0);
assert.ok(a.now.temporalAccuracy>.95);
assert.match(a.now.id,/A1:T1:S1:K10:G4:C0:O1/);
assert.equal(a.motion.projection.projectionOnly,true);
assert.equal(a.motion.weave.orientation,1);
assert.equal(a.atlasCoherence.scale12.count,12);
assert.equal(a.atlasCoherence.scale144.count,144);
assert.equal(a.atlasCoherence.scale1728.count,1728);
assert.equal(a.atlasCoherence.scale20736,null);
assert.equal(a.lemma.exchanges.length,8);
assert.deepEqual(a.lemma.exchanges.map(x=>x.operator),['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_RESIDUAL_CARRY','RECONTEXTUALIZE','REPARTITION','PROJECTION_PROMOTION','ACCURACY_PROMOTION']);
assert.equal(a.promotion.view.authority,'REPRESENTATION_AND_RESOURCE_ALLOCATION_ONLY');
assert.equal(a.promotion.accuracy.authority,'PROOF_MEASUREMENT_AND_VALIDATION_ALLOCATION_ONLY');
assert.equal(a.promotion.truthUnchanged,a.truth.truthConfidence);
assert.equal(a.selfModel.kind,'RUNTIME_SELF_DESCRIPTION_NOT_SENTIENCE');
assert.match(a.selfModel.boundary,/not a claim of consciousness/i);
assert.ok(a.truthBoundary.includes('Motion/view promotion never manufactures truth'));

const record=corpusState(0),C=record.metrics.continuity,Phi=record.metrics.plasticity,scar=record.metrics.scar,water=.4*C+.4*Phi+.2*(1-scar),thetaDeg=((C*137.507764+Phi*188+scar*72)%360+360)%360,theta=thetaDeg/180*Math.PI,expected=(C*water*(1+Math.cos(theta)))/(1+scar+Math.abs(Math.sin(theta))*.188);
assert.ok(Math.abs(a.lemma.donorKernel.lemmaRaw-expected)<1e-12,'Drive donor lemma equation must be preserved numerically before scheduling bounds');

const later=compileLemmaMotionNowR153({address:0,time:{...baseTime,utcTime:'2026-09-07T00:00:02.000Z',sourceObservationTime:'2026-09-07T00:00:01.900Z',monotonicMs:3000,missionTick:11,stateGeneration:4},frame,self:{buildId:'r153-ci',generation:1,parentLoopFingerprint:a.selfModel.currentLemmaFingerprint}});
assert.equal(later.now.elapsedSinceAnchorSeconds,2);
assert.equal(later.now.clockDriftMs,0);
assert.notEqual(later.motion.projection.alpha,a.motion.projection.alpha,'persisted anchor must advance motion instead of resetting phase on a new render');
assert.notEqual(later.now.id,a.now.id);

const sameClockDifferentGeneration=compileLemmaMotionNowR153({address:0,time:{...baseTime,stateGeneration:5},frame});
assert.notEqual(sameClockDifferentGeneration.now.id,a.now.id,'same wall-clock time must not collapse distinct causal generations');

const midday=compileLemmaMotionNowR153({address:0,time:{...baseTime,utcTime:'2026-09-07T12:00:00.000Z',sourceObservationTime:'2026-09-07T11:59:59.900Z',monotonicMs:43_201_000,anchorUtcTime:'2026-09-07T00:00:00.000Z',anchorMonotonicMs:1000,missionTick:12},frame});
assert.equal(midday.now.dailyPhase12,6);
assert.ok(midday.motion.projection.temporalProjectionAddress!==midday.canonical.address,'time-bound projection may move while canonical address remains unchanged');
assert.equal(midday.canonical.address,0);

const inverse=compileLemmaMotionNowR153({address:0,time:baseTime,frame:{...frame,orientation:-1},previousFrame:frame});
assert.equal(inverse.motion.weave.orientation,-1);
assert.equal(inverse.selfModel.developmentLoop.recognizedDifference.frameChanged,true);
assert.equal(inverse.canonical.address,a.canonical.address);

const invalidDescendant=compileLemmaMotionNowR153({address:0,time:{...baseTime,causalDepth:1,parentReceiptHash:undefined},frame});
assert.equal(invalidDescendant.valid,false);
assert.ok(invalidDescendant.timeErrors.includes('PARENT_RECEIPT_REQUIRED_FOR_DESCENDANT'));
assert.equal(invalidDescendant.now.temporalAccuracy,0);

const drifted=compileLemmaMotionNowR153({address:0,time:{...baseTime,utcTime:'2026-09-07T00:00:02.000Z',sourceObservationTime:'2026-09-07T00:00:01.900Z',monotonicMs:8000,missionTick:13},frame,driftToleranceMs:500});
assert.ok((drifted.now.clockDriftMs||0)>0);
assert.ok(drifted.now.temporalAccuracy<later.now.temporalAccuracy,'clock/monotonic disagreement must reduce temporal accuracy rather than silently passing');

for(const law of ['TIME_BEFORE_INTERPRETATION','MOTION_CONTINUES_FROM_PERSISTED_ANCHOR_INSTEAD_OF_RESETTING_ON_RENDER_START','LEMMA_EXCHANGE_FOLLOWS_WOVEN_CONTINUITY_ORDER','VIEW_PROMOTION_ALLOCATES_REPRESENTATION_NOT_TRUTH','ACCURACY_PROMOTION_ALLOCATES_PROOF_COMPUTE_NOT_CANON_ADMISSION','SELF_MODEL_IS_RUNTIME_LINEAGE_AND_CAPABILITY_DESCRIPTION_NOT_SENTIENCE'])assert.ok(R153_LAWS.includes(law as any));

console.log(JSON.stringify({schema:a.schema,status:'PASS',now:{id:a.now.id,temporalAccuracy:a.now.temporalAccuracy},motion:{alpha0:a.motion.projection.alpha,alpha2s:later.motion.projection.alpha},atlas:{scale12:a.atlasCoherence.scale12.coherence,scale144:a.atlasCoherence.scale144.coherence,scale1728:a.atlasCoherence.scale1728.coherence,compound:a.atlasCoherence.compound},lemma:{raw:a.lemma.donorKernel.lemmaRaw,exchanges:a.lemma.exchangeCount},promotion:a.promotion,selfModel:a.selfModel.kind,boundary:a.truthBoundary},null,2));
