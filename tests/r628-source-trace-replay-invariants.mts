import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initCorpusPack} from '../src/corpusRuntime';
import {traceSourceInstrumentR533} from '../src7/sourceInstrumentR533';
import {exportSourceTraceSnapshotR628,importSourceTraceSnapshotR628,R628_TRACE_SNAPSHOT_SCHEMA} from '../src7/sourceTraceRecoveryR628';

await initCorpusPack();
for(const executor of ['TRAVERSAL','FORECAST'] as const){
 const trace=traceSourceInstrumentR533(executor,11498,4);
 assert.equal(trace.status,'SOURCE_MODEL_EXECUTED');
 const snapshot=exportSourceTraceSnapshotR628(trace);
 const stored=JSON.parse(snapshot);
 assert.equal(stored.schema,R628_TRACE_SNAPSHOT_SCHEMA);
 assert.equal(stored.trace.canonicalMutation,false);
 assert.equal(stored.trace.productionAdmissionClaimed,false);
 assert.equal(stored.trace.historicalCapabilityRestored,false);
 assert.deepEqual(importSourceTraceSnapshotR628(snapshot),trace);
 assert.equal(exportSourceTraceSnapshotR628(importSourceTraceSnapshotR628(snapshot)),snapshot);
 const forged=JSON.parse(snapshot);
 forged.trace.frames[0].nextAddress=(forged.trace.frames[0].nextAddress+1)%20736;
 assert.throws(()=>importSourceTraceSnapshotR628(JSON.stringify(forged)),/R628_SOURCE_REPLAY_MISMATCH/);
 const forgedDerivative=JSON.parse(snapshot);
 forgedDerivative.trace.frames[1].developmental.continuityVelocity=0.123456;
 assert.throws(()=>importSourceTraceSnapshotR628(JSON.stringify(forgedDerivative)),/R628_SOURCE_REPLAY_MISMATCH/);
 const forgedAuthority=JSON.parse(snapshot);
 forgedAuthority.trace.canonicalMutation=true;
 assert.throws(()=>importSourceTraceSnapshotR628(JSON.stringify(forgedAuthority)),/R628_SOURCE_REPLAY_MISMATCH/);
 const extra=JSON.parse(snapshot);extra.verifiedByCloudflare=true;
 assert.throws(()=>importSourceTraceSnapshotR628(JSON.stringify(extra)),/R628_SNAPSHOT_SHAPE_REFUSED/);
}
assert.throws(()=>importSourceTraceSnapshotR628('{'),/R628_SNAPSHOT_JSON_INVALID/);
assert.throws(()=>importSourceTraceSnapshotR628('x'.repeat(32769)),/R628_SNAPSHOT_SIZE_REFUSED/);
assert.throws(()=>importSourceTraceSnapshotR628(JSON.stringify({schema:R628_TRACE_SNAPSHOT_SCHEMA,version:2,truth:'LOCAL_SOURCE_MODEL_RECOMPUTATION_ONLY',trace:{}})),/R628_SNAPSHOT_SHAPE_REFUSED/);
assert.throws(()=>exportSourceTraceSnapshotR628(traceSourceInstrumentR533('TRAVERSAL',11498,13)),/R628_EXECUTED_SOURCE_TRACE_REQUIRED/);
const ui=readFileSync(new URL('../src7/SourceExecutionWorkspaceR531.tsx',import.meta.url),'utf8');
for(const marker of ['data-r628-export','data-r628-import','data-r628-snapshot','data-r628-snapshot-status','onAddress(frame.nextAddress)'])assert.ok(ui.includes(marker),marker);
console.log('R628 source trace replay PASS · actual corpus successor recomputation · tamper refusal · no canonical mutation');
