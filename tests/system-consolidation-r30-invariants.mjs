import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const suite=read('src/OmegaSpecialistSuite.tsx');
const app=read('src/OmegaSystemConsolidationR30.tsx');
const css=read('src/omegaSystemConsolidationR30.css');
const authority=read('src/capabilityAuthority.ts');
for(const route of ['Instructions','Settings','System','Consolidation']){
 assert.match(suite,new RegExp(route),`R30 specialist router missing ${route}`);
 assert.match(authority,new RegExp(`name:'${route}'.*implementation:'SPECIALIST'`),`${route} must be specialist`);
}
for(const token of ['OMEGA_NAVIGATION','CAPABILITY_BY_NAME','omega.v6.settings.r30','omegaDensity','omegaMotion','/api/status','/api/release-evidence','/omega-build-receipt.json','localStorage.length','OMEGA_CONSOLIDATION_R30','PLAN_ONLY_NO_SOURCE_MUTATION'])assert.match(app,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`R30 system contract missing ${token}`);
assert.match(app,/document\.documentElement/);
assert.match(app,/dataset\.omegaDensity/);
assert.match(app,/dataset\.omegaMotion/);
assert.match(css,/data-omega-density='comfortable'/);
assert.match(css,/data-omega-motion='reduced'/);
assert.match(css,/--omega-user-font-scale/);
assert.match(authority,/'Consolidation':'LOCAL_ACTIVE'/);
assert.match(authority,/CAPABILITY_PREDECESSOR_REALITY_R23/);
assert.match(authority,/'Plugins':'DONOR_ONLY'/,'Plugin donor predecessor must remain preserved as historical evidence');
assert.match(authority,/'Plugins':'LOCAL_ACTIVE'/,'R168 current Plugin registry successor must be locally active');
assert.doesNotMatch(app,/@appdeploy\/client|appdeploy\.ai/i);

// R314 is an extension of this existing Consolidation proof owner, not a shadow workflow.
assert.match(suite,/OmegaConvergenceMasterR314/,'R314 convergence master must remain wired into Consolidation');
for(const test of ['tests/r314-convergence-master-invariants.mjs','tests/r314-autonomous-convergence-invariants.mjs','tests/r314-runtime-executable-invariants.mjs']){
 const result=spawnSync(process.execPath,[test],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
 assert.equal(result.status,0,`${test} failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
 process.stdout.write(result.stdout);
}
console.log('R168/R314 SYSTEM CONSOLIDATION PASS · shared instructions · consumed settings · live system diagnostics · convergence charts · executable sync/motion/canon proof · non-mutating consolidation');
