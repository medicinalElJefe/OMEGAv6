import assert from 'node:assert/strict';
import {computeCanonPathWitnessR763} from '../src/proof/canonNavigationR763.js';
import {createCanonReplayCheckpointR764,deriveCanonTrajectoryR764} from '../src/proof/canonTrajectoryR764.js';
import {replayWorkbookFrameR604} from '../src7/workspaces/timeMandalaFormulaReplayR604.ts';
import {computeCanonMandalaBridgeR767} from '../src7/workspaces/canonMandalaBridgeR767.ts';

const witness=computeCanonPathWitnessR763({start:1,targetDecision:'STAY',maxHops:8,maxVisited:12000});
assert.equal(witness.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
const trajectory=deriveCanonTrajectoryR764(witness);
assert.equal(trajectory.frames.length,7);
const checkpoint=createCanonReplayCheckpointR764(witness,1);
const raw=JSON.stringify(checkpoint);
for(const seconds of [0,1,12345,43200,86399]){
 const bridge=computeCanonMandalaBridgeR767(raw,seconds);
 assert.equal(bridge.schema,'OMEGA_R767_CANON_MANDALA_BRIDGE_V1');
 assert.equal(bridge.frames.length,trajectory.frames.length);
 assert.equal(bridge.selectedFrame,1);
 assert.equal(bridge.physicalTimeEvolution,false);
 assert.equal(bridge.originalWorkbookAuthenticated,false);
 assert.equal(bridge.canonicalMutation,false);
 for(const frame of bridge.frames){
  const source=trajectory.frames[frame.index];
  const workbook=replayWorkbookFrameR604(source.atlasAddress20736,seconds);
  assert.equal(frame.address,source.atlasAddress20736);
  assert.equal(frame.canonDecision,source.decision);
  assert.deepEqual(frame.exactScoreCarry,source.cumulativeExactDelta);
  assert.equal(frame.boundaryScars,source.cumulativeBoundaryScars);
  assert.equal(frame.workbookActiveStar,workbook.activeStar);
  assert.equal(frame.workbookOperator,workbook.operator);
  assert.equal(frame.workbookMode188Gate,workbook.mode188Gate);
  assert.equal(frame.workbookDispatch,workbook.deweyDispatch);
 }
}
const changedClock=computeCanonMandalaBridgeR767(raw,86399);
const firstClock=computeCanonMandalaBridgeR767(raw,0);
assert.notEqual(changedClock.frames[0].workbookActiveStar,firstClock.frames[0].workbookActiveStar);
assert.deepEqual(changedClock.frames.map(x=>x.address),firstClock.frames.map(x=>x.address));
assert.throws(()=>computeCanonMandalaBridgeR767(raw,-1));
assert.throws(()=>computeCanonMandalaBridgeR767(raw,86400));
assert.throws(()=>computeCanonMandalaBridgeR767('invalid JSON',0));
assert.throws(()=>computeCanonMandalaBridgeR767(JSON.stringify({...checkpoint,frame:100}),0));
assert.throws(()=>computeCanonMandalaBridgeR767(JSON.stringify({...checkpoint,summary:{...checkpoint.summary,frameCount:999}}),0));
const changedWitness=structuredClone(checkpoint);
changedWitness.witness.result.distance=0;
assert.throws(()=>computeCanonMandalaBridgeR767(JSON.stringify(changedWitness),0));
console.log('R767 CANON × HISTORICAL TIME MANDALA PASS · 7 exact frames × 5 clock samples · cross-model boundary, source recomputation and tamper refusal');
