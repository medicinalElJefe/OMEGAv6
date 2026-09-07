import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine=fs.readFileSync('scripts/r125-accuracy-engine.mjs','utf8');
const r125Workflow=fs.readFileSync('.github/workflows/r125-accuracy-first-engine.yml','utf8');
const r164Graph=fs.readFileSync('src/system/developmentResidualGraphR164.js','utf8');
const r164Reflex=fs.readFileSync('src/execution/reflexAutonomicSwarmR164.js','utf8');
const r164ReflexWorkflow=fs.readFileSync('.github/workflows/r164-reflex-autonomic-swarm-convergence.yml','utf8');
const manifest=JSON.parse(fs.readFileSync('public/omega-r165-residual-sensor-binding.json','utf8'));
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.equal(manifest.schema,'OMEGA_R125_RESIDUAL_SENSOR_BINDING_R165');
assert.equal(manifest.revision,'R165');
assert.equal(manifest.sensorOnly,true);
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.autonomousMutationAuthority,false);
assert.equal(manifest.addsRepairRecipes,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');

for(const token of [
 'R-R164-DEVELOPMENT-RESIDUAL-GRAPH-MISSING',
 'DEVELOPMENT_RESIDUAL_GRAPH_FAILURE',
 'r164ResidualGraphComplete',
 'R-R164-REFLEX-AUTONOMIC-SWARM-MISSING',
 'REFLEX_AUTONOMIC_SWARM_FAILURE',
 'r164ReflexAutonomicComplete',
 'developmentResidualGraphNeverAuthorizesRepair:true',
 'r164SensorFailuresNeverAutoRepair:true'
])assert.match(engine,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

const recipeBlock=engine.slice(engine.indexOf('const recipes=['),engine.indexOf('function mode('));
assert.equal(recipeBlock.includes('DEVELOPMENT_RESIDUAL_GRAPH_FAILURE'),false);
assert.equal(recipeBlock.includes('REFLEX_AUTONOMIC_SWARM_FAILURE'),false);
assert.match(recipeBlock,/CAPABILITY_UNWIRED/,'existing bounded repair surface must remain present');

for(const token of [
 'OMEGA R164 Development Residual Graph',
 'OMEGA R164 Reflex Autonomic Swarm Convergence',
 'r164-development-residual-graph-invariants.mjs',
 'r164-reflex-autonomic-swarm-convergence-invariants.mjs',
 'Observation only; no canonical mutation.',
 'main moved from $START to $CURRENT; refusing stale mutation'
])assert.ok(r125Workflow.includes(token),`R165 R125 workflow missing ${token}`);

assert.match(r164Graph,/OBSERVATION_IS_NOT_MUTATION/);
assert.match(r164Graph,/R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY/);
assert.match(r164Graph,/autonomousMutationAuthority:false/);
assert.match(r164Reflex,/canonicalAdmissionAuthority:'R125'/);
assert.match(r164Reflex,/canonicalMutation:false/);
assert.match(r164ReflexWorkflow,/r164-reflex-autonomic-browser-e2e\.mjs/,'concurrent R164 bridge must retain desktop/mobile browser proof');

assert.match(wrangler,/"main"\s*:\s*"src\/workerR116\.js"/,'R165 must preserve the proven R116 Worker entrypoint');

console.log('R165 residual sensor binding PASS · both R164 authorities feed R125 observation without new recipes, mutation authority, machine proof, or alternate CanonState admission');
