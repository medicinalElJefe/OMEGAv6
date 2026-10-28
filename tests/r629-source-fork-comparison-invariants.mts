import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initCorpusPack} from '../src/corpusRuntime';
import {traceSourceInstrumentR533} from '../src7/sourceInstrumentR533';
import {compareSourceTracesR629,exportSourceComparisonR629,importSourceComparisonR629,R629_COMPARISON_SCHEMA} from '../src7/sourceTraceComparisonR629';

await initCorpusPack();
for(const executor of ['TRAVERSAL','FORECAST'] as const){
 const baseline=traceSourceInstrumentR533(executor,11498,6);
 assert.equal(baseline.status,'SOURCE_MODEL_EXECUTED');
 const same=compareSourceTracesR629(baseline,11498);
 assert.equal(same.schema,R629_COMPARISON_SCHEMA);
 assert.equal(same.identical,true);
 assert.equal(same.firstDivergenceIndex,null);
 assert.ok(same.rows.every(x=>x.sameSourceTransition&&x.continuityDelta===0&&x.scarDelta===0));
 const different=compareSourceTracesR629(baseline,11499);
 assert.equal(different.identical,false);
 assert.equal(different.firstDivergenceIndex,0);
 assert.equal(different.commonPrefix,0);
 assert.equal(different.left.startAddress,11498);
 assert.equal(different.right.startAddress,11499);
 assert.equal(different.canonicalMutation,false);
 assert.equal(different.productionAdmissionClaimed,false);
 assert.equal(different.historicalParityClaimed,false);
 assert.equal(different.physicalTimeClaimed,false);
 assert.ok(different.rows.length>=1&&different.rows.length<=6);
 for(const row of different.rows){
  const a=different.left.frames[row.index]??null,b=different.right.frames[row.index]??null;
  assert.equal(row.continuityDelta,a&&b?b.continuity-a.continuity:null);
  assert.equal(row.scarDelta,a&&b?b.scar-a.scar:null);
  assert.equal(row.continuityVelocityDelta,a&&b&&a.developmental.continuityVelocity!==null&&b.developmental.continuityVelocity!==null?b.developmental.continuityVelocity-a.developmental.continuityVelocity:null);
 }
 const snapshot=exportSourceComparisonR629(different);
 assert.deepEqual(importSourceComparisonR629(snapshot),different);
 assert.equal(exportSourceComparisonR629(importSourceComparisonR629(snapshot)),snapshot);
 const forged=JSON.parse(snapshot);forged.right.frames[0].nextAddress=(forged.right.frames[0].nextAddress+1)%20736;
 assert.throws(()=>importSourceComparisonR629(JSON.stringify(forged)),/R629_COMPARISON_REPLAY_MISMATCH/);
 const forgedDelta=JSON.parse(snapshot);forgedDelta.rows[0].scarDelta=42;
 assert.throws(()=>importSourceComparisonR629(JSON.stringify(forgedDelta)),/R629_COMPARISON_REPLAY_MISMATCH/);
 const forgedAuthority=JSON.parse(snapshot);forgedAuthority.canonicalMutation=true;
 assert.throws(()=>importSourceComparisonR629(JSON.stringify(forgedAuthority)),/R629_COMPARISON_REPLAY_MISMATCH/);
 const extra=JSON.parse(snapshot);extra.verifiedByProduction=true;
 assert.throws(()=>importSourceComparisonR629(JSON.stringify(extra)),/R629_COMPARISON_REPLAY_MISMATCH/);
 assert.throws(()=>exportSourceComparisonR629({...different,commonPrefix:9}),/R629_COMPARISON_REPLAY_MISMATCH/);
 assert.throws(()=>compareSourceTracesR629({...baseline,productionAdmissionClaimed:true},11499),/R629_BASELINE_REPLAY_MISMATCH/);
}
assert.throws(()=>importSourceComparisonR629('{'),/R629_SNAPSHOT_JSON_INVALID/);
assert.throws(()=>importSourceComparisonR629('x'.repeat(65537)),/R629_SNAPSHOT_SIZE_REFUSED/);
assert.throws(()=>importSourceComparisonR629('{}'),/R629_SNAPSHOT_SHAPE_REFUSED/);
assert.throws(()=>compareSourceTracesR629(traceSourceInstrumentR533('TRAVERSAL',11498,4),-1),/R629_COMPARISON_ADDRESS_REFUSED/);
assert.throws(()=>compareSourceTracesR629(traceSourceInstrumentR533('TRAVERSAL',11498,4),20736),/R629_COMPARISON_ADDRESS_REFUSED/);
assert.throws(()=>compareSourceTracesR629(traceSourceInstrumentR533('SAI_HYBRID',11498,4),11499),/R629_EXECUTED_TRAVERSAL_OR_FORECAST_REQUIRED/);
const ui=readFileSync(new URL('../src7/SourceExecutionWorkspaceR531.tsx',import.meta.url),'utf8');
for(const marker of ['data-r629-run','data-r629-result','data-r629-first-divergence','data-r629-export','data-r629-import','data-r629-snapshot','data-r629-status','data-r629-continue-right','data-r629-continue-left'])assert.ok(ui.includes(marker),marker);
console.log('R629 fork comparison PASS · independent source successors, developmental deltas, portable replay, tamper refusal, no authority inflation');
