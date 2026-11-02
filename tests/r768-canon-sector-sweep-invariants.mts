import assert from 'node:assert/strict';
import {computeCanonPathWitnessR763} from '../src/proof/canonNavigationR763.js';
import {createCanonReplayCheckpointR764,deriveCanonTrajectoryR764} from '../src/proof/canonTrajectoryR764.js';
import {replayWorkbookFrameR604,workbookClockR604} from '../src7/workspaces/timeMandalaFormulaReplayR604.ts';
import {computeCanonMandalaSweepR768,verifyCanonMandalaSweepR768} from '../src7/workspaces/canonMandalaSweepR768.ts';

const witness=computeCanonPathWitnessR763({start:1,targetDecision:'STAY',maxHops:8,maxVisited:12000});
assert.equal(witness.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
const trajectory=deriveCanonTrajectoryR764(witness);
const raw=JSON.stringify(createCanonReplayCheckpointR764(witness,2));
const sweep=computeCanonMandalaSweepR768(raw);
assert.equal(sweep.schema,'OMEGA_R768_CANON_MANDALA_SECTOR_SWEEP_V1');
assert.equal(sweep.frameCount,trajectory.frames.length);
assert.equal(sweep.selectedFrame,2);
assert.equal(sweep.sectors.length,7);
assert.equal(sweep.verifiedStarTransitions,7*trajectory.frames.length);
assert.equal(sweep.completeSevenSectorCycle,true);
assert.equal(sweep.originalWorkbookAuthenticated,false);
assert.equal(sweep.physicalTimeEvolution,false);
assert.equal(sweep.crossDeviceMemory,false);
assert.equal(sweep.canonicalMutation,false);
for(const sector of sweep.sectors){
 assert.equal(workbookClockR604(sector.seconds).liveSector,sector.sector);
 assert.equal(sector.frames.length,trajectory.frames.length);
 for(const cell of sector.frames){
  const original=trajectory.frames[cell.index];
  const workbook=replayWorkbookFrameR604(original.atlasAddress20736,sector.seconds);
  assert.equal(cell.address,original.atlasAddress20736);
  assert.equal(cell.canonDecision,original.decision);
  assert.deepEqual(cell.exactScoreCarry,original.cumulativeExactDelta);
  assert.equal(cell.activeStar,workbook.activeStar);
  assert.equal(cell.operator,workbook.operator);
  assert.equal(cell.mode188Gate,workbook.mode188Gate);
  assert.equal(cell.dispatch,workbook.deweyDispatch);
  const next=sweep.sectors[sector.sector%7].frames[cell.index];
  assert.equal(next.activeStar,cell.activeStar%7+1);
 }
}
assert.deepEqual(verifyCanonMandalaSweepR768(JSON.stringify(sweep)),sweep);
const tamper=structuredClone(sweep);tamper.sectors[3].frames[2].activeStar=1+tamper.sectors[3].frames[2].activeStar%7;
assert.throws(()=>verifyCanonMandalaSweepR768(JSON.stringify(tamper)),/differs/);
const altered=structuredClone(sweep);altered.sectors[0].frames[0].address=999;
assert.throws(()=>verifyCanonMandalaSweepR768(JSON.stringify(altered)),/differs/);
const forged=structuredClone(sweep);forged.originalWorkbookAuthenticated=true;
assert.throws(()=>verifyCanonMandalaSweepR768(JSON.stringify(forged)),/differs/);
const changed=structuredClone(sweep);changed.sourceCheckpoint=JSON.stringify({...JSON.parse(raw),frame:999});
assert.throws(()=>verifyCanonMandalaSweepR768(JSON.stringify(changed)));
assert.throws(()=>verifyCanonMandalaSweepR768('not JSON'));
assert.throws(()=>verifyCanonMandalaSweepR768('x'.repeat(360001)),/bounded/);
console.log('R768 SEVEN-SECTOR SWEEP PASS · 7 clock sectors × '+trajectory.frames.length+' verified path frames · '+sweep.verifiedStarTransitions+' cyclic transitions · export/recovery/tamper refusal');
