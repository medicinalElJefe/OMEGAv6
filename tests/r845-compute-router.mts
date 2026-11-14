import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {executeComputeR845,defaultComputeObserverR845,OMEGA_COMPUTE_ENGINES_R845} from '../src7/workspaces/omegaComputeRouterR845.ts';
const make=()=>new Float32Array(20736);
const field={count:20736,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
test('two source-backed engines have distinct non-escalating authority',()=>{
 assert.deepEqual(OMEGA_COMPUTE_ENGINES_R845.map(x=>x.id),['MODEL_FIELD','OBSERVER_MOTION']);
 const model=executeComputeR845(field,{engine:'MODEL_FIELD',task:{kind:'INSPECT_MODEL_STATE',address:0}});
 assert.equal(model.authority,'MODEL_DERIVED');
 const observer=defaultComputeObserverR845(),motion=executeComputeR845(field,{engine:'OBSERVER_MOTION',task:{kind:'STEP_OBSERVER',observer,input:{dt:.1,forward:1}}});
 assert.equal(motion.authority,'LOCAL_SIMULATION');
 if(motion.engine==='OBSERVER_MOTION'){assert.notDeepEqual(motion.result.position,observer.position);assert.deepEqual(observer.position,[0,1.65,5.8])}
});
test('invalid motion is rejected without mutating the observer',()=>{
 const observer=defaultComputeObserverR845(),original=JSON.stringify(observer);
 assert.throws(()=>executeComputeR845(field,{engine:'OBSERVER_MOTION',task:{kind:'STEP_OBSERVER',observer,input:{dt:1}}}),RangeError);
 assert.throws(()=>executeComputeR845(field,{engine:'OBSERVER_MOTION',task:{kind:'STEP_OBSERVER',observer,input:{dt:.1,forward:Infinity}}}),/Non-finite/);
 assert.equal(JSON.stringify(observer),original);
});

test('observer dispatch rejects noncanonical address identity and malformed reanchors',()=>{
 const observer=defaultComputeObserverR845(),original=JSON.stringify(observer);
 const run=(o:typeof observer,input:{dt:number;reanchor?:any})=>executeComputeR845(field,{engine:'OBSERVER_MOTION',task:{kind:'STEP_OBSERVER',observer:o,input}});
 assert.throws(()=>run({...observer,address:{...observer.address,node_id:'node_999999'}},{dt:.1}),/Noncanonical/);
 assert.throws(()=>run({...observer,scale:'UNKNOWN'},{dt:.1}),/Invalid observer scale/);
 for(const reanchor of [{d:NaN},{p:Infinity},{r:'2'},{unknown:1},{d:0.5},{p:-1.25},{r:13},{l:-13},null,[]]){
  assert.throws(()=>run(observer,{dt:.1,reanchor}),/Invalid observer reanchor/);
 }
 assert.equal(JSON.stringify(observer),original);
 const stepped=run(observer,{dt:.1,reanchor:{d:1}});
 assert.equal(stepped.engine,'OBSERVER_MOTION');
 if(stepped.engine==='OBSERVER_MOTION'){
  assert.equal(stepped.result.address.d,2);
  assert.equal(stepped.result.address.node_id,'node_001728');
 }
});
