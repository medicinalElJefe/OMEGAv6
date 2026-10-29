import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711,restoreComputationalSessionR711} from '../src/computationalSessionR711.mjs';
const a=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B'});
assert.equal(a.schema,'OMEGA_COMPUTATIONAL_SESSION_R711');
assert.equal(a.frames.length,DEFAULT_SCENARIO_R706.edgeFrames.length);
assert.equal(a.continuity.frameCount,a.frames.length);
for(const f of a.frames){
 assert.equal(f.projection.frameIndex,f.frameIndex);
 assert.equal(f.resilience.sourceFrame,f.frameIndex);
 assert.ok(f.svg.includes('<svg'));
}
const b=restoreComputationalSessionR711(a.sessionJson);
assert.deepEqual(b,a);
assert.throws(()=>restoreComputationalSessionR711(JSON.stringify({...JSON.parse(a.sessionJson),origin:'FORGED'})),/endpoints/);
assert.throws(()=>restoreComputationalSessionR711(JSON.stringify({...JSON.parse(a.sessionJson),authority:'PRODUCTION'})),/session envelope/);
const mirrored=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B',mirrored:true});
for(let i=0;i<a.frames[0].projection.nodes.length;i++)assert.ok(Math.abs(mirrored.frames[0].projection.nodes[i].x+a.frames[0].projection.nodes[i].x-640)<0.02);
assert.deepEqual(mirrored.replay.canonicalHistory,a.replay.canonicalHistory);
assert.throws(()=>executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'FORGED'}),/endpoints/);
assert.throws(()=>restoreComputationalSessionR711('{}'),/session envelope/);
const ui=readFileSync(new URL('../src7/WovenTopologyR707.tsx',import.meta.url),'utf8');
for(const token of ['executeComputationalSessionR711','data-r711-session','data-r711-summary','data-r711-export'])assert.ok(ui.includes(token),token);
const auditUi=readFileSync(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
for(const token of ['restoreComputationalSessionR711','data-r712-import-input','data-r712-import','omega7.r711.session.v1','independently recomputed'])assert.ok(auditUi.includes(token),token);
assert.ok(auditUi.slice(auditUi.indexOf('data-r706-reset'),auditUi.indexOf('data-r706-reset')+650).includes("removeItem('omega7.r706.scenario.v1')"),'reset must remove persisted source to avoid stale reload');
for(const token of ['data-r712-save','data-r712-save-status','initialOrigin','initialTarget','initialMirrored'])assert.ok(ui.includes(token),token);
const other=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
assert.deepEqual(restoreComputationalSessionR711(other.sessionJson).continuity,other.continuity);
assert.throws(()=>restoreComputationalSessionR711(JSON.stringify({...JSON.parse(other.sessionJson),proof:{production:true}})),/session envelope/);
const ids=Array.from({length:12},(_,i)=>('Node'+String(i).padStart(2,'0')).padEnd(32,'X'));
const largeScenario={schema:'OMEGA_RELATIONAL_SCENARIO_R706',
 nodes:ids.map(id=>({id,continuity:0.5,scar:0,contradiction:0,plasticity:1})),
 edgeFrames:Array.from({length:12},(_,f)=>Array.from({length:48},(_,e)=>({from:ids[e%12],to:ids[(e+f+1)%12],kind:'BLOCKED',weight:0.5}))),
 step:0.2,mode:'STABILIZE',alpha:0.5};
const large=executeComputationalSessionR711(largeScenario);
assert.ok(large.sessionJson.length>24000,'large valid source exceeds former import limit');
assert.deepEqual(restoreComputationalSessionR711(large.sessionJson).sourceScenario,large.sourceScenario);
assert.throws(()=>restoreComputationalSessionR711(' '.repeat(131073)),/limit/);
console.log('R711/R712 integrated source session and recovery invariants PASS');
