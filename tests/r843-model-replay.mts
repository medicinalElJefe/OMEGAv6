import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {createModelTaskSessionR842} from '../src7/workspaces/omegaModelTaskRuntimeR842.ts';
import {encodeReplayR843,decodeReplayR843,replayModelTasksR843,recoverModelTaskSessionR849,R843_SESSION_SCHEMA} from '../src7/workspaces/omegaModelReplayR843.ts';
function field(){
 const make=()=>new Float32Array(20736);
 const f={count:20736,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
 f.C[0]=.8;f.Phi[0]=.7;f.routeNext[0]=1;f.routeNext[1]=0;return f;
}
test('task history serializes only requests and recomputes against live source',()=>{
 const f=field(),session=createModelTaskSessionR842(f);
 session.execute({kind:'INSPECT_MODEL_STATE',address:0});
 session.execute({kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:4});
 const raw=encodeReplayR843(session.history());
 assert.deepEqual(decodeReplayR843(raw).tasks.map(t=>t.kind),['INSPECT_MODEL_STATE','TRACE_MODEL_SUCCESSORS']);
 const result=replayModelTasksR843(f,raw);
 assert.equal(result.taskCount,2);assert.equal(result.authority,'MODEL_DERIVED_RECOMPUTED');
 assert.equal(result.results[1].kind,'TRACE_MODEL_SUCCESSORS');
});
test('replay rejects invalid schema, address, trace length, and oversized payload',()=>{
 const wrap=(tasks:unknown)=>JSON.stringify({schema:R843_SESSION_SCHEMA,tasks});
 for(const raw of [wrap([{kind:'INSPECT_MODEL_STATE',address:20736}]),wrap([{kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:65}]),wrap([{kind:'EXPORT_MODEL_TRACE',route:[]}]),JSON.stringify({schema:'FORGED',tasks:[]})])assert.throws(()=>decodeReplayR843(raw));
 assert.throws(()=>decodeReplayR843('x'.repeat(25001)),RangeError);
});
test('replay never trusts stored outputs or grants external authority',()=>{
 const f=field(),raw=JSON.stringify({schema:R843_SESSION_SCHEMA,tasks:[{kind:'INSPECT_MODEL_STATE',address:0,result:{decision:'FORGED'},authority:'CANON'}]});
 const result=replayModelTasksR843(f,raw);
 assert.equal(result.authority,'MODEL_DERIVED_RECOMPUTED');
 assert.equal(result.results[0].kind,'INSPECT_MODEL_STATE');
 if(result.results[0].kind==='INSPECT_MODEL_STATE')assert.notEqual(result.results[0].decision,'FORGED');
});

test('replay writer refuses non-portable history rather than emitting unloadable bytes',()=>{
 const f=field(),session=createModelTaskSessionR842(f);
 session.execute({kind:'EXPORT_MODEL_TRACE',route:Array.from({length:65},(_,i)=>i)});
 assert.throws(()=>encodeReplayR843(session.history()),/Invalid replay task payload/);
 const portable=createModelTaskSessionR842(f);
 portable.execute({kind:'EXPORT_MODEL_TRACE',route:[0,1]});
 assert.equal(decodeReplayR843(encodeReplayR843(portable.history())).tasks.length,1);
});

test('recovered replay retains recomputed session records for subsequent export and persistence',()=>{
 const f=field(),session=createModelTaskSessionR842(f);
 session.execute({kind:'INSPECT_MODEL_STATE',address:0});
 session.execute({kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:4});
 const restored=recoverModelTaskSessionR849(f,encodeReplayR843(session.history()));
 assert.equal(restored.taskCount,2);
 assert.deepEqual(restored.records.map(r=>r.sequence),[1,2]);
 assert.equal(restored.records[1].authority,'MODEL_DERIVED');
 assert.deepEqual(decodeReplayR843(encodeReplayR843(restored.records)).tasks,decodeReplayR843(encodeReplayR843(session.history())).tasks);
 assert.equal(restored.records[1].result.kind,'TRACE_MODEL_SUCCESSORS');
});
