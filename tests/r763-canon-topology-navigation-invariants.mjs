import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R763_AXES,R763_SCOPE,encodeCanonR763,decodeCanonR763,canonNodeR763,
 canonNeighborEdgesR763,inspectCanonLocalR763,planCanonPathR763,
 computeCanonPathWitnessR763,verifyCanonPathWitnessR763} from '../src/proof/canonNavigationR763.js';

for(let i=1;i<=248832;i+=101)assert.equal(encodeCanonR763(decodeCanonR763(i)),i);
for(const i of [1,248832,11498,62049,1728,1729]){
 const n=canonNodeR763(i);assert.equal(n.index,i);
 for(const e of canonNeighborEdgesR763(i)){
  assert.equal(Math.abs(e.to-i),[20736,1728,144,12,1][R763_AXES.indexOf(e.axis)]);
  assert(canonNeighborEdgesR763(e.to).some(x=>x.to===i&&x.direction===-e.direction));
 }
 const local=inspectCanonLocalR763(i);
 assert.equal(local.node.index,i);assert.equal(local.neighbors.length,canonNeighborEdgesR763(i).length);
}
const found=planCanonPathR763({start:1,targetDecision:'STAY',maxHops:8,maxVisited:15000});
assert.equal(found.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert.equal(found.distance,6);assert.equal(found.destination,24339);
assert.equal(found.path[0].index,1);assert.equal(found.path.at(-1).decision,'STAY');
assert.equal(found.steps.length,found.distance);
assert.equal(found.inversePathIsSymbolicallyReversible,true);
assert.equal(found.calibratedRealWorldTransitions,false);
assert.equal(found.canonicalMutation,false);
const mode=canonNodeR763(1).mode188;
const same=planCanonPathR763({start:1,targetDecision:'ESCALATE',targetMode:mode,maxHops:0,maxVisited:1});
assert.equal(same.distance,0);assert.equal(same.destination,1);
assert.equal(planCanonPathR763({start:1,maxVisited:1,maxHops:8}).status,'RESOURCE_HOLD_NO_INFERENCE');
assert.equal(planCanonPathR763({start:1,maxVisited:100,maxHops:0}).status,'DEPTH_HOLD_NO_INFERENCE');
assert.equal(planCanonPathR763({start:1,targetDecision:'STAY',minScore:'10',allowedAxes:['Perspective'],maxVisited:100,maxHops:12}).status,'NO_MATCH_IN_EXHAUSTED_DECLARED_GRAPH');
const restricted=planCanonPathR763({start:1,targetDecision:'STAY',minScore:'0.50',
 maxBurden:'1',maxContradiction:'1',maxHops:8,maxVisited:15000});
assert.equal(restricted.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert(Number(restricted.path.at(-1).score)>=0.5);
const query={start:1,targetDecision:'STAY',maxHops:8,maxVisited:15000};
const witness=computeCanonPathWitnessR763(query);
assert.deepEqual(verifyCanonPathWitnessR763(JSON.stringify(witness)),witness);
assert.throws(()=>verifyCanonPathWitnessR763(JSON.stringify({...witness,result:{...witness.result,distance:0}})),/differs/);
assert.throws(()=>computeCanonPathWitnessR763({start:1,autoPing:true}),/unknown/);
assert.throws(()=>planCanonPathR763({start:1,allowedAxes:['Physics']}));
assert.throws(()=>planCanonPathR763({start:1,maxVisited:100001}));
assert.equal(R763_SCOPE.physicalActionAuthority,false);
assert.equal(R763_SCOPE.globalSharpSingmaster,'OPEN');
assert.equal(R763_SCOPE.canonicalMutation,false);
const science=fs.readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
assert(science.includes('CanonTopologyWorkbenchR763'));
assert(science.includes('<CanonTopologyWorkbenchR763'));
const ui=fs.readFileSync('src/CanonTopologyWorkbenchR763.tsx','utf8');
assert(ui.includes('data-r763-search')&&ui.includes('data-r763-export')&&ui.includes('data-r763-verify'));
assert(ui.includes('NOT a physical action')||ui.includes('not physical actions'));
console.log('R763 exact five-axis inverse graph: shortest symbolic path, mode188/phase/RSC filters, reversible scar, bounded refusal and source-gated UI PASS');
