import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA_NAVIGATION} from '../src/navigationRegistry.ts';
import {OMEGA7_FAMILY_CONTRACTS,OMEGA7_FAMILY_COVERAGE,omega7FamilyForRoute} from '../src7/familyParityR452.ts';

assert.equal(OMEGA7_FAMILY_CONTRACTS.length,8);
assert.equal(OMEGA7_FAMILY_COVERAGE.families,8);
assert.equal(OMEGA7_FAMILY_COVERAGE.routes,44);
assert.equal(OMEGA7_FAMILY_COVERAGE.inheritedRoutes,44);
assert.equal(OMEGA7_FAMILY_COVERAGE.complete,true);
assert.equal(OMEGA7_FAMILY_COVERAGE.canonicalMutation,false);

const routeSet=new Set(OMEGA7_FAMILY_CONTRACTS.flatMap(x=>x.routes));
assert.equal(routeSet.size,44);
assert.deepEqual(routeSet,new Set(OMEGA_NAVIGATION.map(x=>x.name)));
for(const route of routeSet){
 const family=omega7FamilyForRoute(route);
 assert.ok(family,route+' must resolve to one exact OMEGA7 native family');
 assert.ok(family?.routes.includes(route));
}
for(const family of OMEGA7_FAMILY_CONTRACTS){
 assert.ok(family.routes.includes(family.representativeRoute),family.id+' representative must belong to its own family');
 assert.equal(family.failureProof,'R452_FAMILY_LAZY_BOUNDARY');
 assert.equal(family.performanceProof,'R452_44_ROUTE_BROWSER_BUDGET');
 assert.equal(family.rollbackProof,'R449_SHELL_REVERSIBILITY');
}

const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const failure=fs.readFileSync('tests/omega7-r452-family-failure-e2e.mjs','utf8');
const perf=fs.readFileSync('tests/omega7-r452-full-performance-e2e.mjs','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI'),'R452 may not create a new workflow authority');
assert.ok(workflow.includes('omega7-r452-family-failure-e2e.mjs')&&workflow.includes('omega7-r452-full-performance-e2e.mjs'));
assert.ok(workflow.includes('omega7-user-parity:')&&workflow.includes('playwright@1.63.0'));
for(const token of ['COMMAND_RUNTIME','EARTH_WEATHER','MOTION_TRAVERSAL','SCIENCE_RELATIVITY_ATLAS','FORECAST_VISUAL_FIELD','WORK_CREATE_CONTINUITY','DEVELOPMENT_COMPUTE','SYSTEM_EVIDENCE_GOVERNANCE'])assert.ok(failure.includes(token),'R452 failure proof missing family '+token);
for(const token of ["page.route('**/assets/*.js'","requestRoute.abort('failed')","Your OMEGA state was not discarded.","alternate native route recovers"])assert.ok(failure.includes(token),'R452 family failure proof missing '+token);
for(const token of ['routes.length!==44','ROUTE_BUDGET_MS=8000','P95_BUDGET_MS=6000','for(const route of routes)'])assert.ok(perf.includes(token),'R452 full performance proof missing '+token);

assert.equal(lock.sourceMainSha,'4058ee07002dc78bba952711969afb33951a8b01');
assert.equal(lock.parityExpansionPhase,'R452_FULL_FAMILY_PARITY_CANDIDATE');
assert.equal(lock.activeWorkflowAuthorityIncrease,0);
assert.equal(lock.retirementState,'ZERO_LEGACY_SURFACES_RETIRED');

console.log('OMEGA7 R452 STATIC PASS · exact 8-family/44-route map · governed family failure proof · full-route performance proof · no workflow authority widening · zero retirement');
