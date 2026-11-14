import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {createModelTaskSessionR842,executeModelTaskR842} from '../src7/workspaces/omegaModelTaskRuntimeR842.ts';
function field(){
 const count=20736,make=()=>new Float32Array(count);
 const f={count,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(count)} as Mandala20736Field;
 f.C[0]=.8;f.Phi[0]=.7;f.q[0]=.1;f.Lambda[0]=.2;f.routeNext[0]=1;f.routeNext[1]=2;f.routeNext[2]=1;
 return f;
}
test('inspect, trace and export share a real source-derived execution boundary',()=>{
 const f=field(),session=createModelTaskSessionR842(f);
 const inspect=session.execute({kind:'INSPECT_MODEL_STATE',address:0});
 assert.equal(inspect.result.kind,'INSPECT_MODEL_STATE');
 if(inspect.result.kind==='INSPECT_MODEL_STATE'){assert.equal(inspect.result.nodeId,'node_000001');assert.equal(inspect.result.next,1);assert.equal(inspect.result.decision,'STAY')}
 const trace=session.execute({kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:64});
 assert.equal(trace.result.kind,'TRACE_MODEL_SUCCESSORS');
 if(trace.result.kind==='TRACE_MODEL_SUCCESSORS'){
  assert.deepEqual(trace.result.route,[0,1,2]);
  assert.equal(trace.result.termination,'CYCLE');
  assert.equal(trace.result.csv.split('\r\n').length,5);
  const exported=session.execute({kind:'EXPORT_MODEL_TRACE',route:trace.result.route});
  assert.equal(exported.result.kind,'EXPORT_MODEL_TRACE');
  if(exported.result.kind==='EXPORT_MODEL_TRACE')assert.equal(exported.result.csv,trace.result.csv);
 }
 assert.deepEqual(session.history().map(x=>x.sequence),[1,2,3]);
 assert.ok(session.history().every(x=>x.authority==='MODEL_DERIVED'));
});
test('invalid tasks cannot append results to the session ledger',()=>{
 const f=field(),session=createModelTaskSessionR842(f);
 assert.throws(()=>session.execute({kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:65}),RangeError);
 assert.throws(()=>session.execute({kind:'INSPECT_MODEL_STATE',address:-1}),RangeError);
 assert.throws(()=>session.execute({kind:'EXPORT_MODEL_TRACE',route:[0,2]}),/successor chain/);
 assert.equal(session.history().length,0);
});
test('source-derived trace terminates at limit without synthetic route padding',()=>{
 const f=field(),r=executeModelTaskR842(f,{kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:2});
 assert.equal(r.kind,'TRACE_MODEL_SUCCESSORS');
 if(r.kind==='TRACE_MODEL_SUCCESSORS'){assert.deepEqual(r.route,[0,1]);assert.equal(r.termination,'LIMIT')}
});
