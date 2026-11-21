import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AXES,SIZE,SHELLS,AGENTS,NESTED,agentId,agentAddress,nestedId,nestedAddress,axes4,fromAxes4,neighbors,createFabric,getAgent,stateValue,baseline,submitTask,stepFabric,decide,agentSnapshot,agentCSV} from '../src/sphereAgentFabricR887.mjs';
assert.equal(AXES,12);assert.equal(SIZE,20736);assert.equal(SHELLS,12);assert.equal(AGENTS,248832);assert.equal(NESTED,5159780352);
for(let outer=0;outer<SIZE;outer++){assert.equal(fromAxes4(axes4(outer)),outer)}
for(let shell=0;shell<SHELLS;shell++)for(const outer of [0,1,143,1727,20735]){const id=agentId(shell,outer);assert.deepEqual(agentAddress(id),{shell,outer});for(const inner of [0,1,20735])assert.deepEqual(nestedAddress(nestedId(id,inner)),{agent:id,inner});const n=neighbors(id);assert.equal(new Set(n).size,n.length);assert.equal(n.length,8+(shell>0?1:0)+(shell<11?1:0));for(const peer of n)assert.ok(neighbors(peer).includes(id),'reciprocal edges')}
for(const [fn,arg] of [[agentAddress,-1],[agentAddress,AGENTS],[nestedAddress,NESTED],[axes4,SIZE]])assert.throws(()=>fn(arg),RangeError);
const fabric=createFabric(),a=agentId(3,100),b=neighbors(a)[0],initialA=stateValue(fabric,a,77),initialB=stateValue(fabric,b,77);
assert.equal(fabric.active.size,0,'lazy allocation before activation');
const taskId=submitTask(fabric,{agent:a,kind:'EXCHANGE',target:b,inner:77,weight:.5});
assert.equal(stepFabric(fabric)[0].taskId,taskId);
assert.ok(Math.abs(stateValue(fabric,a,77)+stateValue(fabric,b,77)-initialA-initialB)<1e-14,'conservative pair exchange');
assert.ok(Math.abs(fabric.receipts[0].conservationResidual)<1e-14,'conservation receipt');
assert.equal(fabric.active.size,2);
assert.throws(()=>submitTask(fabric,{agent:a,kind:'EXCHANGE',target:agentId(10,100),inner:77}));
assert.throws(()=>submitTask(fabric,{agent:a,kind:'RELAX',weight:NaN}));
const choice=decide(fabric,a,77);assert.ok(['OBSERVE','EXCHANGE'].includes(choice.kind));submitTask(fabric,choice);stepFabric(fabric);
const snapshot=agentSnapshot(fabric,a,0,144);assert.equal(snapshot.values.length,144);assert.equal(snapshot.innerCount,SIZE);assert.equal(snapshot.evidence,'SYNTHETIC_LOGICAL_AI_POLICY_NOT_EXTERNAL_MODEL');
const csv=agentCSV(fabric,a);assert.equal(csv.trimEnd().split('\n').length,SIZE+1);assert.match(csv,/SYNTHETIC_MODEL/);
assert.equal(baseline(a,77),baseline(a,77));
const workspace=readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
assert.ok(workspace.includes("id:'sphere-agent-fabric',label:'Sphere agent fabric'"));
assert.ok(workspace.includes("id='o7-sphere-agent-fabric' tabIndex={-1}"));
assert.ok(workspace.includes('<SphereAgentInstrumentR887'));
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['canvas','Run local agent autonomy','Agent decide','Coordinate neighbors','Export all 20,736 CSV states','DETERMINISTIC_INTERNAL_MODEL'])assert.ok(ui.includes(token));
console.log('R887 PASS: canonical 12^4 indexing, 12-shell nested 5,159,780,352 address roundtrips, reciprocal graph, bounded independent agents, conserved exchange, CSV, mounted UI.');
