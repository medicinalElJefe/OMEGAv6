import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 assertFullOverallCanonR245,
 compileFullOverallCanonR245,
 roadmapPressureR245,
 R245_AUTHORITY_LAWS,
 R245_CANON_AXES,
 R245_CONTINUITY_OPERATOR,
 R245_ORGANS,
 R245_SCHEDULER_LEVELS,
 R245_STRATA
} from '../src/system/fullOverallCanonR245.js';

assert.equal(assertFullOverallCanonR245(),true);
assert.equal(R245_CANON_AXES.length,7,'R245 must preserve seven Full Overall Canon axes');
assert.deepEqual(R245_CANON_AXES,['STATE','RELATION','MEMORY','COMPUTATION','OBSERVATION','ACTION','PROOF']);
assert.equal(R245_STRATA.length,7,'R245 must preserve seven permanent strata');
assert.equal(R245_ORGANS.length,12,'R245 scheduler must preserve exactly twelve first-level organs');
assert.deepEqual(R245_SCHEDULER_LEVELS.map(x=>x.level),[12,144,1728,20736,248832]);
assert.ok(R245_SCHEDULER_LEVELS.every(x=>x.physicalDimensions===false),'R245 atlas/address levels must never become literal physical dimensions');
assert.equal(R245_CONTINUITY_OPERATOR,'PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION');
assert.ok(R245_AUTHORITY_LAWS.includes('R125_SOLE_CANONSTATE_ADMISSION'));
assert.ok(R245_AUTHORITY_LAWS.includes('CI_YML_SOLE_CANONICAL_PRODUCTION_WORKER_WRITER'));

const selfbuild={
 active:true,generation:0,maxAutonomousGenerations:5,maxParallelPlanningCells:12,recursiveSchedulerRevision:'R240',exactSelfPromotionRevision:'R240',admittedSourceCapsules:[],rejected:[],blocked:[],
 roadmap:[
  {id:'SG001',title:'Workflow capacity model',objective:'capacity',target:'a',risk:'LOW',prerequisites:[],expectedGain:.97,complexity:.22,contradictionRisk:.05},
  {id:'SG002',title:'Deployment convergence receipt',objective:'receipt',target:'b',risk:'LOW',prerequisites:['SG001'],expectedGain:.95,complexity:.28,contradictionRisk:.06},
  {id:'SG003',title:'Residual read-only projection',objective:'residual',target:'c',risk:'LOW',prerequisites:['SG001'],expectedGain:.91,complexity:.3,contradictionRisk:.07}
 ]
};
const pressure=roadmapPressureR245(selfbuild);
assert.equal(pressure.find(x=>x.id==='SG001')?.status,'READY','first dependency-free capsule must be ready');
assert.equal(pressure.find(x=>x.id==='SG002')?.status,'WAITING_DEPENDENCY','dependent capsule must fail closed before prerequisite admission');
assert.deepEqual(pressure.find(x=>x.id==='SG002')?.missingPrerequisites,['SG001']);

const baseInput={
 core:{ok:true,state:'LIVE',canonicalRequest:true},
 operational:{state:'LIVE'},
 convergence:{canonical:{state:'LIVE'}},
 receipt:{promotion:{promotedMergeSha:'2fa7c419535bfac7378a45f71d881459079cde13'}},
 selfbuild,
 capabilities:{stateCounts:{ADMITTED_MAIN:7,INTEGRATED_CANDIDATE:5,INTEGRATION_TARGET:3},families:Array.from({length:15},(_,i)=>({family:`F${i}`,state:i<7?'ADMITTED_MAIN':i<12?'INTEGRATED_CANDIDATE':'INTEGRATION_TARGET'}))},
 observedAt:1
};
const unprovedPc=compileFullOverallCanonR245({...baseInput,hybrid:{state:'VERIFIED_DEVICE_ONLINE',nativeExecutionClaimed:false,devices:[{online:true,revoked:false}]}});
assert.equal(unprovedPc.runtime.state,'LIVE');
assert.equal(unprovedPc.production.state,'RECEIPT_RETURNED');
assert.equal(unprovedPc.hybrid.authenticatedCurrentDeviceProved,false,'runtime/receipt/browser device rows must not fabricate authenticated PC proof');
assert.equal(unprovedPc.admission.authority,'R125');
assert.equal(unprovedPc.admission.admittedByR245,false,'R245 must never admit CanonState');
assert.equal(unprovedPc.actionBoundary.r245Mutates,false);
assert.equal(unprovedPc.actionBoundary.r245Executes,false);
assert.equal(unprovedPc.actionBoundary.productionWriter,'.github/workflows/ci.yml');
assert.equal(unprovedPc.selfBuild.recommendedCapsule?.id,'SG001');

const provedPc=compileFullOverallCanonR245({...baseInput,hybrid:{state:'VERIFIED_DEVICE_ONLINE',nativeExecutionClaimed:true,devices:[{online:true,revoked:false}]}});
assert.equal(provedPc.hybrid.authenticatedCurrentDeviceProved,true,'only exact current authenticated Hybrid truth may project PC online');

const component=fs.readFileSync('src/FullOverallCanonR245.tsx','utf8');
const mount=fs.readFileSync('src/FullSystemConvergencePanelR95.tsx','utf8');
assert.ok(component.includes('Promise.allSettled'),'R245 must observe its returned sources as one bounded epoch');
assert.ok(component.includes("'/api/core-health'"));
assert.ok(component.includes("'/api/system/operational'"));
assert.ok(component.includes("'/api/system/convergence'"));
assert.ok(component.includes("'/api/hybrid/status'"));
assert.ok(component.includes("'/omega-r170-selfbuild-state.json'"));
assert.ok(component.includes("'/omega-build-receipt.json'"));
assert.ok(!component.includes('setInterval('),'R245 must not create another global polling plane');
for(const forbidden of ['api.post(','api.put(','api.delete(','fetch(`/api/','method:\'POST\'','method:"POST"'])assert.ok(!component.includes(forbidden),`R245 read-only plane contains forbidden mutation primitive ${forbidden}`);
assert.ok(component.includes("onNavigate('Build Out')"),'R245 must delegate full build execution to the existing governed Build Out authority');
assert.ok(component.includes("onNavigate('Hybrid Link')"),'R245 must delegate private compute proof to existing Hybrid authority');
assert.ok(component.includes("data-r245-read-only='true'"));
assert.ok(mount.includes("import FullOverallCanonR245 from './FullOverallCanonR245'"));
assert.ok(mount.includes('<FullOverallCanonR245 onNavigate={onNavigate}/>'),'R245 must be mounted in the actual whole-system convergence surface');
assert.ok(mount.includes('<FullSystemCompletionR153 onNavigate={onNavigate}/>'),'R245 must preserve the existing governed R153 whole-system executor');
assert.ok(mount.indexOf('<FullOverallCanonR245')<mount.indexOf('<FullSystemCompletionR153'),'R245 observation context should precede, not replace, governed execution');

console.log('R245 FULL OVERALL CANON PASS · 7 axes · 7 strata · 12→144→1,728→20,736→248,832 logical/address scheduler · dependency-aware rapid build pressure · one read-only observation epoch · R125/R141/R146/R147/R239/R240/R210/R223/ci.yml authority preserved');
