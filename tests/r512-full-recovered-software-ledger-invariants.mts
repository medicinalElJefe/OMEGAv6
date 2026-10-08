import assert from 'node:assert/strict';
import {MASTER_SYSTEMS_R83} from '../src/softwareMasterLedgerR83.ts';
import {RECOVERED_SYSTEM_EXECUTION_R512,RECOVERED_SYSTEM_SUMMARY_R512} from '../src/recoveredSoftwareExecutionR512.ts';
import {R512_ALL_PREVIOUS_SOFTWARE,R512_LEDGER_SOFTWARE,R512_MENU_SUMMARY,searchExecutableMenuR512} from '../src7/executableMenuR512.ts';
import {capabilityExecutionContract} from '../src/operationalCapabilityRuntimeR45.ts';

assert.equal(MASTER_SYSTEMS_R83.length,100);
assert.equal(RECOVERED_SYSTEM_EXECUTION_R512.length,100);
assert.equal(RECOVERED_SYSTEM_SUMMARY_R512.keepMerge,89);
assert.equal(RECOVERED_SYSTEM_SUMMARY_R512.donor,11);
assert.equal(R512_LEDGER_SOFTWARE.length,100);
assert.equal(R512_MENU_SUMMARY.reviewedSystemLedgerCount,100);
assert.equal(R512_MENU_SUMMARY.reviewedKeepMergeCount,89);
assert.equal(R512_MENU_SUMMARY.reviewedDonorCount,11);

for(const row of RECOVERED_SYSTEM_EXECUTION_R512){
 if(row.disposition==='DONOR'){
  assert.equal(row.state,'ARCHIVE_ONLY',row.systemId+' donor state');
  assert.equal(row.launchable,false,row.systemId+' donor launchability');
  assert.equal(row.route,'Archive Operators',row.systemId+' donor archive route');
  continue;
 }
 assert.ok(['WORKING_SUCCESSOR','GATED_SUCCESSOR'].includes(row.state),row.systemId+' unresolved KEEP/MERGE successor '+row.state);
 assert.equal(row.launchable,true,row.systemId+' KEEP/MERGE must have a current successor surface');
 const contract=capabilityExecutionContract(row.route);
 assert.equal(contract.routable,true,row.systemId+' successor must be routable');
 assert.equal(contract.reality,row.executorReality,row.systemId+' successor reality mismatch');
}
assert.equal(RECOVERED_SYSTEM_SUMMARY_R512.restorationRequired,0,'No KEEP/MERGE recovered system may remain a display-only row');

const atlas=searchExecutableMenuR512('Omega Atlas Desktop','HOME').filter(x=>x.kind==='SOFTWARE');
assert.ok(atlas.some(x=>x.software.id==='SYS-002'&&x.software.route==='System'&&x.software.launchState==='LIVE'),'ledger-only Omega Atlas Desktop must resolve to current System executor');
const donor=searchExecutableMenuR512('CanonConsoleOmega_v32_Final_Complete_Package','HOME').filter(x=>x.kind==='SOFTWARE');
assert.ok(donor.some(x=>x.software.id==='SYS-012'&&x.software.route==='Archive Operators'&&x.software.launchState==='ARCHIVE'),'donor package must resolve to archive inspection, not live execution');

const ids=new Set(R512_ALL_PREVIOUS_SOFTWARE.map(x=>x.id));
assert.equal(ids.size,R512_ALL_PREVIOUS_SOFTWARE.length,'unified previous-software search IDs must remain unique');

console.log('R512 FULL RECOVERED SOFTWARE LEDGER PASS · 100/100 reviewed systems classified · 89 KEEP/MERGE current successors · 11 donor archive-only · no display-only KEEP/MERGE rows');
