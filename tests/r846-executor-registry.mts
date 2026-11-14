import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {dispatchCapabilityComputeR846,resolveExecutorR846,OMEGA_EXECUTOR_COVERAGE_R846} from '../src7/workspaces/omegaExecutorRegistryR846.ts';
import {defaultComputeObserverR845} from '../src7/workspaces/omegaComputeRouterR845.ts';
const make=()=>new Float32Array(20736);
const field={count:20736,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
test('executor routes are a conservative subset of inherited capability registry',()=>{
 assert.equal(OMEGA_EXECUTOR_COVERAGE_R846.engines,2);
 assert.ok(OMEGA_EXECUTOR_COVERAGE_R846.boundRoutes<OMEGA7_CAPABILITIES.length);
 assert.equal(resolveExecutorR846('MODEL_FIELD','Atlas').available,true);
 assert.equal(resolveExecutorR846('OBSERVER_MOTION','Atlas').available,false);
 assert.equal(resolveExecutorR846('MODEL_FIELD','Hybrid Link').available,false);
 assert.equal(resolveExecutorR846('FORGED','Atlas').available,false);
});
test('route-authorized model dispatch returns model-derived output only',()=>{
 const r=dispatchCapabilityComputeR846(field,'Atlas',{engine:'MODEL_FIELD',task:{kind:'INSPECT_MODEL_STATE',address:0}});
 assert.equal(r.admission.reason,'LOCAL_MODEL_EXECUTOR_ONLY');
 assert.equal(r.output.authority,'MODEL_DERIVED');
});
test('observer engine cannot be launched through unrelated or privileged routes',()=>{
 assert.throws(()=>dispatchCapabilityComputeR846(field,'Governance',{engine:'OBSERVER_MOTION',task:{kind:'STEP_OBSERVER',observer:defaultComputeObserverR845(),input:{dt:.1}}}),/NO_EXECUTOR_ROUTE_BINDING/);
});
