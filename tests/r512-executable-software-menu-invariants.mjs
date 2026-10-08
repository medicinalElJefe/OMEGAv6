import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MASTER_SYSTEMS_R83} from '../src/softwareMasterLedgerR83.ts';
import {RECOVERED_SOFTWARE_EXECUTION_R512,RECOVERED_SOFTWARE_SUMMARY_R512,resolveRecoveredSoftwareR512} from '../src/recoveredSoftwareExecutionR512.ts';
import {capabilityExecutionContract} from '../src/operationalCapabilityRuntimeR45.ts';

assert.equal(MASTER_SYSTEMS_R83.length,100,'R512 must cover all 100 recovered software rows');
assert.equal(RECOVERED_SOFTWARE_EXECUTION_R512.length,100,'R512 execution registry must resolve all 100 rows');

const byId=new Map(RECOVERED_SOFTWARE_EXECUTION_R512.map(x=>[x.systemId,x]));
for(const row of MASTER_SYSTEMS_R83){
 const resolved=byId.get(row.id)||resolveRecoveredSoftwareR512(row);
 assert.ok(resolved,row.id+' missing execution resolution');
 if(row.disposition==='DONOR'){
  assert.equal(resolved.state,'ARCHIVE_ONLY',row.id+' donor must remain archive-only');
  assert.equal(resolved.launchable,false,row.id+' donor cannot pretend to execute');
  assert.equal(resolved.route,'Archive Operators',row.id+' donor must resolve to archive inspection');
 }else{
  assert.equal(resolved.launchable,true,row.id+' KEEP/MERGE software must have a current launchable successor');
  assert.ok(['WORKING_SUCCESSOR','GATED_SUCCESSOR'].includes(resolved.state),row.id+' has invalid current state '+resolved.state);
  const contract=capabilityExecutionContract(resolved.route);
  assert.equal(contract.routable,true,row.id+' successor route is not actually routable');
  assert.equal(contract.reality,resolved.executorReality,row.id+' executor reality drifted');
 }
}
assert.equal(RECOVERED_SOFTWARE_SUMMARY_R512.restorationRequired,0,'R512 must not leave KEEP/MERGE software as unbound display-only debt');
assert.equal(RECOVERED_SOFTWARE_SUMMARY_R512.total,100);
assert.equal(RECOVERED_SOFTWARE_SUMMARY_R512.working+RECOVERED_SOFTWARE_SUMMARY_R512.gated+RECOVERED_SOFTWARE_SUMMARY_R512.archiveOnly,100);

const inventory=fs.readFileSync('src/OmegaSystemInventoryR83.tsx','utf8');
for(const token of [
 "type Tab='RUNNING'",
 "{id:'RUNNING',label:'Software now'",
 "initialTab='RUNNING'",
 'RECOVERED_SOFTWARE_EXECUTION_R512',
 'recoveredSoftwareByIdR512',
 "window.dispatchEvent(new CustomEvent('omega-r512-software-launch'",
 "data-r512-software-state",
 "RUN SUCCESSOR",
 "GATED SUCCESSOR",
])assert.ok(inventory.includes(token),'R512 inventory missing '+token);

const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
for(const token of [
 "omega-r512-software-launch",
 "omega.r512.legacyLaunch",
 "r512-legacy-launch-context",
 "CONTINUED SOFTWARE",
 "current executor",
])assert.ok(workstation.includes(token),'R512 workstation context missing '+token);

const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
for(const token of [
 "r512-task-first-menu",
 "r512-task-row",
 "Choose your task",
 "r512-task-filter",
 "ARCHITECTURE",
 "Recovered OMEGA master menus",
 "Application workspace submenu",
])assert.ok(nav.includes(token),'R512 task-first navigation missing '+token);

const css=fs.readFileSync('src/omegaNavigationShellR411.css','utf8');
for(const token of [
 'R512 · TASK-FIRST NAVIGATION',
 '.r512-task-row',
 '.r512-task-filter',
 '.r512-architecture-row',
])assert.ok(css.includes(token),'R512 navigation CSS missing '+token);

console.log('R512 EXECUTABLE SOFTWARE PASS · 100 recovered systems resolved · KEEP/MERGE launch current executor · gated truth preserved · donors archive-only · task-first menu keeps architecture authority');
