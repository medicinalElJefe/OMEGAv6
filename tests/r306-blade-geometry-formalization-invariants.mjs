import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BLADE_GEOMETRY_R306_OPERATOR,BLADE_GEOMETRY_R306_TRUTH,bladeGeometryDemoR306,compileBladeGeometryR306} from '../src/bladeGeometryR306.js';

const source=fs.readFileSync('src/bladeGeometryR306.js','utf8');
const relativity=fs.readFileSync('src/RelativityLab.tsx','utf8');
const archive=fs.readFileSync('src/ArchiveNativeConvergenceR288.tsx','utf8');
const browser=fs.readFileSync('tests/r306-blade-geometry-browser-e2e.mjs','utf8');
const inheritedBrowser=fs.readFileSync('tests/r289-live-master-menu-browser-e2e.mjs','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const must=(ok,msg)=>assert.ok(ok,`R306 ${msg}`);

assert.equal(BLADE_GEOMETRY_R306_TRUTH.authority,'DETERMINISTIC_FINITE_SEARCH_REDUCTION_ONLY');
assert.equal(BLADE_GEOMETRY_R306_OPERATOR.length,6);
for(const token of [
 'SYSTEM = (GENERATOR, CONSTRAINTS, INVARIANTS, SYMMETRY, OBJECTIVE)',
 'GENERATOR / STATE SPACE','LEGAL TRANSITIONS / CONSTRAINTS','INVARIANT PARTITION','SYMMETRY / EQUIVALENCE QUOTIENT','REDUCED OBJECTIVE','LIFT TO ORIGINAL STATE SPACE',
 'INVARIANT_VIOLATION','ORBIT_CROSSES_INVARIANT_CLASS','OBJECTIVE_NOT_ORBIT_INVARIANT','ILLEGAL_TRANSITION_TARGET','DUPLICATE_STATE_ID',
 'No generic polynomial/constant-time claim','physical-geometry claim'
])must(source.includes(token),`formal operator source missing ${token}`);
for(const forbidden of ['Math.random','Date.now','performance.now','fetch(','api.post','localStorage'])must(!source.includes(forbidden),`formal operator must remain deterministic and authority-free; forbidden ${forbidden}`);
must(source.includes('owns no CanonState')&&source.includes('execution')&&source.includes('deployment'),'formal operator must explicitly deny system authority');

const demo=bladeGeometryDemoR306();
assert.equal(demo.exact,true);
assert.deepEqual(demo.counts,{states:12,invariantClasses:2,orbits:4,reducedStates:4,reduction:2/3});
assert.deepEqual(demo.reducedSolutions,['0']);
assert.deepEqual(demo.liftedSolutions,['0','4','8']);
assert.equal(demo.residuals.length,0);

const states=Array.from({length:12},(_,id)=>({id}));
const brute=states.filter(s=>s.id%4===0).map(s=>String(s.id)).sort();
assert.deepEqual(demo.liftedSolutions,brute,'exact quotient/lift result must equal direct objective evaluation on the declared finite state set');

const invariantFailure=compileBladeGeometryR306({states:[{id:0},{id:1}],idOf:s=>s.id,transitions:s=>s.id===0?[1]:[],invariantKey:s=>s.id,orbitKey:s=>s.id,objective:()=>false});
assert.equal(invariantFailure.exact,false);
must(invariantFailure.residuals.some(x=>x.kind==='INVARIANT_VIOLATION'),'must fail closed when a legal edge violates the declared invariant');
assert.deepEqual(invariantFailure.liftedSolutions,[]);

const missingTarget=compileBladeGeometryR306({states:[{id:0}],idOf:s=>s.id,transitions:()=>[7],invariantKey:()=>0,orbitKey:()=>0,objective:()=>true});
assert.equal(missingTarget.exact,false);
must(missingTarget.residuals.some(x=>x.kind==='ILLEGAL_TRANSITION_TARGET'),'must fail closed on undeclared transition targets');

const crossedOrbit=compileBladeGeometryR306({states:[{id:0},{id:1}],idOf:s=>s.id,transitions:()=>[],invariantKey:s=>s.id,orbitKey:()=>0,objective:()=>false});
assert.equal(crossedOrbit.exact,false);
must(crossedOrbit.residuals.some(x=>x.kind==='ORBIT_CROSSES_INVARIANT_CLASS'),'must not quotient an orbit across invariant classes');

const objectiveMismatch=compileBladeGeometryR306({states:[{id:0},{id:2}],idOf:s=>s.id,transitions:()=>[],invariantKey:()=>0,orbitKey:()=>0,objective:s=>s.id===0});
assert.equal(objectiveMismatch.exact,false);
must(objectiveMismatch.residuals.some(x=>x.kind==='OBJECTIVE_NOT_ORBIT_INVARIANT'),'must not representative-solve an orbit whose objective is not orbit-invariant');

const duplicate=compileBladeGeometryR306({states:[{id:0},{id:0}],idOf:s=>s.id,transitions:()=>[],invariantKey:()=>0,orbitKey:()=>0,objective:()=>false});
assert.equal(duplicate.exact,false);
must(duplicate.residuals.some(x=>x.kind==='DUPLICATE_STATE_ID'),'duplicate state identity must be a residual');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.equal(surfaces.length,44,'R306 must not add a 45th route');
assert.equal(new Set(surfaces).size,44,'R306 must not duplicate route identity');
must(relativity.includes("'BLADE'")&&relativity.includes('Blade Geometry')&&relativity.includes('bladeGeometryDemoR306'),'Blade must be visible inside the existing Relativity surface');
must(!relativity.includes("onNavigate?.('Blade"),'Blade formalization must not create a hidden/parallel route');
must(archive.includes('BLADE_GEOMETRY · FORMALIZED_BY_R306')&&archive.includes('Historical predecessor status is retained as provenance'),'Archive view must expose the recovered R306 successor without erasing R288 history');
for(const token of ['getByRole(\'button\',{name:\'BLADE\'','center-point unoccluded','>=44×44','Blade Geometry'])must(browser.includes(token),`Blade browser proof missing ${token}`);
must(inheritedBrowser.includes("await import('./r306-blade-geometry-browser-e2e.mjs')"),'R306 browser proof must execute through the existing bounded R289 browser lane, not a new workflow');

console.log('R306 BLADE GEOMETRY PASS · recovered SYSTEM=(generator,constraints,invariants,symmetry,objective) formalized as deterministic finite search reduction · transition invariant + quotient/orbit + objective-constancy gates fail closed · exact representative solve/lift equals brute finite objective on demonstration domain · archive successor visible without rewriting R288 history · real-browser Blade reachability chained through bounded R289 lane · no universal complexity/physical-law claim · no 45th route or new Canon/execution/deployment authority.');
