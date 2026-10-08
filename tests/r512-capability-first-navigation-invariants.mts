import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 R512_DOMAIN_MENU,R512_MENU_SUMMARY,menuSectionsR512,recoveredForDomainR512,recoveredExecutionCapsuleR512,recoveredSystemExecutionCapsuleR512,searchRecoveredSystemsR512
} from '../src7/capabilityMenuR512.ts';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {R486_VISIBLE_CAPABILITIES} from '../src7/visibleCapabilityConvergenceR486.ts';
import {RECOVERED_SYSTEM_EXECUTION_R512,RECOVERED_SYSTEM_SUMMARY_R512} from '../src/recoveredSoftwareExecutionR512.ts';

assert.equal(R512_DOMAIN_MENU.length,6,'R512 must preserve six simple human navigation areas');
assert.deepEqual(R512_DOMAIN_MENU.map(x=>x.id),['HOME','WORK','EXPLORE','CREATE','DEVELOP','SYSTEM']);
assert.equal(R512_MENU_SUMMARY.routes,OMEGA7_CAPABILITIES.length);
assert.equal(R512_MENU_SUMMARY.recovered,R486_VISIBLE_CAPABILITIES.length);
assert.ok(R512_MENU_SUMMARY.executableRecovered>0);
assert.ok(R512_MENU_SUMMARY.gatedRecovered>0);

for(const menu of R512_DOMAIN_MENU){
 const sections=menuSectionsR512(menu.id);
 assert.equal(sections.ready.length+sections.gated.length,menu.id==='HOME'?OMEGA7_CAPABILITIES.length:OMEGA7_CAPABILITIES.filter(x=>x.domain===menu.id).length,menu.id+' menu lost capabilities');
 if(menu.id!=='HOME')assert.ok(sections.ready.length>0,menu.id+' must expose usable quick actions');
 const recovered=recoveredForDomainR512(menu.id);
 if(menu.id!=='HOME')assert.ok(recovered.length>0,menu.id+' must expose resolved historical software where applicable');
}

for(const entry of R486_VISIBLE_CAPABILITIES){
 assert.ok(entry.capabilityId,'recovered entry missing concrete capability executor '+entry.id);
 assert.ok(entry.executionDomain,'recovered entry missing execution domain '+entry.id);
 assert.ok(entry.truthBoundary,'recovered entry missing truth boundary '+entry.id);
 const capsule=recoveredExecutionCapsuleR512(entry,'2026-10-08T00:00:00.000Z');
 assert.equal(capsule.recoveredId,entry.id);
 assert.equal(capsule.route,entry.route);
 assert.equal(capsule.operation,entry.operation);
 assert.equal(capsule.capabilityId,entry.capabilityId);
 assert.equal(capsule.receiptAuthority,'R142');
 assert.equal(capsule.admissionAuthority,'R125');
 assert.equal(capsule.canonicalMutation,false);
 if(entry.state!=='TRUTH_GATED')assert.ok(entry.routable,'executable recovered software must resolve to a current routable executor '+entry.id);
}

assert.equal(R512_MENU_SUMMARY.reviewedSystems,100);
assert.equal(RECOVERED_SYSTEM_EXECUTION_R512.length,100);
assert.equal(RECOVERED_SYSTEM_SUMMARY_R512.keepMerge+RECOVERED_SYSTEM_SUMMARY_R512.donor,100);
assert.equal(RECOVERED_SYSTEM_SUMMARY_R512.restorationRequired,0,'every KEEP/MERGE historical system must resolve to a current working or truth-gated successor');

for(const row of RECOVERED_SYSTEM_EXECUTION_R512){
 const capsule=recoveredSystemExecutionCapsuleR512(row,'2026-10-08T00:00:00.000Z');
 assert.equal(capsule.recoveredId,row.systemId);
 assert.equal(capsule.sourceKind,'SYSTEM_LEDGER');
 assert.equal(capsule.receiptAuthority,'R142');
 assert.equal(capsule.admissionAuthority,'R125');
 if(row.disposition==='DONOR'){
  assert.equal(row.state,'ARCHIVE_ONLY');
  assert.equal(capsule.launchKind,'ARCHIVE');
  assert.equal(capsule.route,'Archive Operators');
 }else{
  assert.ok(['WORKING_SUCCESSOR','GATED_SUCCESSOR'].includes(row.state),row.systemId+' must have a proved current successor or explicit evidence gate');
  assert.ok(row.launchable,row.systemId+' KEEP/MERGE historical software must not remain display-only');
  assert.ok(['EXECUTE','EVIDENCE_GATE'].includes(capsule.launchKind));
 }
}

const atlasDesktop=searchRecoveredSystemsR512('Omega Atlas Desktop');
assert.ok(atlasDesktop.some(x=>x.systemId==='SYS-002'&&x.route==='System'&&x.state==='WORKING_SUCCESSOR'),'Omega Atlas Desktop must resolve directly to the current System executor');
const donorSearch=searchRecoveredSystemsR512('CanonConsoleOmega_v32_Final_Complete_Package');
assert.ok(donorSearch.some(x=>x.systemId==='SYS-012'&&x.state==='ARCHIVE_ONLY'),'donor-only package must remain searchable as archive lineage without a false execution claim');

const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
for(const token of [
 "R512_DOMAIN_MENU",
 "recoveredExecutionCapsuleR512",
 "omega-r512-execute-capability",
 "data-r512-executor",
 "data-r512-recovered-launch",
 "Resolved historical software",
 "Previous software, resolved to current executors",
 "Ready now",
 "Needs evidence / connection",
 "Search previous software",
 "data-r512-system-launch",
 "working successors"
])assert.ok(root.includes(token),'R512 UI integration missing '+token);

assert.equal(root.includes("button onClick={()=>open(x.route)}>Open {x.route}</button>"),false,'recovered software must not fall back to a generic route-only button');
assert.ok(root.includes("launchRecovered(x)"),'recovered software must use the resolved execution launcher');

const css=fs.readFileSync('src7/omega7.css','utf8');
for(const token of [
 "R512 · CAPABILITY-FIRST NAVIGATION + RESOLVED HISTORICAL EXECUTION",
 ".o7-nav-r512",
 ".o7-quick-menu",
 ".o7-domain-recovered",
 ".o7-executor-capsule",
 ".o7-capability-group-title"
])assert.ok(css.includes(token),'R512 menu/executor presentation missing '+token);

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.ok(ci.includes('r512-capability-menu-execution-browser-e2e.mjs'),'R512 browser execution proof must be deployment-gating');

console.log('R512 CAPABILITY-FIRST NAVIGATION PASS · six organized human areas · 72 capability lineages + 100 reviewed systems · every KEEP/MERGE system resolves working/gated successor · donors archive-only · R142/R125 proof chain retained');
