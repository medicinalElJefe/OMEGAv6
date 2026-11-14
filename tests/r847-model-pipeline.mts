import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {OMEGA7_CAPABILITY_BY_ROUTE} from '../src7/capabilityRegistry.ts';
import {resolveExecutorR846} from '../src7/workspaces/omegaExecutorRegistryR846.ts';
import {executeModelPipelineR847} from '../src7/workspaces/omegaModelPipelineR847.ts';
const make=()=>new Float32Array(20736);
function field(){
 const f={count:20736,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
 f.routeNext[0]=1;f.routeNext[1]=2;f.routeNext[2]=1;f.C[0]=.8;f.Phi[0]=.7;return f;
}
test('capability readiness is enforced for all mapped routes',()=>{
 for(const route of ['Atlas','Convergence','Traversal','Immersive Traversal','Matter Traversal','Extreme Traversal'] as const){
  const engine=route==='Atlas'||route==='Convergence'||route==='Traversal'?'MODEL_FIELD':'OBSERVER_MOTION';
  const cap=OMEGA7_CAPABILITY_BY_ROUTE.get(route);
  assert.ok(cap);
  const admission=resolveExecutorR846(engine,route);
  assert.equal(admission.available,cap.availability==='READY'&&['RUNTIME_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(cap.reality));
 }
 assert.equal(resolveExecutorR846('MODEL_FIELD','Governance').available,false);
});
test('source-derived inspect to trace to CSV handoff preserves route identity',()=>{
 const cap=OMEGA7_CAPABILITY_BY_ROUTE.get('Atlas');
 if(cap?.availability!=='READY')return;
 const r=executeModelPipelineR847(field(),{route:'Atlas',startAddress:0,limit:64});
 assert.equal(r.authority,'MODEL_DERIVED');assert.equal(r.inspect.address,0);
 assert.deepEqual(r.trace.route,[0,1,2]);assert.equal(r.export.rowCount,3);
 assert.equal(r.export.csv,r.trace.csv);
 assert.equal(r.admission.capabilityId,cap.id);
});
test('pipeline rejects invalid bounds and unauthorized routes',()=>{
 const f=field();
 assert.throws(()=>executeModelPipelineR847(f,{route:'Atlas',startAddress:-1,limit:3}),RangeError);
 assert.throws(()=>executeModelPipelineR847(f,{route:'Atlas',startAddress:0,limit:65}),RangeError);
 assert.throws(()=>executeModelPipelineR847(f,{route:'Governance' as 'Atlas',startAddress:0,limit:3}),/Execution held/);
});
