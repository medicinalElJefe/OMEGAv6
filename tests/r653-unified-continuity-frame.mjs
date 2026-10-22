import assert from 'node:assert/strict';import {runContinuityFrameR653} from '../src/continuity/frameRuntimeR653.js';
const nodes=[{id:'A',continuity:0.8,scar:0.2,contradiction:0.1},{id:'B',continuity:0.2}];const edges=[{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.5}];
const input={nodes,edges,step:0.25};const stable=runContinuityFrameR653({...input,mode:'STABILIZE'}),explore=runContinuityFrameR653({...input,mode:'EXPLORE'});
assert.deepEqual(stable.canonicalState,explore.canonicalState,'changing mode must not mutate canonical evolution');assert.notDeepEqual(stable.projection.nodes,explore.projection.nodes,'mode must affect projection');assert.equal(stable.canonicalState[0].scar,0.2);assert.equal(stable.receipt.truthClass,'LOCAL_EXECUTION_ONLY');assert.equal(stable.receipt.symmetricMass,0.5);assert.ok(Math.abs(stable.receipt.netContinuityDelta)<1e-10);
assert.deepEqual(stable,runContinuityFrameR653({...input,mode:'STABILIZE'}),'frame must replay deterministically');
console.log('R653 unified canonical transport/projection and replay PASS');
