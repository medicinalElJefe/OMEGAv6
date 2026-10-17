import assert from 'node:assert/strict';
import {replayWorkbookFrameR604,workbookClockR604,workbookDistributionR604} from '../src7/workspaces/timeMandalaFormulaReplayR604.ts';
for(const t of [0,1,1234,12345,43200,86399]){
 const c=workbookClockR604(t);
 assert.equal(c.liveSector,Math.floor(t/(86400/7))+1);
 assert.ok(c.phaseProgress>=0&&c.phaseProgress<1);
 const counts=workbookDistributionR604(t);
 assert.equal(counts.length,7);
 assert.equal(counts.reduce((a,b)=>a+b,0),20736);
 assert.deepEqual([...counts].sort((a,b)=>a-b),[2960,2960,2961,2961,2964,2964,2966], 'exact original 12^4 modular star population multiset');
 for(let i=0;i<20736;i++){
  const r=replayWorkbookFrameR604(i,t);
  assert.equal(r.baseStar,((r.indices.reduce((a,b)=>a+b,0)-4)%7)+1);
  assert.equal(r.activeStar,((r.baseStar+r.liveSector-2)%7)+1);
  assert.ok(r.localBlendWeight>=0&&r.localBlendWeight<=1);
  assert.equal(r.truthRank,'EXACT_INDEX + SYMBOLIC_MAPPING');
  assert.equal(r.deweyDispatch,r.mode188Gate==='TURN'?'188-TURN':r.mode188Gate==='PRUNE'?'01-1':r.mode188Gate==='INTEGRATE'?'OMEGA':'011/STAY');
 }
}
const first=replayWorkbookFrameR604(0,0);
assert.deepEqual(first.indices,[1,1,1,1]);
assert.equal(first.baseStar,1);assert.equal(first.activeStar,1);
assert.equal(first.operator,'Alpha / Potential');
for(const [regulationIndex,expected] of [[2,'PRUNE'],[3,'TURN'],[5,'INTEGRATE'],[8,'PRUNE'],[9,'TURN'],[10,'INTEGRATE'],[11,'INTEGRATE']] as const){
 const address=regulationIndex*12;
 assert.equal(replayWorkbookFrameR604(address,0).mode188Gate,expected);
}
assert.throws(()=>workbookClockR604(86400));
console.log('R604 WORKBOOK REPLAY PASS · 124416 state/time comparisons · exact original base/active star, gate priority, phase, blend and dispatch');
