import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {executeModelPipelineR847} from '../src7/workspaces/omegaModelPipelineR847.ts';
import {createModelTaskSessionR842} from '../src7/workspaces/omegaModelTaskRuntimeR842.ts';
import {encodeReplayR843,recoverModelTaskSessionR849} from '../src7/workspaces/omegaModelReplayR843.ts';
const make=()=>new Float32Array(20736);
const field={count:20736,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
test('admitted pipeline can be recorded and recovered with matching source-derived outputs',()=>{
 const result=executeModelPipelineR847(field,{route:'Atlas',startAddress:0,limit:4});
 const session=createModelTaskSessionR842(field);
 session.execute({kind:'INSPECT_MODEL_STATE',address:0});
 session.execute({kind:'TRACE_MODEL_SUCCESSORS',address:0,limit:4});
 session.execute({kind:'EXPORT_MODEL_TRACE',route:result.trace.route});
 const raw=encodeReplayR843(session.history());
 const recovered=recoverModelTaskSessionR849(field,raw);
 assert.equal(recovered.taskCount,3);
 assert.equal(recovered.records[0].result.kind,'INSPECT_MODEL_STATE');
 assert.equal(recovered.records[1].result.kind,'TRACE_MODEL_SUCCESSORS');
 assert.equal(recovered.records[2].result.kind,'EXPORT_MODEL_TRACE');
 if(recovered.records[1].result.kind==='TRACE_MODEL_SUCCESSORS'&&recovered.records[2].result.kind==='EXPORT_MODEL_TRACE'){
  assert.deepEqual(recovered.records[1].result.route,result.trace.route);
  assert.equal(recovered.records[2].result.csv,result.export.csv);
 }
 assert.ok(!raw.includes('MODEL_DERIVED'));
});
