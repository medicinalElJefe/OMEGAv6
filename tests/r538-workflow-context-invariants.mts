import assert from 'node:assert/strict';
import {initialWorkflowR538,normalizeWorkflowR538,transitionWorkflowR538,exportWorkflowSnapshotR538,importWorkflowSnapshotR538} from '../src7/workflowContextR538.ts';
const t='2026-10-27T17:00:00.000Z';
const a=transitionWorkflowR538(initialWorkflowR538,{type:'NAVIGATE',address:20735,source:'ATLAS_SHARED_STATE',at:t});
assert.equal(a.address,20735);
assert.equal(initialWorkflowR538.address,11498,'transitions cannot mutate initial shared state');
assert.equal(a.history.length,1);
const b=transitionWorkflowR538(a,{type:'BOOKMARK',address:20735,source:'USER_BOOKMARK',at:t});
assert.equal(b.bookmarks.length,1);
const c=transitionWorkflowR538(b,{type:'BOOKMARK',address:20735,source:'USER_BOOKMARK',at:t});
assert.equal(c.bookmarks.length,1,'bookmarks dedupe by address');
const restored=transitionWorkflowR538(c,{type:'RESTORE',address:0,source:'WORKFLOW_RESTORE',at:t});
assert.equal(restored.address,0);
assert.equal(restored.history.length,2);
assert.deepEqual(importWorkflowSnapshotR538(exportWorkflowSnapshotR538(restored)),restored);
assert.deepEqual(normalizeWorkflowR538({version:1,address:Infinity,history:[{id:'bad',address:-1}],bookmarks:[]}),initialWorkflowR538);
for(const text of ['not-json','[]','{"version":2,"address":0,"history":[],"bookmarks":[]}','{"version":1,"address":20736,"history":[],"bookmarks":[]}','{"version":1,"address":0,"history":[{"address":-1}],"bookmarks":[]}','x'.repeat(65537)]){
 assert.throws(()=>importWorkflowSnapshotR538(text),/R538_SNAPSHOT_/);
}
assert.throws(()=>transitionWorkflowR538(restored,{type:'NAVIGATE',address:-1,source:'x',at:t}),/R538_ADDRESS_OUT_OF_RANGE/);
let many=initialWorkflowR538;
for(let i=0;i<80;i++)many=transitionWorkflowR538(many,{type:'NAVIGATE',address:i,source:'ATLAS_SHARED_STATE',at:t+':'+i});
assert.equal(many.history.length,48);
assert.equal(importWorkflowSnapshotR538(exportWorkflowSnapshotR538(many)).history.length,48);
console.log('R538 USER WORKSPACE EXECUTION PASS · navigation, bookmark, dedupe, 48-row bound, portable recovery, invalid-input refusal, immutable initial state');
