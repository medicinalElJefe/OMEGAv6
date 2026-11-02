import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computeCanonPathWitnessR763} from '../src/proof/canonNavigationR763.js';
import {R764_LOCAL_KEY,deriveCanonTrajectoryR764,
 createCanonReplayCheckpointR764,verifyCanonReplayCheckpointR764} from '../src/proof/canonTrajectoryR764.js';

const witness=computeCanonPathWitnessR763({start:1,targetDecision:'STAY',maxHops:8,maxVisited:15000});
const replay=deriveCanonTrajectoryR764(witness);
assert.equal(replay.schema,'OMEGA_R764_EXACT_CANON_TRAJECTORY_V1');
assert.equal(replay.frames.length,witness.result.distance+1);
assert.equal(replay.frames[0].index,1);
assert.equal(replay.frames.at(-1).index,witness.result.destination);
assert.equal(replay.scarCrossings,witness.result.scarCrossings);
assert.equal(replay.inverseScoreReturnExact,true);
assert.equal(replay.frames[0].cumulativeExactDelta.numerator,'0');
assert.equal(replay.frames.at(-1).cumulativeBoundaryScars,replay.scarCrossings);
assert.equal(replay.originalSourceAuthenticated,false);
assert.equal(replay.crossDevicePersistence,false);
assert.equal(replay.physicalTrajectory,false);
assert.equal(replay.canonicalMutation,false);
assert.equal(replay.plot.length,replay.frames.length);
for(const pt of replay.plot)assert(Number.isFinite(pt.x)&&Number.isFinite(pt.y));
for(let i=1;i<replay.frames.length;i++){
 assert.equal(replay.frames[i].step,i);
 assert.equal(replay.frames[i].coordinates.length,5);
 assert(replay.frames[i].cumulativeBoundaryScars>=replay.frames[i-1].cumulativeBoundaryScars);
}
const saved=createCanonReplayCheckpointR764(witness,1);
assert.equal(saved.frame,1);
assert.equal(saved.summary.frameCount,replay.frames.length);
assert.deepEqual(verifyCanonReplayCheckpointR764(JSON.stringify(saved)),saved);
assert.throws(()=>verifyCanonReplayCheckpointR764(JSON.stringify({...saved,
 summary:{...saved.summary,scarCrossings:999}})),/differs/);
assert.throws(()=>verifyCanonReplayCheckpointR764(JSON.stringify({...saved,
 witness:{...witness,result:{...witness.result,distance:0}}})),/differs/);
assert.throws(()=>createCanonReplayCheckpointR764(witness,-1),/frame/);
assert.throws(()=>createCanonReplayCheckpointR764(witness,replay.frames.length),/frame/);
assert.throws(()=>verifyCanonReplayCheckpointR764('x'.repeat(180001)),/bounded/);
assert.throws(()=>deriveCanonTrajectoryR764(computeCanonPathWitnessR763({
 start:1,targetDecision:'STAY',maxHops:0,maxVisited:1})),/completed modeled path/);
assert.equal(R764_LOCAL_KEY,'omega.r764.canonTrajectoryCheckpoint');
const ui=fs.readFileSync('src/CanonTopologyWorkbenchR763.tsx','utf8');
for(const token of ['data-r764-replay','data-r764-plot','data-r764-frame','data-r764-carry',
 'data-r764-first','data-r764-prev','data-r764-next','data-r764-last',
 'data-r764-save','data-r764-load','data-r764-clear','data-r764-status'])
 assert(ui.includes(token),'R764 UI missing '+token);
assert(ui.includes('verifyCanonReplayCheckpointR764'));
console.log('R764 exact symbolic continuity, reversible score carry, boundary scars, local checkpoint replay and tamper refusal PASS');
