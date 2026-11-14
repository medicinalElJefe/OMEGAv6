import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {createModelTaskSessionR842} from '../src7/workspaces/omegaModelTaskRuntimeR842.ts';
import {saveModelTasksR848,loadModelTasksR848,MODEL_TASK_STORAGE_KEY_R848} from '../src7/workspaces/omegaModelStorageR848.ts';
const make=()=>new Float32Array(20736);
const field={count:20736,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
test('local storage retains only validated requests and never computed authority',()=>{
 const map=new Map<string,string>(),storage={setItem:(k:string,v:string)=>{map.set(k,v)},getItem:(k:string)=>map.get(k)??null};
 const session=createModelTaskSessionR842(field);
 session.execute({kind:'INSPECT_MODEL_STATE',address:0});
 saveModelTasksR848(storage,session.history());
 const raw=map.get(MODEL_TASK_STORAGE_KEY_R848)!;
 assert.ok(!raw.includes('MODEL_DERIVED'));
 assert.ok(!raw.includes('metrics'));
 assert.deepEqual(loadModelTasksR848(storage)?.tasks,[{kind:'INSPECT_MODEL_STATE',address:0}]);
 map.set(MODEL_TASK_STORAGE_KEY_R848,'{"schema":"FORGED","tasks":[]}');
 assert.throws(()=>loadModelTasksR848(storage),/Invalid replay/);
});
