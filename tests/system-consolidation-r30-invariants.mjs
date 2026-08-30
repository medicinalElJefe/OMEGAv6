import assert from 'node:assert/strict';
import fs from 'node:fs';
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
assert.match(authority,/'Plugins':'DONOR_ONLY'/);
assert.doesNotMatch(app,/@appdeploy\/client|appdeploy\.ai/i);
console.log('R30 SYSTEM CONSOLIDATION PASS · shared instructions · consumed settings · live system diagnostics · non-mutating consolidation');
