import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MASTER_SYSTEMS_R83} from '../src/softwareMasterLedgerR83';
import {RECOVERED_SYSTEM_EXECUTION_R512,RECOVERED_SYSTEM_SUMMARY_R512,resolveRecoveredSystemR512} from '../src/recoveredSoftwareExecutionR512';
import {recoveredSystemExecutionCapsuleR512,searchRecoveredSystemsR512,restoreRecoveredFocusR969} from '../src7/recoveredSystemSearchR512';

const original=JSON.parse(readFileSync('audit/omega-full-historical-software-ledger-r926.json','utf8'));
const native=readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const declaration=/OMEGA7_NATIVE_ROUTES=Object\.freeze\(\[([\s\S]*?)\] as const/.exec(native);
assert.ok(declaration,'native route declaration missing');
const routes=new Set([...declaration[1].matchAll(/'([^']+)'/g)].map(m=>m[1]));
assert.equal(MASTER_SYSTEMS_R83.length,100);
assert.equal(original.software.length,100);
assert.equal(RECOVERED_SYSTEM_EXECUTION_R512.length,100);
assert.equal(RECOVERED_SYSTEM_SUMMARY_R512.total,100);
const originals=new Map(original.software.map((row:any)=>[row.ID,row] as const));
const successors=new Map(RECOVERED_SYSTEM_EXECUTION_R512.map(row=>[row.systemId,row] as const));
assert.equal(successors.size,100,'duplicate successor IDs');
let working=0,gated=0,archived=0,restoring=0;
for(const row of MASTER_SYSTEMS_R83){
 const source:any=originals.get(row.id);
 const successor=successors.get(row.id);
 assert.ok(source,'missing original family '+row.id);
 assert.ok(successor,'missing governed successor '+row.id);
 assert.equal(source['Software / Artifact'],row.artifact,'artifact drift '+row.id);
 assert.equal(source.Disposition,row.disposition,'disposition drift '+row.id);
 assert.equal(source['Menu ID'],row.menu,'menu drift '+row.id);
 assert.equal(source['Upgrade Sequence'],row.sequence,'stage drift '+row.id);
 assert.deepEqual(resolveRecoveredSystemR512(row),successor,'non-deterministic successor '+row.id);
 assert.ok(routes.has(successor.route),'successor missing native route '+row.id);
 assert.ok(successor.executorProof&&successor.truth,'missing proof boundary '+row.id);
 const capsule=recoveredSystemExecutionCapsuleR512(successor,'2026-01-01T00:00:00.000Z');
 assert.equal(capsule.recoveredId,row.id);
 assert.equal(capsule.route,successor.route);
 assert.equal(capsule.sourceKind,'SYSTEM_LEDGER');
 assert.equal(capsule.canonicalMutation,false);
 assert.equal(capsule.receiptAuthority,'R142');
 assert.equal(capsule.admissionAuthority,'R125');
 if(row.disposition==='DONOR'){
  archived++;
  assert.equal(successor.state,'ARCHIVE_ONLY','DONOR incorrectly promoted '+row.id);
  assert.equal(successor.route,'Archive Operators');
  assert.equal(successor.launchable,false);
  assert.equal(capsule.launchKind,'ARCHIVE');
  assert.equal(capsule.state,'ARCHIVE_ONLY');
 }else if(successor.state==='WORKING_SUCCESSOR'){
  working++;
  assert.equal(successor.launchable,true);
  assert.equal(capsule.launchKind,'EXECUTE');
  assert.equal(capsule.state,'EXECUTES_NOW');
 }else if(successor.state==='GATED_SUCCESSOR'){
  gated++;
  assert.equal(successor.launchable,true);
  assert.equal(capsule.launchKind,'EVIDENCE_GATE');
  assert.equal(capsule.state,'TRUTH_GATED');
 }else{
  restoring++;
  assert.equal(successor.state,'RESTORATION_REQUIRED','unknown state '+row.id);
  assert.equal(successor.launchable,false);
  assert.equal(capsule.launchKind,'RESTORE');
 }
}
assert.equal(originals.size,100);
for(const row of RECOVERED_SYSTEM_EXECUTION_R512){
 assert.equal(searchRecoveredSystemsR512(row.systemId)[0]?.systemId,row.systemId,'exact system ID search');
 const canonical=recoveredSystemExecutionCapsuleR512(row,'2026-01-01T00:00:00.000Z');
 const altered=recoveredSystemExecutionCapsuleR512({...row,route:'Settings',state:'WORKING_SUCCESSOR',executorCapabilityId:'forged',executionDomain:'LOCAL'},'2026-01-01T00:00:00.000Z');
 assert.deepEqual(altered,canonical,'caller must not override canonical executor authority');
 assert.deepEqual(restoreRecoveredFocusR969({...canonical,route:'Settings',canonicalMutation:true,capabilityId:'forged'}),canonical,'stored focus cannot override source authority');
}
assert.equal(searchRecoveredSystemsR512('SYS-001 zzzzzunmatchedtoken').length,0);
assert.throws(()=>recoveredSystemExecutionCapsuleR512({...RECOVERED_SYSTEM_EXECUTION_R512[0],systemId:'UNKNOWN'}),/R512_UNKNOWN_HISTORICAL_SYSTEM_HELD/);
assert.equal(restoreRecoveredFocusR969({schema:'OMEGA_RECOVERED_EXECUTION_CAPSULE_R512',sourceKind:'SYSTEM_LEDGER',recoveredId:'UNKNOWN',createdAt:'2026-01-01T00:00:00Z'}),null);
assert.equal(restoreRecoveredFocusR969(null),null);
assert.equal(working,RECOVERED_SYSTEM_SUMMARY_R512.working);
assert.equal(gated,RECOVERED_SYSTEM_SUMMARY_R512.gated);
assert.equal(archived,RECOVERED_SYSTEM_SUMMARY_R512.archiveOnly);
assert.equal(restoring,RECOVERED_SYSTEM_SUMMARY_R512.restorationRequired);
assert.equal(working+gated+archived+restoring,100);
assert.equal(archived,11,'donor package never promoted to executable');
console.log('R935 PASS · 100 historical families · deterministic R512 successor capsules · true native route and proof-bound authority · 11 DONORs held.');

 // R978 real source-mode execution: absent values cannot be substituted by 0.
const {evaluateSourceBackedModes}=await import('../src/sourceBackedModeRuntimeR21');
const emptyModes=evaluateSourceBackedModes({});
assert.equal(emptyModes.length,20);
assert.ok(emptyModes.every(row=>row.state==='GATED_MISSING_INPUTS'&&row.value===null));
const explicitZero=evaluateSourceBackedModes({metrics:{continuity:0,plasticity:0,contradiction:0,burden:0}});
assert.equal(explicitZero.find(row=>row.id==='M001')?.state,'EXECUTED_EXACT');
assert.equal(explicitZero.find(row=>row.id==='M001')?.value,0);
for(const invalid of [null,'0',NaN,Infinity,undefined]){
 const rows=evaluateSourceBackedModes({metrics:{continuity:invalid,plasticity:0,contradiction:0,burden:0}});
 const m=rows.find(row=>row.id==='M001');assert.equal(m?.state,'GATED_MISSING_INPUTS');assert.deepEqual(m?.missing,['CΩ']);assert.equal(m?.value,null);
}
const invalidCoords=evaluateSourceBackedModes({coordinates:{d:12,p:0,r:0,l:0}});
assert.equal(invalidCoords.find(row=>row.id==='M015')?.state,'GATED_MISSING_INPUTS');
assert.equal(invalidCoords.find(row=>row.id==='M016')?.state,'GATED_MISSING_INPUTS');
const validCoords=evaluateSourceBackedModes({coordinates:{d:0,p:0,r:0,l:0}});
assert.equal(validCoords.find(row=>row.id==='M020')?.state,'EXECUTED_EXACT');
assert.equal(evaluateSourceBackedModes({autoPing:{dataNext:20736}}).find(row=>row.id==='M011')?.state,'GATED_MISSING_INPUTS');

 // R979 chart runs the actual hosted corpus, not generated surrogate values.
const {initCorpusPack,corpusState}=await import('../src/corpusRuntime');
const {chartSourceModeFieldR979,modeChartCSVHeaderR979,modeChartCSVRowR979}=await import('../src/sourceBackedModeRuntimeR21');
await initCorpusPack();
let chartCount=0;const chartStates=new Map<string,number>();
for(let start=0;start<20736;start+=144){
 const batch=chartSourceModeFieldR979(start,144);
 for(const row of batch){assert.equal(row.address,chartCount++);assert.equal(row.stateId,row.address+1);assert.equal(row.modes.length,20);for(const mode of row.modes){chartStates.set(mode.state,(chartStates.get(mode.state)||0)+1);if(mode.state==='GATED_MISSING_INPUTS')assert.equal(mode.value,null)}}
}
assert.equal(chartCount,20736);assert.equal([...chartStates.values()].reduce((a,b)=>a+b,0),414720);
const firstChart=chartSourceModeFieldR979(0,1)[0];
assert.deepEqual(firstChart.modes,evaluateSourceBackedModes(corpusState(0)));
assert.equal(modeChartCSVHeaderR979(firstChart.modes).split(',').length,72);
assert.ok(modeChartCSVRowR979(firstChart).startsWith('0,1,0,0,0,0,'));
for(const args of [[-1,1],[0,145],[20735,2],[0,0]])assert.throws(()=>chartSourceModeFieldR979(args[0],args[1]),RangeError);
console.log('R979 full canonical mode chart:',Object.fromEntries(chartStates));

 // R980: independent reference for the original workbook threshold order.
const {evaluateMode188DriveRuntimeR311,missingMode188InputsR980}=await import('../src/mode188DriveRuntimeR311');
for(const bad of [undefined,null,'0',NaN,Infinity,-1]){
 const record={coordinates:{d:0},metrics:{continuity:bad,burden:0,contradiction:0}};
 assert.deepEqual(missingMode188InputsR980(record),['CΩ']);
 assert.throws(()=>evaluateMode188DriveRuntimeR311(record),/required packet inputs invalid/);
}
assert.throws(()=>evaluateMode188DriveRuntimeR311({coordinates:{d:12},metrics:{continuity:0,burden:0,contradiction:0}}),/required packet inputs invalid/);
const explicitR311=(d:number,C:number,q:number,burden:number)=>evaluateMode188DriveRuntimeR311({coordinates:{d},metrics:{continuity:C,contradiction:q,burden}});
assert.equal(explicitR311(0,0,0,0).decision,'ESCALATE');
assert.equal(explicitR311(0,1,0,0).decision,'STAY');
assert.equal(explicitR311(9,1,0,0).decision,'TURN');
assert.equal(explicitR311(10,10,.6,0).decision,'ESCALATE');
let driveChecks=0,driveHeld=0;const driveDecisions:Record<string,number>={};
for(let start=0;start<20736;start+=144){
 for(const row of chartSourceModeFieldR979(start,144)){
  driveChecks++;
  if(!row.mode188Drive){driveHeld++;assert.ok(row.mode188Missing.length);continue}
  const d=row.mode188Drive,packet=corpusState(row.address),C=packet.metrics.continuity,L=packet.metrics.burden,q=packet.metrics.contradiction,D=packet.coordinates.d+1;
  const ratio=C/(L+q+.35*L*q+.05);
  const expected=ratio>=1.05&&D!==10&&D!==11?'STAY':ratio<.75||(D===11&&q>.5)?'ESCALATE':'TURN';
  assert.ok(Math.abs(d.sratio-ratio)<=1e-8);assert.equal(d.decision,expected);
  driveDecisions[expected]=(driveDecisions[expected]||0)+1;
 }
}
assert.equal(driveChecks,20736);
assert.equal(driveHeld+Object.values(driveDecisions).reduce((a,b)=>a+b,0),20736);
console.log('R980 independent R311 full field comparison:',{driveChecks,driveHeld,driveDecisions});
